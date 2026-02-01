"""Mutual fund name → Yahoo Finance ticker resolution.

Resolution chain:
  Fund Name → mfapi.in search → scheme code → ISIN → Yahoo Finance search → 0P...BO ticker

Caching: Resolved tickers are cached in Redis for 7 days.
"""
import json
import logging
import re

import requests
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

_MFAPI_SEARCH_URL = "https://api.mfapi.in/mf/search"
_MFAPI_SCHEME_URL = "https://api.mfapi.in/mf/{scheme_code}"
_YF_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search"
_YF_HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

_CACHE_PREFIX = "mf_resolve:"
_CACHE_TTL = 7 * 24 * 60 * 60  # 7 days


def _normalize_name(name: str) -> str:
    """Normalize fund name for cache key."""
    return re.sub(r"\s+", " ", name.strip().lower())


def _search_mfapi(fund_name: str) -> dict | None:
    """Search mfapi.in for a fund by name. Returns best match {schemeCode, schemeName}."""
    try:
        resp = requests.get(
            _MFAPI_SEARCH_URL,
            params={"q": fund_name},
            timeout=10,
        )
        if resp.status_code != 200:
            logger.warning(f"mfapi search returned {resp.status_code} for '{fund_name}'")
            return None
        results = resp.json()
        if not results:
            return None
        # Return the first (best) match
        return results[0]
    except Exception as e:
        logger.warning(f"mfapi search failed for '{fund_name}': {e}")
        return None


def _get_scheme_isin(scheme_code: int | str) -> str | None:
    """Fetch scheme details from mfapi.in and extract ISIN."""
    try:
        resp = requests.get(
            _MFAPI_SCHEME_URL.format(scheme_code=scheme_code),
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        meta = data.get("meta", {})
        # Prefer growth ISIN, fall back to div_reinvestment or payout
        isin = (
            meta.get("isin_growth")
            or meta.get("isin_div_reinvestment")
            or meta.get("isin_payout")
        )
        return isin
    except Exception as e:
        logger.warning(f"mfapi scheme fetch failed for code {scheme_code}: {e}")
        return None


def _search_yahoo_by_isin(isin: str) -> str | None:
    """Search Yahoo Finance for a ticker using an ISIN code."""
    try:
        resp = requests.get(
            _YF_SEARCH_URL,
            headers=_YF_HEADERS,
            params={"q": isin, "quotesCount": 5, "newsCount": 0},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        quotes = data.get("quotes", [])
        # Look for a quote with a .BO suffix (BSE/MF) or starting with 0P
        for q in quotes:
            symbol = q.get("symbol", "")
            if symbol.endswith(".BO") or symbol.startswith("0P"):
                return symbol
        # Fallback: return first quote if available
        if quotes:
            return quotes[0].get("symbol")
        return None
    except Exception as e:
        logger.warning(f"Yahoo search failed for ISIN {isin}: {e}")
        return None


def resolve_mf_ticker_sync(fund_name: str) -> dict | None:
    """Resolve a mutual fund name to a Yahoo Finance ticker (synchronous).

    Returns {yf_ticker, isin, amfi_code, matched_name} or None.
    """
    # Step 1: Search mfapi.in
    match = _search_mfapi(fund_name)
    if not match:
        logger.info(f"No mfapi match for '{fund_name}'")
        return None

    scheme_code = match.get("schemeCode")
    matched_name = match.get("schemeName", fund_name)

    # Step 2: Get ISIN from scheme details
    isin = _get_scheme_isin(scheme_code)
    if not isin:
        logger.info(f"No ISIN found for scheme {scheme_code} ('{matched_name}')")
        return None

    # Step 3: Search Yahoo Finance by ISIN
    yf_ticker = _search_yahoo_by_isin(isin)
    if not yf_ticker:
        logger.info(f"No Yahoo ticker found for ISIN {isin} ('{matched_name}')")
        return None

    # Ensure .BO suffix for Indian MFs
    if not yf_ticker.endswith(".BO") and not yf_ticker.endswith(".NS"):
        yf_ticker = f"{yf_ticker}.BO"

    result = {
        "yf_ticker": yf_ticker,
        "isin": isin,
        "amfi_code": str(scheme_code),
        "matched_name": matched_name,
    }
    logger.info(f"Resolved '{fund_name}' → {yf_ticker} (ISIN: {isin})")
    return result


async def resolve_mf_ticker(
    fund_name: str,
    redis: aioredis.Redis | None = None,
) -> dict | None:
    """Resolve a mutual fund name to a Yahoo Finance ticker (async with caching).

    Returns {yf_ticker, isin, amfi_code, matched_name} or None.
    """
    cache_key = f"{_CACHE_PREFIX}{_normalize_name(fund_name)}"

    # Check cache
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    # Resolve synchronously (API calls)
    result = resolve_mf_ticker_sync(fund_name)

    # Cache result (even None as empty string to avoid re-querying)
    if redis and result:
        try:
            await redis.setex(cache_key, _CACHE_TTL, json.dumps(result))
        except Exception:
            pass

    return result


def resolve_mf_ticker_sync_cached(fund_name: str, redis_client=None) -> dict | None:
    """Synchronous resolution with sync Redis caching (for Celery tasks)."""
    cache_key = f"{_CACHE_PREFIX}{_normalize_name(fund_name)}"

    # Check cache
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    result = resolve_mf_ticker_sync(fund_name)

    # Cache result
    if redis_client and result:
        try:
            redis_client.setex(cache_key, _CACHE_TTL, json.dumps(result))
        except Exception:
            pass

    return result
