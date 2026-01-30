import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.schemas.holdings import HoldingResponse
from app.utils.security import get_current_user
from app.services.csv_parser import parse_csv, _find_header_row
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/import", tags=["import"])


class CsvPreviewResponse(BaseModel):
    rows: list[dict]
    count: int
    detected_broker: Optional[str] = None
    confidence: float = 0.0
    headers: Optional[list[str]] = None


class CsvConfirmRequest(BaseModel):
    rows: list[dict]
    broker: str


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


@router.post("/csv/confirm", response_model=list[HoldingResponse])
async def confirm_csv_import(
    request: CsvConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    created = []
    for row in request.rows:
        holding = Holding(
            user_id=current_user.id,
            asset_class_code=row.get("asset_class_code", "EQUITY_IN"),
            symbol=row.get("symbol"),
            name=row.get("name", row.get("symbol", "")),
            quantity=float(row.get("quantity", 0)),
            avg_buy_price=float(row.get("avg_buy_price", 0)),
            buy_currency=row.get("buy_currency", "INR"),
            exchange=row.get("exchange"),
        )
        db.add(holding)
        await db.flush()

        transaction = Transaction(
            user_id=current_user.id,
            holding_id=holding.id,
            type="buy",
            symbol=row.get("symbol"),
            quantity=float(row.get("quantity", 0)),
            price=float(row.get("avg_buy_price", 0)),
            currency=row.get("buy_currency", "INR"),
            total_amount=float(row.get("quantity", 0)) * float(row.get("avg_buy_price", 0)),
            broker=request.broker,
        )
        db.add(transaction)
        created.append(holding)

    await db.flush()
    return created
