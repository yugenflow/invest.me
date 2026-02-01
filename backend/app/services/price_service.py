"""Price resolution service: Yahoo Finance API, Redis caching, DB fallback."""
import json
import logging
import math
from datetime import date, datetime

import requests
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.market_data import MarketData

logger = logging.getLogger(__name__)

_YF_CHART_URL = "https://query2.finance.yahoo.com/v8/finance/chart/{ticker}"
_YF_HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# Asset classes that can be priced via yfinance
PRICEABLE_CLASSES = {"EQUITY_IN", "EQUITY_US", "CRYPTO", "GOLD_ETF", "MUTUAL_FUND"}

# Asset classes that use cost basis only
COST_BASIS_CLASSES = {
    "FIXED_DEPOSIT", "PPF", "EPF", "NPS", "BOND",
    "REAL_ESTATE", "GOLD_PHYSICAL", "GOLD_SGB", "GOLD_DIGITAL", "OTHER",
}


def to_yfinance_ticker(symbol: str | None, asset_class_code: str, exchange: str | None = None) -> str | None:
    """Map a holding's symbol + asset class to a yfinance ticker string."""
    if not symbol:
        return None

    if asset_class_code == "EQUITY_IN":
        suffix = ".BO" if exchange and exchange.upper() == "BSE" else ".NS"
        return f"{symbol}{suffix}"
    elif asset_class_code == "EQUITY_US":
        return symbol
    elif asset_class_code == "CRYPTO":
        return f"{symbol}-INR"
    elif asset_class_code == "GOLD_ETF":
        return f"{symbol}.NS"
    elif asset_class_code == "MUTUAL_FUND":
        # MF codes on Yahoo Finance use .BO suffix (e.g., 0P0000YWL1.BO)
        # If already a full ticker with suffix, pass through
        if symbol.endswith(".BO") or symbol.endswith(".NS"):
            return symbol
        # If it starts with 0P (Yahoo MF code), append .BO
        if symbol.startswith("0P"):
            return f"{symbol}.BO"
        # If it has a dot (other suffix), pass through
        if "." in symbol:
            return symbol
        return f"{symbol}.BO"
    else:
        return None


async def get_cached_price(redis: aioredis.Redis, yf_ticker: str) -> dict | None:
    """Read a cached price from Redis."""
    raw = await redis.get(f"price:{yf_ticker}")
    if raw:
        return json.loads(raw)
    return None


async def set_cached_prices_bulk(redis: aioredis.Redis, prices: dict[str, dict]) -> None:
    """Write multiple prices to Redis with TTL."""
    pipe = redis.pipeline()
    for ticker, data in prices.items():
        pipe.setex(f"price:{ticker}", settings.PRICE_CACHE_TTL_SECONDS, json.dumps(data))
    await pipe.execute()


def _fetch_yahoo_chart(ticker: str, range_: str = "1d", interval: str = "1d") -> dict | None:
    """Fetch chart data from Yahoo Finance API directly."""
    try:
        resp = requests.get(
            _YF_CHART_URL.format(ticker=ticker),
            headers=_YF_HEADERS,
            params={"range": range_, "interval": interval},
            timeout=10,
        )
        if resp.status_code != 200:
            logger.warning(f"Yahoo API returned {resp.status_code} for {ticker}")
            return None
        return resp.json()
    except Exception as e:
        logger.warning(f"Yahoo API request failed for {ticker}: {e}")
        return None


