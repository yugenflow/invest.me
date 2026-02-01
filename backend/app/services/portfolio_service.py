"""Portfolio aggregation and analytics service."""
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import redis.asyncio as aioredis
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.price_history import PriceHistory
from app.services.price_service import resolve_price, to_yfinance_ticker, PRICEABLE_CLASSES

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


async def get_portfolio_summary(db: AsyncSession, user_id: uuid.UUID, redis: aioredis.Redis | None = None) -> dict:
    """Calculate net worth, total invested, and returns using live market prices."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    total_invested = 0.0
    current_value = 0.0
    day_change = 0.0

    for h in holdings:
        invested = h.quantity * h.avg_buy_price
        total_invested += invested

        if redis:
            price_info = await resolve_price(db, redis, h.symbol, h.asset_class_code, h.exchange, h.avg_buy_price)
            market_value = h.quantity * price_info["price"]
            current_value += market_value

            # Day change contribution
            if price_info["previous_close"]:
                prev_value = h.quantity * price_info["previous_close"]
                day_change += market_value - prev_value
        else:
            current_value += invested

    total_gain_loss = current_value - total_invested
    total_gain_loss_pct = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
    day_change_pct = (day_change / (current_value - day_change) * 100) if current_value - day_change > 0 else 0

    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(current_value, 2),
        "total_gain_loss": round(total_gain_loss, 2),
        "total_gain_loss_pct": round(total_gain_loss_pct, 2),
        "day_change": round(day_change, 2),
        "day_change_pct": round(day_change_pct, 2),
    }


async def get_allocation(db: AsyncSession, user_id: uuid.UUID, redis: aioredis.Redis | None = None) -> list[dict]:
    """Asset allocation breakdown using current market values."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    totals: dict[str, float] = {}
    for h in holdings:
        code = h.asset_class_code
        if redis:
            price_info = await resolve_price(db, redis, h.symbol, h.asset_class_code, h.exchange, h.avg_buy_price)
            value = h.quantity * price_info["price"]
        else:
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


async def get_performance(db: AsyncSession, user_id: uuid.UUID, days: int = 30, redis: aioredis.Redis | None = None) -> dict:
    """Build performance time-series from price_history data with cost-basis fallback.

    Returns {portfolio: [...], by_category: {category: [...]}, benchmarks: {index: [...]}}.
    """
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    if not holdings:
        return {"portfolio": [], "by_category": {}, "benchmarks": {}}

    today = date.today()
    start_date = today - timedelta(days=days)

    # Build maps: ticker -> holdings, ticker -> category
    ticker_holdings: dict[str, list] = {}  # yf_ticker -> list of (quantity, avg_buy_price)
    ticker_category: dict[str, str] = {}   # yf_ticker -> category name
    cost_basis_by_category: dict[str, float] = {}  # category -> cost basis total

    for h in holdings:
        category = ASSET_CLASS_CATEGORIES.get(h.asset_class_code, "Other")
        yf_ticker = to_yfinance_ticker(h.symbol, h.asset_class_code, h.exchange)
        if yf_ticker and h.asset_class_code in PRICEABLE_CLASSES:
            if yf_ticker not in ticker_holdings:
                ticker_holdings[yf_ticker] = []
            ticker_holdings[yf_ticker].append((h.quantity, h.avg_buy_price))
            ticker_category[yf_ticker] = category
        else:
            cost_basis_by_category[category] = cost_basis_by_category.get(category, 0) + h.quantity * h.avg_buy_price

    cost_basis_total = sum(cost_basis_by_category.values())

    if not ticker_holdings:
        points = []
        for i in range(days, -1, -1):
            d = today - timedelta(days=i)
            points.append({"date": d.isoformat(), "value": round(cost_basis_total, 2)})
        return {"portfolio": points, "by_category": {}, "benchmarks": {}}

    # Fetch price_history for held tickers + benchmark indices
    benchmark_tickers = ["^NSEI", "^BSESN", "^GSPC", "GC=F", "BTC-INR"]
    all_tickers = list(ticker_holdings.keys())
    fetch_tickers = all_tickers + benchmark_tickers

    ph_result = await db.execute(
        select(PriceHistory)
        .where(
            PriceHistory.symbol.in_(fetch_tickers),
            PriceHistory.date >= start_date,
        )
        .order_by(PriceHistory.date)
    )
    price_rows = ph_result.scalars().all()

    # Build date -> ticker -> close price map
    price_map: dict[date, dict[str, float]] = {}
    for pr in price_rows:
        if pr.date not in price_map:
            price_map[pr.date] = {}
        price_map[pr.date][pr.symbol] = pr.close

    # Initialize last known prices with cost basis
    last_known_prices: dict[str, float] = {}
    for ticker, holding_list in ticker_holdings.items():
        total_qty = sum(q for q, _ in holding_list)
        weighted_avg = sum(q * p for q, p in holding_list) / total_qty if total_qty > 0 else 0
        last_known_prices[ticker] = weighted_avg

    # Track benchmark base values for normalization
    benchmark_last: dict[str, float] = {}
    benchmark_base: dict[str, float | None] = {t: None for t in benchmark_tickers}

    # Get all unique categories
    all_categories = set(ticker_category.values()) | set(cost_basis_by_category.keys())

    points = []
    category_points: dict[str, list] = {cat: [] for cat in all_categories}
    benchmark_points: dict[str, list] = {t: [] for t in benchmark_tickers}

    # Get portfolio base value for normalizing benchmarks
    portfolio_base_value: float | None = None

    for i in range(days, -1, -1):
        d = today - timedelta(days=i)
        day_prices = price_map.get(d, {})

        # Update last known prices
        for ticker in all_tickers:
            if ticker in day_prices:
                last_known_prices[ticker] = day_prices[ticker]

        # Portfolio total
        day_value = cost_basis_total
        for ticker, holding_list in ticker_holdings.items():
            price = last_known_prices.get(ticker, 0)
            for quantity, _ in holding_list:
                day_value += quantity * price

        points.append({"date": d.isoformat(), "value": round(day_value, 2)})

        if portfolio_base_value is None:
            portfolio_base_value = day_value

        # Per-category values
        for cat in all_categories:
            cat_value = cost_basis_by_category.get(cat, 0)
            for ticker, holding_list in ticker_holdings.items():
                if ticker_category.get(ticker) == cat:
                    price = last_known_prices.get(ticker, 0)
                    for quantity, _ in holding_list:
                        cat_value += quantity * price
            category_points[cat].append({"date": d.isoformat(), "value": round(cat_value, 2)})

        # Benchmark indices — normalize to portfolio starting value
        for bt in benchmark_tickers:
            if bt in day_prices:
                benchmark_last[bt] = day_prices[bt]
            if bt in benchmark_last and benchmark_base[bt] is None:
                benchmark_base[bt] = benchmark_last[bt]

            if bt in benchmark_last and benchmark_base[bt] and portfolio_base_value:
                normalized = portfolio_base_value * (benchmark_last[bt] / benchmark_base[bt])
                benchmark_points[bt].append({"date": d.isoformat(), "value": round(normalized, 2)})

    # Clean up benchmark names
    benchmark_names = {
        "^NSEI": "Nifty 50",
        "^BSESN": "Sensex",
        "^GSPC": "S&P 500",
        "GC=F": "Gold",
        "BTC-INR": "Bitcoin",
    }
    benchmarks = {}
    for bt in benchmark_tickers:
        name = benchmark_names.get(bt, bt)
        if benchmark_points[bt]:
            benchmarks[name] = benchmark_points[bt]

    return {
        "portfolio": points,
        "by_category": {cat: pts for cat, pts in category_points.items() if pts},
        "benchmarks": benchmarks,
    }


