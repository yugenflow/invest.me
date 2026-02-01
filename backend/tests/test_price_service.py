"""Tests for price_service: to_yfinance_ticker, _safe_float, _safe_int, _is_nan (pure),
resolve_price & fetch_current_prices_batch (mocked)."""
import json
import math
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.services.price_service import (
    _is_nan,
    _safe_float,
    _safe_int,
    fetch_current_prices_batch,
    resolve_price,
    to_yfinance_ticker,
)


# ── to_yfinance_ticker (pure function) ──────────────────────────────────────


class TestToYfinanceTicker:
    def test_equity_in_nse(self):
        assert to_yfinance_ticker("RELIANCE", "EQUITY_IN", "NSE") == "RELIANCE.NS"

    def test_equity_in_bse(self):
        assert to_yfinance_ticker("RELIANCE", "EQUITY_IN", "BSE") == "RELIANCE.BO"

    def test_equity_in_default_nse(self):
        assert to_yfinance_ticker("RELIANCE", "EQUITY_IN") == "RELIANCE.NS"

    def test_equity_us(self):
        assert to_yfinance_ticker("AAPL", "EQUITY_US") == "AAPL"

    def test_crypto(self):
        assert to_yfinance_ticker("BTC", "CRYPTO") == "BTC-INR"

    def test_gold_etf(self):
        assert to_yfinance_ticker("GOLDBEES", "GOLD_ETF") == "GOLDBEES.NS"

    def test_mutual_fund_0p_code(self):
        assert to_yfinance_ticker("0P0000YWL1", "MUTUAL_FUND") == "0P0000YWL1.BO"

    def test_mutual_fund_already_suffixed_bo(self):
        assert to_yfinance_ticker("0P0000YWL1.BO", "MUTUAL_FUND") == "0P0000YWL1.BO"

    def test_mutual_fund_already_suffixed_ns(self):
        assert to_yfinance_ticker("0P0000YWL1.NS", "MUTUAL_FUND") == "0P0000YWL1.NS"

    def test_none_symbol(self):
        assert to_yfinance_ticker(None, "EQUITY_IN") is None

    def test_unsupported_fd(self):
        assert to_yfinance_ticker("SBI-FD", "FIXED_DEPOSIT") is None

    def test_unsupported_real_estate(self):
        assert to_yfinance_ticker("FLAT1", "REAL_ESTATE") is None

    def test_unsupported_ppf(self):
        assert to_yfinance_ticker("PPF1", "PPF") is None


# ── _safe_float, _safe_int, _is_nan (pure helpers) ──────────────────────────


class TestSafeFloat:
    def test_valid_float(self):
        assert _safe_float(123.456) == 123.46

    def test_none(self):
        assert _safe_float(None) is None

    def test_nan(self):
        assert _safe_float(float("nan")) is None

    def test_integer(self):
        assert _safe_float(42) == 42.0

    def test_zero(self):
        assert _safe_float(0) == 0.0


class TestSafeInt:
    def test_valid_int(self):
        assert _safe_int(42) == 42

    def test_float_to_int(self):
        assert _safe_int(42.9) == 42

    def test_none(self):
        assert _safe_int(None) is None

    def test_nan(self):
        assert _safe_int(float("nan")) is None


class TestIsNan:
    def test_nan(self):
        assert _is_nan(float("nan")) is True

    def test_not_nan(self):
        assert _is_nan(42.0) is False

    def test_none(self):
        assert _is_nan(None) is False

    def test_string(self):
        assert _is_nan("hello") is False

    def test_math_nan(self):
        assert _is_nan(math.nan) is True


# ── resolve_price (async, mocked Redis + DB) ────────────────────────────────


