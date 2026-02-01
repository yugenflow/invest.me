"""Celery tasks for fetching and caching market prices."""
import json
import logging
import os
import uuid
from datetime import datetime, date
from zoneinfo import ZoneInfo

import psycopg2
import psycopg2.extras
import redis as sync_redis

from app.celery_app import celery
from app.services.price_service import (
    to_yfinance_ticker,
    fetch_current_prices_batch,
    fetch_eod_history,
    get_previous_close_from_history,
    PRICEABLE_CLASSES,
)
from app.services.mf_resolver import resolve_mf_ticker_sync_cached

logger = logging.getLogger(__name__)

# Sync DB connection string (Celery workers are synchronous)
_SYNC_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://investme:investme_secret@db:5432/investme",
)
# Strip async driver prefix if present
if "+asyncpg" in _SYNC_DB_URL:
    _SYNC_DB_URL = _SYNC_DB_URL.replace("+asyncpg", "")

_REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
_CACHE_TTL = int(os.getenv("PRICE_CACHE_TTL_SECONDS", "900"))
_BATCH_SIZE = int(os.getenv("YFINANCE_BATCH_SIZE", "50"))
_BACKFILL_DAYS = int(os.getenv("PRICE_HISTORY_BACKFILL_DAYS", "365"))
_MF_CACHE_TTL = 86400  # 24 hours for MF NAV prices

# Market groups: maps asset class codes to scheduling groups
_MARKET_GROUPS = {
    "EQUITY_IN": "INDIA",
    "GOLD_ETF": "INDIA",
    "EQUITY_US": "US",
    "CRYPTO": "ALWAYS",
    "MUTUAL_FUND": "MF_DAILY",  # Excluded from 15-min task, handled by dedicated daily task
}

# Benchmark tickers mapped to market groups
_BENCHMARK_MARKET_GROUPS = {
    "^NSEI": "INDIA",
    "^BSESN": "INDIA",
    "^GSPC": "US",
    "GC=F": "US",
    "BTC-INR": "ALWAYS",
}


def _is_market_open(group: str) -> bool:
    """Check if a market group should be fetched right now.

    INDIA: Mon-Fri, 8:45 AM - 4:00 PM IST (with 30-min buffer → 8:15 - 16:30)
    US: Mon-Fri, 9:00 AM - 4:30 PM ET (with 30-min buffer → 8:30 - 17:00)
    ALWAYS: Always returns True (crypto, 24/7)
    MF_DAILY: Always returns False (handled by dedicated daily task)
    """
    if group == "ALWAYS":
        return True
    if group == "MF_DAILY":
        return False

    now_utc = datetime.now(ZoneInfo("UTC"))

    if group == "INDIA":
        now_ist = now_utc.astimezone(ZoneInfo("Asia/Kolkata"))
        if now_ist.weekday() >= 5:  # Saturday=5, Sunday=6
            return False
        hour_min = now_ist.hour * 60 + now_ist.minute
        return (8 * 60 + 15) <= hour_min <= (16 * 60 + 30)

    if group == "US":
        now_et = now_utc.astimezone(ZoneInfo("America/New_York"))
        if now_et.weekday() >= 5:
            return False
        hour_min = now_et.hour * 60 + now_et.minute
        return (8 * 60 + 30) <= hour_min <= (17 * 60)

    return False


def _get_sync_db():
    """Get a synchronous psycopg2 connection."""
    return psycopg2.connect(_SYNC_DB_URL)


def _get_sync_redis():
    """Get a synchronous Redis client."""
    return sync_redis.from_url(_REDIS_URL, decode_responses=True)


