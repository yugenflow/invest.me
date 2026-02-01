from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services import portfolio_service
from app.redis import get_redis

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary")
async def portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    return await portfolio_service.get_portfolio_summary(db, current_user.id, redis=redis)


@router.get("/allocation")
async def portfolio_allocation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    return await portfolio_service.get_allocation(db, current_user.id, redis=redis)


@router.get("/performance")
async def portfolio_performance(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    return await portfolio_service.get_performance(db, current_user.id, days, redis=redis)