@pytest.mark.asyncio
async def test_resolve_price_cache_hit():
    """Tier 1: Redis cache hit returns cached price."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = json.dumps({
        "price": 2650.50,
        "previous_close": 2600.0,
        "day_change_pct": 1.94,
    })
    mock_db = AsyncMock()

    result = await resolve_price(
        db=mock_db, redis=mock_redis,
        symbol="RELIANCE", asset_class_code="EQUITY_IN",
        exchange="NSE", avg_buy_price=2500.0,
    )
    assert result["price"] == 2650.50
    assert result["source"] == "cache"
    assert result["day_change_pct"] == 1.94


@pytest.mark.asyncio
async def test_resolve_price_db_fallback():
    """Tier 2: Cache miss, DB has MarketData."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None

    mock_md = MagicMock()
    mock_md.current_price = 2700.0
    mock_md.previous_close = 2650.0
    mock_md.day_change_pct = 1.89

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_md

    mock_db = AsyncMock()
    mock_db.execute.return_value = mock_result

    result = await resolve_price(
        db=mock_db, redis=mock_redis,
        symbol="RELIANCE", asset_class_code="EQUITY_IN",
        exchange="NSE", avg_buy_price=2500.0,
    )
    assert result["price"] == 2700.0
    assert result["source"] == "db"


@pytest.mark.asyncio
async def test_resolve_price_cost_basis_fallback():
    """Tier 3: Cache miss, no DB data, returns avg_buy_price."""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None

    mock_db = AsyncMock()
    mock_db.execute.return_value = mock_result

    result = await resolve_price(
        db=mock_db, redis=mock_redis,
        symbol="RELIANCE", asset_class_code="EQUITY_IN",
        exchange="NSE", avg_buy_price=2500.0,
    )
    assert result["price"] == 2500.0
    assert result["source"] == "cost_basis"


@pytest.mark.asyncio
async def test_resolve_price_cost_basis_class():
    """Cost-basis asset class (FD) skips Redis/DB entirely."""
    mock_redis = AsyncMock()
    mock_db = AsyncMock()

    result = await resolve_price(
        db=mock_db, redis=mock_redis,
        symbol=None, asset_class_code="FIXED_DEPOSIT",
        exchange=None, avg_buy_price=100000.0,
    )
    assert result["price"] == 100000.0
    assert result["source"] == "cost_basis"
    # Redis and DB should not have been queried
    mock_redis.get.assert_not_called()
    mock_db.execute.assert_not_called()


# ── fetch_current_prices_batch (mocked HTTP) ────────────────────────────────


class TestFetchCurrentPricesBatch:
    def test_empty_tickers(self):
        assert fetch_current_prices_batch([]) == {}

    @patch("app.services.price_service._fetch_yahoo_chart")
    def test_successful_fetch(self, mock_chart):
        mock_chart.return_value = {
            "chart": {
                "result": [{
                    "meta": {
                        "regularMarketPrice": 2650.50,
                        "chartPreviousClose": 2600.0,
                    }
                }]
            }
        }
        result = fetch_current_prices_batch(["RELIANCE.NS"])
        assert "RELIANCE.NS" in result
        assert result["RELIANCE.NS"]["price"] == 2650.50
        assert result["RELIANCE.NS"]["previous_close"] == 2600.0

    @patch("app.services.price_service._fetch_yahoo_chart")
    def test_api_failure_graceful(self, mock_chart):
        mock_chart.return_value = None
        result = fetch_current_prices_batch(["RELIANCE.NS"])
        assert result == {}

    @patch("app.services.price_service._fetch_yahoo_chart")
    def test_no_chart_result(self, mock_chart):
        mock_chart.return_value = {"chart": {"result": None}}
        result = fetch_current_prices_batch(["RELIANCE.NS"])
        assert result == {}

    @patch("app.services.price_service._fetch_yahoo_chart")
    def test_no_market_price(self, mock_chart):
        mock_chart.return_value = {
            "chart": {"result": [{"meta": {}}]}
        }
        result = fetch_current_prices_batch(["RELIANCE.NS"])
        assert result == {}
