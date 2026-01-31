import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.schemas.holdings import HoldingCreate, HoldingUpdate, HoldingResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/holdings", tags=["holdings"])


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


@router.post("", response_model=HoldingResponse, status_code=201)
async def create_holding(
    request: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    holding = Holding(
        user_id=current_user.id,
        **request.model_dump(),
    )
    db.add(holding)

    # Create a buy transaction
    transaction = Transaction(
        user_id=current_user.id,
        holding_id=holding.id,
        type="buy",
        symbol=request.symbol,
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


from pydantic import BaseModel


class BulkDeleteRequest(BaseModel):
    ids: list[uuid.UUID]


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