def fetch_current_prices_batch(tickers: list[str]) -> dict[str, dict]:
    """Fetch current prices from Yahoo Finance API for a batch of tickers.

    Returns dict of ticker -> {price, previous_close, day_change_pct, last_updated}.
    """
    if not tickers:
        return {}

    results = {}
    for ticker_str in tickers:
        try:
            data = _fetch_yahoo_chart(ticker_str, range_="2d", interval="1d")
            if not data:
                continue

            chart = data.get("chart", {}).get("result")
            if not chart:
                logger.warning(f"No chart result for {ticker_str}")
                continue

            meta = chart[0].get("meta", {})
            current_price = meta.get("regularMarketPrice")
            previous_close = meta.get("chartPreviousClose") or meta.get("previousClose")

            if current_price is None:
                continue

            day_change_pct = 0.0
            if previous_close and previous_close > 0:
                day_change_pct = round((current_price - previous_close) / previous_close * 100, 2)

            results[ticker_str] = {
                "price": round(current_price, 2),
                "previous_close": round(previous_close, 2) if previous_close else None,
                "day_change_pct": day_change_pct,
                "last_updated": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.warning(f"Failed to fetch price for {ticker_str}: {e}")

    return results


def fetch_eod_history(tickers: list[str], period: str = "5d") -> dict[str, list[dict]]:
    """Fetch OHLCV history from Yahoo Finance API.

    Returns dict of ticker -> list of {date, open, high, low, close, volume}.
    """
    if not tickers:
        return {}

    # Map period strings to Yahoo range parameter
    range_map = {"5d": "5d", "1mo": "1mo", "1y": "1y", "6mo": "6mo", "max": "max"}
    yf_range = range_map.get(period, period)

    results = {}
    for ticker in tickers:
        try:
            data = _fetch_yahoo_chart(ticker, range_=yf_range, interval="1d")
            if not data:
                continue

            chart = data.get("chart", {}).get("result")
            if not chart:
                continue

            timestamps = chart[0].get("timestamp", [])
            indicators = chart[0].get("indicators", {})
            quotes = indicators.get("quote", [{}])[0]

            opens = quotes.get("open", [])
            highs = quotes.get("high", [])
            lows = quotes.get("low", [])
            closes = quotes.get("close", [])
            volumes = quotes.get("volume", [])

            rows = []
            for i, ts in enumerate(timestamps):
                close_val = closes[i] if i < len(closes) else None
                if close_val is None:
                    continue

                d = datetime.utcfromtimestamp(ts).date()
                rows.append({
                    "date": d.isoformat(),
                    "open": _safe_float(opens[i] if i < len(opens) else None),
                    "high": _safe_float(highs[i] if i < len(highs) else None),
                    "low": _safe_float(lows[i] if i < len(lows) else None),
                    "close": round(float(close_val), 2),
                    "volume": _safe_int(volumes[i] if i < len(volumes) else None),
                })

            if rows:
                results[ticker] = rows
        except Exception as e:
            logger.warning(f"Failed to fetch EOD data for {ticker}: {e}")

    return results


async def resolve_price(
    db: AsyncSession,
    redis: aioredis.Redis,
    symbol: str | None,
    asset_class_code: str,
    exchange: str | None,
    avg_buy_price: float,
) -> dict:
    """3-tier price resolution: Redis cache -> market_data table -> cost basis.

    Returns {price, source, day_change_pct}.
    """
    yf_ticker = to_yfinance_ticker(symbol, asset_class_code, exchange)

    if yf_ticker and asset_class_code in PRICEABLE_CLASSES:
        # Tier 1: Redis cache
        cached = await get_cached_price(redis, yf_ticker)
        if cached:
            return {
                "price": cached["price"],
                "previous_close": cached.get("previous_close"),
                "day_change_pct": cached.get("day_change_pct", 0),
                "source": "cache",
            }

        # Tier 2: market_data table
        result = await db.execute(
            select(MarketData).where(MarketData.symbol == yf_ticker).limit(1)
        )
        md = result.scalar_one_or_none()
        if md and md.current_price:
            return {
                "price": md.current_price,
                "previous_close": md.previous_close,
                "day_change_pct": md.day_change_pct or 0,
                "source": "db",
            }

    # Tier 3: cost basis fallback
    return {
        "price": avg_buy_price,
        "previous_close": None,
        "day_change_pct": 0,
        "source": "cost_basis",
    }


def get_previous_close_from_history(conn, ticker: str) -> float | None:
    """Query price_history for the most recent close before today (sync, psycopg2).

    Used by the MF NAV task to get a real previous_close since Yahoo's
    chartPreviousClose returns the same value as regularMarketPrice for MF tickers.
    """
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT close FROM price_history
                WHERE symbol = %s AND date < CURRENT_DATE
                ORDER BY date DESC
                LIMIT 1
            """, (ticker,))
            row = cur.fetchone()
            if row and row[0] is not None:
                return round(float(row[0]), 2)
    except Exception as e:
        logger.warning(f"Failed to get previous close from history for {ticker}: {e}")
    return None


def _is_nan(val) -> bool:
    try:
        return math.isnan(float(val))
    except (TypeError, ValueError):
        return False


def _safe_float(val) -> float | None:
    if val is None or _is_nan(val):
        return None
    return round(float(val), 2)


def _safe_int(val) -> int | None:
    if val is None or _is_nan(val):
        return None
    return int(val)