def _get_all_tickers_sync() -> list[dict]:
    """Query distinct priceable holdings from the DB.

    Returns list of {symbol, asset_class_code, exchange, yf_ticker}.
    """
    conn = _get_sync_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT symbol, asset_class_code, exchange
                FROM holdings
                WHERE is_active = true AND symbol IS NOT NULL
            """)
            rows = cur.fetchall()
    finally:
        conn.close()

    tickers = []
    for row in rows:
        if row["asset_class_code"] not in PRICEABLE_CLASSES:
            continue
        yf_ticker = to_yfinance_ticker(row["symbol"], row["asset_class_code"], row.get("exchange"))
        if yf_ticker:
            tickers.append({
                "symbol": row["symbol"],
                "asset_class_code": row["asset_class_code"],
                "exchange": row.get("exchange"),
                "yf_ticker": yf_ticker,
            })

    return tickers


def _upsert_market_data_sync(prices: dict[str, dict]) -> None:
    """Write current prices to market_data table (ON CONFLICT upsert)."""
    if not prices:
        return

    conn = _get_sync_db()
    try:
        with conn.cursor() as cur:
            for ticker, data in prices.items():
                cur.execute("""
                    INSERT INTO market_data (id, symbol, current_price, previous_close, day_change_pct, last_updated)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    ON CONFLICT ON CONSTRAINT uq_market_data_symbol_exchange
                    DO UPDATE SET
                        current_price = EXCLUDED.current_price,
                        previous_close = EXCLUDED.previous_close,
                        day_change_pct = EXCLUDED.day_change_pct,
                        last_updated = NOW()
                """, (
                    str(uuid.uuid4()),
                    ticker,
                    data["price"],
                    data.get("previous_close"),
                    data.get("day_change_pct"),
                ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to upsert market_data: {e}")
    finally:
        conn.close()


def _upsert_price_history_sync(ticker: str, asset_class_code: str, rows: list[dict]) -> None:
    """Write EOD OHLCV rows to price_history table."""
    if not rows:
        return

    conn = _get_sync_db()
    try:
        with conn.cursor() as cur:
            for row in rows:
                cur.execute("""
                    INSERT INTO price_history (id, symbol, asset_class_code, date, open, high, low, close, volume)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT ON CONSTRAINT uq_price_history_symbol_date
                    DO UPDATE SET
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        volume = EXCLUDED.volume
                """, (
                    str(uuid.uuid4()),
                    ticker,
                    asset_class_code,
                    row["date"],
                    row.get("open"),
                    row.get("high"),
                    row.get("low"),
                    row["close"],
                    row.get("volume"),
                ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to upsert price_history for {ticker}: {e}")
    finally:
        conn.close()


def _ticker_has_history_sync(ticker: str) -> bool:
    """Check if a ticker already has price_history data."""
    conn = _get_sync_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM price_history WHERE symbol = %s LIMIT 1", (ticker,))
            return cur.fetchone() is not None
    finally:
        conn.close()


@celery.task(name="fetch_current_prices")
def fetch_current_prices():
    """Fetch current prices for open-market tickers only. Runs every 15 minutes.

    Partitions tickers by market group and skips closed markets.
    MF tickers are always excluded (handled by fetch_mf_nav daily task).
    """
    ticker_info = _get_all_tickers_sync()
    if not ticker_info:
        logger.info("No priceable tickers found.")
        return

    # Partition tickers by market group, filter to open markets only
    open_tickers = []
    skipped_groups = set()
    for t in ticker_info:
        group = _MARKET_GROUPS.get(t["asset_class_code"], "ALWAYS")
        if _is_market_open(group):
            open_tickers.append(t["yf_ticker"])
        else:
            skipped_groups.add(group)

    # Also include benchmark tickers for open markets
    for bench in BENCHMARK_TICKERS:
        group = _BENCHMARK_MARKET_GROUPS.get(bench["yf_ticker"], "ALWAYS")
        if _is_market_open(group):
            open_tickers.append(bench["yf_ticker"])
        else:
            skipped_groups.add(group)

    if skipped_groups:
        logger.info(f"Skipped closed market groups: {', '.join(sorted(skipped_groups))}")

    if not open_tickers:
        logger.info("All markets closed, no tickers to fetch.")
        return {"fetched": 0, "total": 0, "skipped_groups": list(skipped_groups)}

    logger.info(f"Fetching current prices for {len(open_tickers)} tickers (open markets)")

    # Process in batches
    all_prices = {}
    for i in range(0, len(open_tickers), _BATCH_SIZE):
        batch = open_tickers[i:i + _BATCH_SIZE]
        prices = fetch_current_prices_batch(batch)
        all_prices.update(prices)

    if not all_prices:
        logger.warning("No prices returned from yfinance.")
        return

    # Write to Redis cache
    r = _get_sync_redis()
    pipe = r.pipeline()
    for ticker, data in all_prices.items():
        pipe.setex(f"price:{ticker}", _CACHE_TTL, json.dumps(data))
    pipe.execute()
    r.close()

    # Persist to market_data table
    _upsert_market_data_sync(all_prices)

    logger.info(f"Cached and persisted prices for {len(all_prices)} tickers")
    return {"fetched": len(all_prices), "total": len(open_tickers), "skipped_groups": list(skipped_groups)}


BENCHMARK_TICKERS = [
    {"yf_ticker": "^NSEI", "asset_class_code": "INDEX"},    # Nifty 50
    {"yf_ticker": "^BSESN", "asset_class_code": "INDEX"},   # Sensex
    {"yf_ticker": "^GSPC", "asset_class_code": "INDEX"},     # S&P 500
    {"yf_ticker": "GC=F", "asset_class_code": "COMMODITY"},  # Gold futures
    {"yf_ticker": "BTC-INR", "asset_class_code": "CRYPTO"},  # Bitcoin
]


@celery.task(name="fetch_eod_prices")
def fetch_eod_prices():
    """Fetch end-of-day OHLCV data. Runs daily after market close.

    Auto-backfills 1 year of history for new tickers.
    Also fetches benchmark index data (Nifty 50, Sensex).
    """
    ticker_info = _get_all_tickers_sync()

    # Add benchmark tickers
    all_ticker_info = list(ticker_info) + BENCHMARK_TICKERS

    if not all_ticker_info:
        logger.info("No tickers found for EOD fetch.")
        return

    # Separate tickers needing backfill vs incremental update
    backfill_tickers = []
    update_tickers = []

    for t in all_ticker_info:
        if _ticker_has_history_sync(t["yf_ticker"]):
            update_tickers.append(t)
        else:
            backfill_tickers.append(t)

    total_rows = 0

    # Backfill new tickers (1 year)
    if backfill_tickers:
        logger.info(f"Backfilling {len(backfill_tickers)} new tickers with 1y history")
        yf_tickers = [t["yf_ticker"] for t in backfill_tickers]
        ticker_map = {t["yf_ticker"]: t["asset_class_code"] for t in backfill_tickers}

        for i in range(0, len(yf_tickers), _BATCH_SIZE):
            batch = yf_tickers[i:i + _BATCH_SIZE]
            history = fetch_eod_history(batch, period="1y")
            for ticker, rows in history.items():
                _upsert_price_history_sync(ticker, ticker_map.get(ticker, ""), rows)
                total_rows += len(rows)

    # Incremental update for existing tickers (last 5 days)
    if update_tickers:
        logger.info(f"Updating EOD for {len(update_tickers)} existing tickers")
        yf_tickers = [t["yf_ticker"] for t in update_tickers]
        ticker_map = {t["yf_ticker"]: t["asset_class_code"] for t in update_tickers}

        for i in range(0, len(yf_tickers), _BATCH_SIZE):
            batch = yf_tickers[i:i + _BATCH_SIZE]
            history = fetch_eod_history(batch, period="5d")
            for ticker, rows in history.items():
                _upsert_price_history_sync(ticker, ticker_map.get(ticker, ""), rows)
                total_rows += len(rows)

    logger.info(f"EOD fetch complete: {total_rows} rows written")
    return {"backfilled": len(backfill_tickers), "updated": len(update_tickers), "rows": total_rows}


@celery.task(name="resolve_mf_symbols")
def resolve_mf_symbols():
    """Resolve Yahoo Finance tickers for mutual fund holdings that have no symbol.

    Queries holdings where asset_class_code = 'MUTUAL_FUND' AND symbol IS NULL,
    attempts resolution for each, and updates the holding record.
    """
    conn = _get_sync_db()
    r = _get_sync_redis()

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name FROM holdings
                WHERE asset_class_code = 'MUTUAL_FUND'
                  AND (symbol IS NULL OR symbol = '')
                  AND is_active = true
            """)
            unresolved = cur.fetchall()

        if not unresolved:
            logger.info("No unresolved MF holdings found.")
            return {"resolved": 0, "total": 0}

        logger.info(f"Attempting to resolve {len(unresolved)} MF holdings")
        resolved_count = 0

        for row in unresolved:
            holding_id = row["id"]
            fund_name = row["name"]
            if not fund_name:
                continue

            result = resolve_mf_ticker_sync_cached(fund_name, r)
            if result and result.get("yf_ticker"):
                try:
                    with conn.cursor() as cur:
                        cur.execute(
                            "UPDATE holdings SET symbol = %s WHERE id = %s",
                            (result["yf_ticker"], holding_id),
                        )
                    conn.commit()
                    resolved_count += 1
                    logger.info(f"Resolved MF '{fund_name}' → {result['yf_ticker']}")
                except Exception as e:
                    conn.rollback()
                    logger.warning(f"Failed to update holding {holding_id}: {e}")
            else:
                logger.info(f"Could not resolve MF '{fund_name}'")

        return {"resolved": resolved_count, "total": len(unresolved)}
    finally:
        r.close()
        conn.close()


