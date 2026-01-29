from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.asset_class import AssetClass
from app.schemas.holdings import AssetClassResponse

router = APIRouter(prefix="/asset-classes", tags=["asset-classes"])


@router.get("", response_model=list[AssetClassResponse])
async def list_asset_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AssetClass).order_by(AssetClass.code))
    return result.scalars().all()
