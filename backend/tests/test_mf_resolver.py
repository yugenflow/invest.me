"""Tests for mf_resolver: _normalize_name (pure), _search_mfapi, _get_scheme_isin,
_search_yahoo_by_isin (mocked HTTP), resolve_mf_ticker_sync & resolve_mf_ticker (mocked chain)."""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.services.mf_resolver import (
    _normalize_name,
    _search_mfapi,
    _get_scheme_isin,
    _search_yahoo_by_isin,
    resolve_mf_ticker_sync,
    resolve_mf_ticker,
)


# ── _normalize_name (pure function) ─────────────────────────────────────────


class TestNormalizeName:
    def test_lowercasing(self):
        assert _normalize_name("HDFC Top 100 Fund") == "hdfc top 100 fund"

    def test_whitespace_collapsing(self):
        assert _normalize_name("HDFC   Top   100") == "hdfc top 100"

    def test_trimming(self):
        assert _normalize_name("  HDFC Top 100  ") == "hdfc top 100"

    def test_empty_string(self):
        assert _normalize_name("") == ""

    def test_already_normalized(self):
        assert _normalize_name("hdfc top 100") == "hdfc top 100"


# ── _search_mfapi (mocked HTTP) ─────────────────────────────────────────────


class TestSearchMfapi:
    @patch("app.services.mf_resolver.requests.get")
    def test_successful_search(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {"schemeCode": 12345, "schemeName": "HDFC Top 100 Fund - Growth"},
            {"schemeCode": 12346, "schemeName": "HDFC Top 100 Fund - IDCW"},
        ]
        mock_get.return_value = mock_resp

        result = _search_mfapi("HDFC Top 100")
        assert result is not None
        assert result["schemeCode"] == 12345

    @patch("app.services.mf_resolver.requests.get")
    def test_empty_results(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = []
        mock_get.return_value = mock_resp

        assert _search_mfapi("Nonexistent Fund XYZ") is None

    @patch("app.services.mf_resolver.requests.get")
    def test_network_error(self, mock_get):
        mock_get.side_effect = Exception("Connection timeout")
        assert _search_mfapi("HDFC Top 100") is None

    @patch("app.services.mf_resolver.requests.get")
    def test_non_200_status(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_get.return_value = mock_resp

        assert _search_mfapi("HDFC Top 100") is None


# ── _get_scheme_isin (mocked HTTP) ──────────────────────────────────────────


class TestGetSchemeIsin:
    @patch("app.services.mf_resolver.requests.get")
    def test_prefers_isin_growth(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "meta": {
                "isin_growth": "INF179K01YX0",
                "isin_div_reinvestment": "INF179K01YY8",
            }
        }
        mock_get.return_value = mock_resp

        assert _get_scheme_isin(12345) == "INF179K01YX0"

    @patch("app.services.mf_resolver.requests.get")
    def test_fallback_to_div_reinvestment(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "meta": {
                "isin_growth": None,
                "isin_div_reinvestment": "INF179K01YY8",
            }
        }
        mock_get.return_value = mock_resp

        assert _get_scheme_isin(12345) == "INF179K01YY8"

    @patch("app.services.mf_resolver.requests.get")
    def test_no_isin_available(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"meta": {}}
        mock_get.return_value = mock_resp

        assert _get_scheme_isin(12345) is None

    @patch("app.services.mf_resolver.requests.get")
    def test_api_error(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_get.return_value = mock_resp

        assert _get_scheme_isin(99999) is None


# ── _search_yahoo_by_isin (mocked HTTP) ─────────────────────────────────────


class TestSearchYahooByIsin:
    @patch("app.services.mf_resolver.requests.get")
    def test_returns_bo_symbol(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "quotes": [
                {"symbol": "0P0000YWL1.BO", "shortname": "HDFC Top 100"},
                {"symbol": "HDFC100.NS", "shortname": "HDFC Top 100"},
            ]
        }
        mock_get.return_value = mock_resp

        assert _search_yahoo_by_isin("INF179K01YX0") == "0P0000YWL1.BO"

    @patch("app.services.mf_resolver.requests.get")
    def test_returns_first_quote_fallback(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "quotes": [
                {"symbol": "SOMEFUND.NS", "shortname": "Some Fund"},
            ]
        }
        mock_get.return_value = mock_resp

        assert _search_yahoo_by_isin("INF179K01YX0") == "SOMEFUND.NS"

    @patch("app.services.mf_resolver.requests.get")
    def test_no_quotes(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"quotes": []}
        mock_get.return_value = mock_resp

        assert _search_yahoo_by_isin("INF000000000") is None

    @patch("app.services.mf_resolver.requests.get")
    def test_network_error(self, mock_get):
        mock_get.side_effect = Exception("Connection refused")
        assert _search_yahoo_by_isin("INF179K01YX0") is None


# ── resolve_mf_ticker_sync (mocked chain) ───────────────────────────────────


class TestResolveMfTickerSync:
    @patch("app.services.mf_resolver._search_yahoo_by_isin")
    @patch("app.services.mf_resolver._get_scheme_isin")
    @patch("app.services.mf_resolver._search_mfapi")
    def test_full_chain_success(self, mock_mfapi, mock_isin, mock_yahoo):
        mock_mfapi.return_value = {"schemeCode": 12345, "schemeName": "HDFC Top 100 Fund - Growth"}
        mock_isin.return_value = "INF179K01YX0"
        mock_yahoo.return_value = "0P0000YWL1.BO"

        result = resolve_mf_ticker_sync("HDFC Top 100")
        assert result is not None
        assert result["yf_ticker"] == "0P0000YWL1.BO"
        assert result["isin"] == "INF179K01YX0"
        assert result["amfi_code"] == "12345"

    @patch("app.services.mf_resolver._search_mfapi")
    def test_fails_at_mfapi(self, mock_mfapi):
        mock_mfapi.return_value = None
        assert resolve_mf_ticker_sync("Nonexistent Fund") is None

    @patch("app.services.mf_resolver._get_scheme_isin")
    @patch("app.services.mf_resolver._search_mfapi")
    def test_fails_at_isin(self, mock_mfapi, mock_isin):
        mock_mfapi.return_value = {"schemeCode": 12345, "schemeName": "Some Fund"}
        mock_isin.return_value = None
        assert resolve_mf_ticker_sync("Some Fund") is None

    @patch("app.services.mf_resolver._search_yahoo_by_isin")
    @patch("app.services.mf_resolver._get_scheme_isin")
    @patch("app.services.mf_resolver._search_mfapi")
    def test_fails_at_yahoo(self, mock_mfapi, mock_isin, mock_yahoo):
        mock_mfapi.return_value = {"schemeCode": 12345, "schemeName": "Some Fund"}
        mock_isin.return_value = "INF179K01YX0"
        mock_yahoo.return_value = None
        assert resolve_mf_ticker_sync("Some Fund") is None

    @patch("app.services.mf_resolver._search_yahoo_by_isin")
    @patch("app.services.mf_resolver._get_scheme_isin")
    @patch("app.services.mf_resolver._search_mfapi")
    def test_adds_bo_suffix_if_missing(self, mock_mfapi, mock_isin, mock_yahoo):
        mock_mfapi.return_value = {"schemeCode": 12345, "schemeName": "Some Fund"}
        mock_isin.return_value = "INF179K01YX0"
        mock_yahoo.return_value = "0P0000YWL1"  # No suffix

        result = resolve_mf_ticker_sync("Some Fund")
        assert result["yf_ticker"] == "0P0000YWL1.BO"


# ── resolve_mf_ticker (async, mocked Redis) ─────────────────────────────────


@pytest.mark.asyncio
async def test_resolve_mf_ticker_cache_hit():
    """Cache hit returns cached result without calling sync resolver."""
    cached_data = {
        "yf_ticker": "0P0000YWL1.BO",
        "isin": "INF179K01YX0",
        "amfi_code": "12345",
        "matched_name": "HDFC Top 100 Fund",
    }
    mock_redis = AsyncMock()
    mock_redis.get.return_value = json.dumps(cached_data)

    result = await resolve_mf_ticker("HDFC Top 100", redis=mock_redis)
    assert result == cached_data


@pytest.mark.asyncio
@patch("app.services.mf_resolver.resolve_mf_ticker_sync")
async def test_resolve_mf_ticker_cache_miss(mock_sync):
    """Cache miss calls sync resolver and stores in Redis."""
    resolved = {
        "yf_ticker": "0P0000YWL1.BO",
        "isin": "INF179K01YX0",
        "amfi_code": "12345",
        "matched_name": "HDFC Top 100 Fund",
    }
    mock_sync.return_value = resolved

    mock_redis = AsyncMock()
    mock_redis.get.return_value = None

    result = await resolve_mf_ticker("HDFC Top 100", redis=mock_redis)
    assert result == resolved
    mock_redis.setex.assert_called_once()


@pytest.mark.asyncio
@patch("app.services.mf_resolver.resolve_mf_ticker_sync")
async def test_resolve_mf_ticker_no_redis(mock_sync):
    """No Redis client still resolves via sync resolver."""
    resolved = {
        "yf_ticker": "0P0000YWL1.BO",
        "isin": "INF179K01YX0",
        "amfi_code": "12345",
        "matched_name": "HDFC Top 100 Fund",
    }
    mock_sync.return_value = resolved

    result = await resolve_mf_ticker("HDFC Top 100", redis=None)
    assert result == resolved
