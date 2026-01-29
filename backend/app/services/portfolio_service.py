"""Portfolio aggregation and analytics service."""
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.holding import Holding
from app.models.transaction import Transaction

# Color palette for allocation chart
CATEGORY_COLORS = {
    "Equity": "#3B82F6",
    "Funds": "#8B5CF6",
    "Crypto": "#F59E0B",
    "Gold": "#EAB308",
    "Fixed Income": "#10B981",
    "Real Estate": "#EC4899",
    "Other": "#6B7280",
}

ASSET_CLASS_NAMES = {
    "EQUITY_IN": "Indian Equity",
    "EQUITY_US": "US Equity",
    "MUTUAL_FUND": "Mutual Fund",
    "CRYPTO": "Cryptocurrency",
    "GOLD_PHYSICAL": "Physical Gold",
    "GOLD_SGB": "Sovereign Gold Bond",
    "GOLD_ETF": "Gold ETF",
    "GOLD_DIGITAL": "Digital Gold",
    "FIXED_DEPOSIT": "Fixed Deposit",
    "PPF": "PPF",
    "EPF": "EPF",
    "NPS": "NPS",
    "REAL_ESTATE": "Real Estate",
    "BOND": "Bond",
    "OTHER": "Other",
}

ASSET_CLASS_CATEGORIES = {
    "EQUITY_IN": "Equity", "EQUITY_US": "Equity",
    "MUTUAL_FUND": "Funds", "CRYPTO": "Crypto",
    "GOLD_PHYSICAL": "Gold", "GOLD_SGB": "Gold", "GOLD_ETF": "Gold", "GOLD_DIGITAL": "Gold",
    "FIXED_DEPOSIT": "Fixed Income", "PPF": "Fixed Income", "EPF": "Fixed Income",
    "NPS": "Fixed Income", "BOND": "Fixed Income",
    "REAL_ESTATE": "Real Estate", "OTHER": "Other",
}


async def get_portfolio_summary(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Calculate net worth, total invested, and returns."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    total_invested = sum(h.quantity * h.avg_buy_price for h in holdings)
    # Without live market data, current_value = invested value
    current_value = total_invested
    total_gain_loss = current_value - total_invested
    total_gain_loss_pct = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0

    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(current_value, 2),
        "total_gain_loss": round(total_gain_loss, 2),
        "total_gain_loss_pct": round(total_gain_loss_pct, 2),
        "day_change": 0,
        "day_change_pct": 0,
    }


async def get_allocation(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    """Asset allocation breakdown."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    totals: dict[str, float] = {}
    for h in holdings:
        code = h.asset_class_code
        value = h.quantity * h.avg_buy_price
        totals[code] = totals.get(code, 0) + value

    grand_total = sum(totals.values())
    allocation = []
    for code, value in sorted(totals.items(), key=lambda x: -x[1]):
        category = ASSET_CLASS_CATEGORIES.get(code, "Other")
        allocation.append({
            "asset_class": code,
            "asset_class_name": ASSET_CLASS_NAMES.get(code, code),
            "value": round(value, 2),
            "percentage": round(value / grand_total * 100, 2) if grand_total > 0 else 0,
            "color": CATEGORY_COLORS.get(category, "#6B7280"),
        })

    return allocation


async def get_performance(db: AsyncSession, user_id: uuid.UUID, days: int = 30) -> list[dict]:
    """Generate performance time-series (simplified without live data)."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()
    current_value = sum(h.quantity * h.avg_buy_price for h in holdings)

    # Generate mock performance data points
    points = []
    today = date.today()
    for i in range(days, -1, -1):
        d = today - timedelta(days=i)
        # Slight variation for visual interest (within 5%)
        import random
        random.seed(d.toordinal())
        factor = 1 + (random.random() - 0.5) * 0.1
        points.append({
            "date": d.isoformat(),
            "value": round(current_value * factor, 2),
        })

    return points


async def get_top_holdings(db: AsyncSession, user_id: uuid.UUID, limit: int = 5) -> list[dict]:
    """Top holdings by value."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    valued = []
    for h in holdings:
        value = h.quantity * h.avg_buy_price
        valued.append({
            "id": str(h.id),
            "name": h.name,
            "symbol": h.symbol,
            "asset_class_code": h.asset_class_code,
            "quantity": h.quantity,
            "avg_buy_price": h.avg_buy_price,
            "buy_currency": h.buy_currency,
            "value": round(value, 2),
            "is_active": h.is_active,
        })

    valued.sort(key=lambda x: -x["value"])
    return valued[:limit]


async def get_dashboard(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Aggregated dashboard data."""
    summary = await get_portfolio_summary(db, user_id)
    allocation = await get_allocation(db, user_id)
    performance = await get_performance(db, user_id, days=30)
    top_holdings = await get_top_holdings(db, user_id)

    return {
        "summary": summary,
        "allocation": allocation,
        "performance": performance,
        "top_holdings": top_holdings,
    }
