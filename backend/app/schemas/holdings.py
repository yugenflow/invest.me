from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime


class HoldingCreate(BaseModel):
    asset_class_code: str
    symbol: Optional[str] = None
    name: str
    quantity: float = 0
    avg_buy_price: float = 0
    buy_currency: str = "INR"
    exchange: Optional[str] = None
    buy_date: Optional[date] = None
    maturity_date: Optional[date] = None
    interest_rate: Optional[float] = None
    institution: Optional[str] = None
    sebi_category: Optional[str] = None


class HoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    quantity: Optional[float] = None
    avg_buy_price: Optional[float] = None
    buy_currency: Optional[str] = None
    exchange: Optional[str] = None
    buy_date: Optional[date] = None
    maturity_date: Optional[date] = None
    interest_rate: Optional[float] = None
    institution: Optional[str] = None
    sebi_category: Optional[str] = None


class HoldingResponse(BaseModel):
    id: UUID
    user_id: UUID
    asset_class_code: str
    symbol: Optional[str] = None
    name: str
    quantity: float
    avg_buy_price: float
    buy_currency: str
    exchange: Optional[str] = None
    buy_date: Optional[date] = None
    maturity_date: Optional[date] = None
    interest_rate: Optional[float] = None
    institution: Optional[str] = None
    sebi_category: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AssetClassResponse(BaseModel):
    code: str
    name: str
    category: str
    fields_schema: Optional[dict] = None

    model_config = {"from_attributes": True}
