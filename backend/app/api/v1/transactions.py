from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.utils.security import get_current_user
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    holding_id: Optional[UUID] = None
    type: str
    symbol: Optional[str] = None
    quantity: float
    price: float
    currency: str
    total_amount: float
    fees: float
    transaction_date: Optional[date] = None
    broker: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
    )
    return result.scalars().all()