async def get_top_holdings(db: AsyncSession, user_id: uuid.UUID, limit: int | None = 5, redis: aioredis.Redis | None = None) -> list[dict]:
    """Top holdings by current market value."""
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.is_active == True)
    )
    holdings = result.scalars().all()

    valued = []
    for h in holdings:
        invested = h.quantity * h.avg_buy_price
        if redis:
            price_info = await resolve_price(db, redis, h.symbol, h.asset_class_code, h.exchange, h.avg_buy_price)
            current_value = h.quantity * price_info["price"]
            gain_loss = current_value - invested
            gain_loss_pct = (gain_loss / invested * 100) if invested > 0 else 0
            day_change_pct = price_info.get("day_change_pct", 0)
        else:
            current_value = invested
            gain_loss = 0
            gain_loss_pct = 0
            day_change_pct = 0

        valued.append({
            "id": str(h.id),
            "name": h.name,
            "symbol": h.symbol,
            "asset_class_code": h.asset_class_code,
            "quantity": h.quantity,
            "avg_buy_price": h.avg_buy_price,
            "buy_currency": h.buy_currency,
            "value": round(current_value, 2),
            "current_value": round(current_value, 2),
            "gain_loss": round(gain_loss, 2),
            "gain_loss_pct": round(gain_loss_pct, 2),
            "day_change_pct": round(day_change_pct, 2),
            "is_active": h.is_active,
        })

    valued.sort(key=lambda x: -x["value"])
    return valued[:limit] if limit else valued


async def get_dashboard(db: AsyncSession, user_id: uuid.UUID, redis: aioredis.Redis | None = None) -> dict:
    """Aggregated dashboard data."""
    summary = await get_portfolio_summary(db, user_id, redis)
    allocation = await get_allocation(db, user_id, redis)
    performance = await get_performance(db, user_id, days=30, redis=redis)
    all_holdings = await get_top_holdings(db, user_id, limit=None, redis=redis)
    top_holdings = all_holdings[:5]

    return {
        "summary": summary,
        "allocation": allocation,
        "performance": performance,
        "top_holdings": top_holdings,
        "all_holdings": all_holdings,
    }
