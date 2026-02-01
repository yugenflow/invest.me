import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.holding import Holding

# Asset classes that don't use symbol for identity (match on name instead)
NO_SYMBOL_CLASSES = {"FIXED_DEPOSIT", "PPF", "EPF", "NPS", "REAL_ESTATE", "OTHER"}


async def find_duplicate_holding(
    db: AsyncSession,
    user_id: uuid.UUID,
    symbol: str | None,
    asset_class_code: str,
    name: str | None = None,
) -> Holding | None:
    """Find an existing active holding that matches the incoming one."""
    if asset_class_code in NO_SYMBOL_CLASSES:
        if not name:
            return None
        result = await db.execute(
            select(Holding).where(
                Holding.user_id == user_id,
                Holding.is_active == True,
                Holding.asset_class_code == asset_class_code,
                func.lower(Holding.name) == name.lower(),
            )
        )
    else:
        if not symbol:
            return None
        result = await db.execute(
            select(Holding).where(
                Holding.user_id == user_id,
                Holding.is_active == True,
                Holding.asset_class_code == asset_class_code,
                func.upper(Holding.symbol) == symbol.upper(),
            )
        )
    return result.scalar_one_or_none()


async def get_duplicate_groups(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[list[dict]]:
    """Return groups of existing holdings that share the same identity key."""
    result = await db.execute(
        select(Holding)
        .where(Holding.user_id == user_id, Holding.is_active == True)
        .order_by(Holding.created_at.asc())
    )
    holdings = result.scalars().all()

    groups: dict[str, list[Holding]] = {}
    for h in holdings:
        if h.asset_class_code in NO_SYMBOL_CLASSES:
            key = f"{h.asset_class_code}::{(h.name or '').lower()}"
        else:
            if not h.symbol:
                continue
            key = f"{h.asset_class_code}::{h.symbol.upper()}"
        groups.setdefault(key, []).append(h)

    # Only return groups with 2+ entries
    result_groups = []
    for group in groups.values():
        if len(group) >= 2:
            result_groups.append([
                {
                    "id": str(h.id),
                    "symbol": h.symbol,
                    "name": h.name,
                    "quantity": h.quantity,
                    "avg_buy_price": h.avg_buy_price,
                    "asset_class_code": h.asset_class_code,
                    "buy_currency": h.buy_currency,
                    "created_at": h.created_at.isoformat() if h.created_at else None,
                }
                for h in group
            ])
    return result_groups


def compute_merge(
    old_qty: float,
    old_price: float,
    new_qty: float,
    new_price: float,
) -> tuple[float, float]:
    """Compute merged quantity and weighted average price."""
    merged_qty = old_qty + new_qty
    if merged_qty == 0:
        return (0, 0)
    old_value = old_qty * old_price
    new_value = new_qty * new_price
    weighted_avg = (old_value + new_value) / merged_qty
    return (merged_qty, round(weighted_avg, 4))