@celery.task(name="fetch_mf_nav")
def fetch_mf_nav():
    """Fetch daily MF NAVs with corrected previous_close from price_history.

    Runs once daily at 18:00 UTC (11:30 PM IST), after NAV declaration and
    after the EOD task (16:30 UTC) has populated price_history.

    Yahoo's chartPreviousClose returns the same value as regularMarketPrice for
    MF tickers, so we override previous_close with the most recent close from
    our price_history table to get correct day_change_pct.
    """
    ticker_info = _get_all_tickers_sync()
    mf_tickers = [t for t in ticker_info if t["asset_class_code"] == "MUTUAL_FUND"]

    if not mf_tickers:
        logger.info("No MF tickers found.")
        return {"fetched": 0}

    yf_tickers = [t["yf_ticker"] for t in mf_tickers]
    logger.info(f"Fetching MF NAVs for {len(yf_tickers)} tickers")

    # Fetch current NAVs from Yahoo
    all_prices = {}
    for i in range(0, len(yf_tickers), _BATCH_SIZE):
        batch = yf_tickers[i:i + _BATCH_SIZE]
        prices = fetch_current_prices_batch(batch)
        all_prices.update(prices)

    if not all_prices:
        logger.warning("No MF NAVs returned from yfinance.")
        return {"fetched": 0}

    # Override previous_close from price_history for correct day change
    conn = _get_sync_db()
    try:
        fixed_count = 0
        for ticker, data in all_prices.items():
            hist_close = get_previous_close_from_history(conn, ticker)
            if hist_close is not None:
                data["previous_close"] = hist_close
                current = data["price"]
                if hist_close > 0:
                    data["day_change_pct"] = round((current - hist_close) / hist_close * 100, 2)
                else:
                    data["day_change_pct"] = 0.0
                fixed_count += 1
            else:
                # No history yet — keep Yahoo's values (day_change_pct may be 0)
                logger.info(f"No price history for {ticker}, using Yahoo previous_close")
    finally:
        conn.close()

    # Cache in Redis with 24-hour TTL (vs 15-min for other assets)
    r = _get_sync_redis()
    pipe = r.pipeline()
    for ticker, data in all_prices.items():
        pipe.setex(f"price:{ticker}", _MF_CACHE_TTL, json.dumps(data))
    pipe.execute()
    r.close()

    # Persist to market_data table
    _upsert_market_data_sync(all_prices)

    logger.info(f"MF NAV fetch complete: {len(all_prices)} tickers, {fixed_count} with corrected previous_close")
    return {"fetched": len(all_prices), "fixed_previous_close": fixed_count}
