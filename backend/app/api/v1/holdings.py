import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.schemas.holdings import HoldingCreate, HoldingUpdate, HoldingResponse
from app.utils.security import get_current_user
from app.redis import get_redis
from app.services.mf_resolver import resolve_mf_ticker
from app.services.duplicate_service import get_duplicate_groups, compute_merge

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/holdings", tags=["holdings"])


class BulkDeleteRequest(BaseModel):
    ids: list[uuid.UUID]


class MergeGroupRequest(BaseModel):
    group_keys: list[list[str]]  # Each inner list is a list of holding IDs to merge


@router.get("", response_model=list[HoldingResponse])
async def list_holdings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Holding)
        .where(Holding.user_id == current_user.id, Holding.is_active == True)
        .order_by(Holding.created_at.desc())
    )
    return result.scalars().all()


# --- Static path routes MUST come before /{holding_id} ---

@router.get("/duplicates")
async def list_duplicate_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return groups of holdings that share the same symbol+asset_class."""
    groups = await get_duplicate_groups(db, current_user.id)
    return {"groups": groups}


@router.post("/merge-duplicates")
async def merge_duplicate_groups(
    request: MergeGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Merge each group of duplicate holdings. Keeps the oldest, deactivates the rest."""
    merged_count = 0
    for id_list in request.group_keys:
        if len(id_list) < 2:
            continue
        result = await db.execute(
            select(Holding).where(
                Holding.id.in_(id_list),
                Holding.user_id == current_user.id,
                Holding.is_active == True,
            ).order_by(Holding.created_at.asc())
        )
        group_holdings = result.scalars().all()
        if len(group_holdings) < 2:
            continue

        keeper = group_holdings[0]
        for other in group_holdings[1:]:
            merged_qty, merged_price = compute_merge(
                keeper.quantity, keeper.avg_buy_price,
                other.quantity, other.avg_buy_price,
            )
            keeper.quantity = merged_qty
            keeper.avg_buy_price = merged_price
            other.is_active = False

        transaction = Transaction(
            user_id=current_user.id,
            holding_id=keeper.id,
            type="buy",
            symbol=keeper.symbol,
            quantity=keeper.quantity,
            price=keeper.avg_buy_price,
            currency=keeper.buy_currency,
            total_amount=keeper.quantity * keeper.avg_buy_price,
            broker="merge",
        )
        db.add(transaction)
        merged_count += 1

    await db.flush()
    return {"merged_groups": merged_count}


@router.post("/bulk-delete", status_code=204)
async def bulk_delete_holdings(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Holding).where(
            Holding.id.in_(request.ids),
            Holding.user_id == current_user.id,
            Holding.is_active == True,
        )
    )
    holdings = result.scalars().all()
    if not holdings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No holdings found")
    for holding in holdings:
        holding.is_active = False
    await db.flush()


# --- Parameterized routes below ---

@router.post("", response_model=HoldingResponse, status_code=201)
async def create_holding(
    request: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    holding_data = request.model_dump()

    # Auto-resolve MF symbol if not provided
    if request.asset_class_code == "MUTUAL_FUND" and not request.symbol and request.name:
        try:
            redis = await get_redis()
            resolved = await resolve_mf_ticker(request.name, redis)
            if resolved:
                holding_data["symbol"] = resolved["yf_ticker"]
                logger.info(f"Auto-resolved MF '{request.name}' → {resolved['yf_ticker']}")
        except Exception as e:
            logger.warning(f"MF resolution failed for '{request.name}': {e}")

    holding = Holding(
        user_id=current_user.id,
        **holding_data,
    )
    db.add(holding)

    # Create a buy transaction
    transaction = Transaction(
        user_id=current_user.id,
        holding_id=holding.id,
        type="buy",
        symbol=holding_data.get("symbol") or request.symbol,
        quantity=request.quantity,
        price=request.avg_buy_price,
        currency=request.buy_currency,
        total_amount=request.quantity * request.avg_buy_price,
        transaction_date=request.buy_date,
    )
    db.add(transaction)
    await db.flush()
    return holding


@router.get("/{holding_id}", response_model=HoldingResponse)
async def get_holding(
    holding_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id, Holding.user_id == current_user.id)
    )
    holding = result.scalar_one_or_none()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")
    return holding


@router.patch("/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: uuid.UUID,
    request: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id, Holding.user_id == current_user.id)
    )
    holding = result.scalar_one_or_none()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)
    await db.flush()
    return holding


@router.delete("/{holding_id}", status_code=204)
async def delete_holding(
    holding_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Holding).where(Holding.id == holding_id, Holding.user_id == current_user.id)
    )
    holding = result.scalar_one_or_none()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")
    # Soft delete
    holding.is_active = False
    await db.flush()


