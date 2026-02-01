import asyncio
import json
import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.schemas.holdings import HoldingResponse
from app.utils.security import get_current_user
from app.services.csv_parser import parse_csv, _find_header_row
from app.redis import get_redis
from app.services.mf_resolver import resolve_mf_ticker, _search_yahoo_by_isin
from pydantic import BaseModel
from typing import Optional
from app.services.duplicate_service import find_duplicate_holding, compute_merge

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/import", tags=["import"])


class CsvPreviewResponse(BaseModel):
    rows: list[dict]
    count: int
    detected_broker: Optional[str] = None
    confidence: float = 0.0
    headers: Optional[list[str]] = None


class RowAction(BaseModel):
    action: str = "create"  # "create" | "merge" | "replace" | "skip"
    existing_holding_id: Optional[str] = None


class CsvConfirmRequest(BaseModel):
    rows: list[dict]
    broker: str
    actions: Optional[list[RowAction]] = None


class CheckDuplicatesRequest(BaseModel):
    rows: list[dict]


class DuplicateInfo(BaseModel):
    row_index: int
    incoming_symbol: Optional[str] = None
    incoming_name: Optional[str] = None
    incoming_quantity: float = 0
    incoming_avg_price: float = 0
    existing: dict
    merged_quantity: float = 0
    merged_avg_price: float = 0


class CheckDuplicatesResponse(BaseModel):
    duplicates: list[DuplicateInfo]
    clean_count: int


