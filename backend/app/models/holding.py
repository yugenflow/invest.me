import uuid
from datetime import datetime, date
from sqlalchemy import String, Float, Integer, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    asset_class_code: Mapped[str] = mapped_column(String(30), ForeignKey("asset_classes.code"), nullable=False)
    symbol: Mapped[str | None] = mapped_column(String(50), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, default=0)
    avg_buy_price: Mapped[float] = mapped_column(Float, default=0)
    buy_currency: Mapped[str] = mapped_column(String(3), default="INR")
    exchange: Mapped[str | None] = mapped_column(String(20), nullable=True)
    buy_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    maturity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    interest_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sebi_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="holdings")
    transactions = relationship("Transaction", back_populates="holding", lazy="selectin")