@router.post("/csv", response_model=CsvPreviewResponse)
async def upload_csv(
    file: UploadFile = File(...),
    broker: Optional[str] = Form(None),
    column_mapping: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")

    content = await file.read()
    text = content.decode("utf-8-sig")  # utf-8-sig handles BOM from Excel exports

    # Parse column_mapping from JSON string if provided
    mapping = None
    if column_mapping:
        try:
            mapping = json.loads(column_mapping)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid column_mapping JSON")

    try:
        rows, detected_broker, confidence = parse_csv(
            text,
            broker=broker if broker else None,
            column_mapping=mapping,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Extract cleaned headers for column mapping UI when auto-detect fails
    headers = None
    if not rows:
        try:
            _idx, headers = _find_header_row(text)
        except Exception:
            headers = []

    if not rows and not headers:
        raise HTTPException(status_code=400, detail="No valid data found in CSV")

    return CsvPreviewResponse(
        rows=rows,
        count=len(rows),
        detected_broker=detected_broker,
        confidence=confidence,
        headers=headers,
    )


@router.post("/check-duplicates", response_model=CheckDuplicatesResponse)
async def check_duplicates(
    request: CheckDuplicatesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check which import rows conflict with existing holdings."""
    duplicates = []
    for i, row in enumerate(request.rows):
        symbol = row.get("symbol") or None
        asset_class_code = row.get("asset_class_code", "EQUITY_IN")
        name = row.get("name", "")
        qty = float(row.get("quantity", 0) or 0)
        price = float(row.get("avg_buy_price", 0) or 0)

        existing = await find_duplicate_holding(db, current_user.id, symbol, asset_class_code, name)
        if existing:
            merged_qty, merged_price = compute_merge(existing.quantity, existing.avg_buy_price, qty, price)
            duplicates.append(DuplicateInfo(
                row_index=i,
                incoming_symbol=symbol,
                incoming_name=name,
                incoming_quantity=qty,
                incoming_avg_price=price,
                existing={
                    "id": str(existing.id),
                    "symbol": existing.symbol,
                    "name": existing.name,
                    "quantity": existing.quantity,
                    "avg_buy_price": existing.avg_buy_price,
                    "asset_class_code": existing.asset_class_code,
                    "buy_currency": existing.buy_currency,
                },
                merged_quantity=merged_qty,
                merged_avg_price=merged_price,
            ))
    return CheckDuplicatesResponse(
        duplicates=duplicates,
        clean_count=len(request.rows) - len(duplicates),
    )


@router.post("/csv/confirm", response_model=list[HoldingResponse])
async def confirm_csv_import(
    request: CsvConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    redis = await get_redis()
    created = []
    actions = request.actions or []

    for idx, row in enumerate(request.rows):
        # Determine the action for this row
        action = actions[idx] if idx < len(actions) else RowAction()

        if action.action == "skip":
            continue

        symbol = row.get("symbol") or None
        asset_class_code = row.get("asset_class_code", "EQUITY_IN")
        name = row.get("name", row.get("symbol", ""))
        qty = float(row.get("quantity", 0) or 0)
        price = float(row.get("avg_buy_price", 0) or 0)

        # Auto-resolve MF symbol if not provided
        if asset_class_code == "MUTUAL_FUND" and not symbol and name:
            try:
                resolved = await resolve_mf_ticker(name, redis)
                if resolved:
                    symbol = resolved["yf_ticker"]
                    logger.info(f"Auto-resolved MF '{name}' → {symbol}")
            except Exception as e:
                logger.warning(f"MF resolution failed for '{name}': {e}")

        # Handle merge and replace actions
        if action.action in ("merge", "replace") and action.existing_holding_id:
            existing_result = await db.execute(
                select(Holding).where(
                    Holding.id == action.existing_holding_id,
                    Holding.user_id == current_user.id,
                    Holding.is_active == True,
                )
            )
            existing = existing_result.scalar_one_or_none()
            if not existing:
                # Fallback to create if existing not found
                action.action = "create"
            else:
                if action.action == "merge":
                    merged_qty, merged_price = compute_merge(
                        existing.quantity, existing.avg_buy_price, qty, price
                    )
                    existing.quantity = merged_qty
                    existing.avg_buy_price = merged_price
                    if name:
                        existing.name = name
                else:  # replace
                    existing.quantity = qty
                    existing.avg_buy_price = price
                    if name:
                        existing.name = name
                    if symbol:
                        existing.symbol = symbol

                # Create transaction for the incoming portion
                transaction = Transaction(
                    user_id=current_user.id,
                    holding_id=existing.id,
                    type="buy",
                    symbol=symbol or existing.symbol,
                    quantity=qty,
                    price=price,
                    currency=row.get("buy_currency", "INR"),
                    total_amount=qty * price,
                    broker=request.broker,
                )
                db.add(transaction)
                await db.flush()
                created.append(existing)
                continue

        # Default: create new holding
        holding_kwargs: dict = dict(
            user_id=current_user.id,
            asset_class_code=asset_class_code,
            symbol=symbol,
            name=name,
            quantity=qty,
            avg_buy_price=price,
            buy_currency=row.get("buy_currency", "INR"),
            exchange=row.get("exchange") or None,
        )
        # Optional fields for specific asset classes
        if row.get("interest_rate"):
            holding_kwargs["interest_rate"] = float(row["interest_rate"])
        if row.get("maturity_date"):
            holding_kwargs["maturity_date"] = row["maturity_date"]
        if row.get("institution"):
            holding_kwargs["institution"] = row["institution"]
        if row.get("buy_date"):
            holding_kwargs["buy_date"] = row["buy_date"]
        if row.get("sebi_category"):
            holding_kwargs["sebi_category"] = row["sebi_category"]

        holding = Holding(**holding_kwargs)
        db.add(holding)
        await db.flush()

        transaction = Transaction(
            user_id=current_user.id,
            holding_id=holding.id,
            type="buy",
            symbol=symbol or row.get("symbol"),
            quantity=qty,
            price=price,
            currency=row.get("buy_currency", "INR"),
            total_amount=qty * price,
            broker=request.broker,
        )
        db.add(transaction)
        created.append(holding)

    await db.flush()
    return created


# --- MF Resolution endpoints ---

class ResolveMfRequest(BaseModel):
    fund_names: list[str]


class ResolveMfResult(BaseModel):
    fund_name: str
    resolved: bool
    yf_ticker: Optional[str] = None
    isin: Optional[str] = None
    matched_name: Optional[str] = None


class ResolveMfResponse(BaseModel):
    results: list[ResolveMfResult]


class ResolveIsinRequest(BaseModel):
    isin: str


class ResolveIsinResponse(BaseModel):
    resolved: bool
    yf_ticker: Optional[str] = None


@router.post("/resolve-mf", response_model=ResolveMfResponse)
async def resolve_mf_names(
    request: ResolveMfRequest,
    current_user: User = Depends(get_current_user),
):
    """Batch resolve mutual fund names to Yahoo Finance tickers."""
    redis = await get_redis()

    async def _resolve_one(name: str) -> ResolveMfResult:
        try:
            result = await resolve_mf_ticker(name, redis)
            if result:
                return ResolveMfResult(
                    fund_name=name,
                    resolved=True,
                    yf_ticker=result["yf_ticker"],
                    isin=result.get("isin"),
                    matched_name=result.get("matched_name"),
                )
        except Exception as e:
            logger.warning(f"MF resolution failed for '{name}': {e}")
        return ResolveMfResult(fund_name=name, resolved=False)

    results = await asyncio.gather(*[_resolve_one(n) for n in request.fund_names])
    return ResolveMfResponse(results=list(results))


@router.post("/resolve-isin", response_model=ResolveIsinResponse)
async def resolve_isin(
    request: ResolveIsinRequest,
    current_user: User = Depends(get_current_user),
):
    """Resolve a single ISIN to a Yahoo Finance ticker."""
    isin = request.isin.strip().upper()
    if not isin:
        raise HTTPException(status_code=400, detail="ISIN is required")

    yf_ticker = _search_yahoo_by_isin(isin)
    if yf_ticker:
        # Ensure .BO suffix for Indian MFs
        if not yf_ticker.endswith(".BO") and not yf_ticker.endswith(".NS"):
            yf_ticker = f"{yf_ticker}.BO"
        return ResolveIsinResponse(resolved=True, yf_ticker=yf_ticker)
    return ResolveIsinResponse(resolved=False)
