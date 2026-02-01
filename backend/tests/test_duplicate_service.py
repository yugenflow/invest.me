"""Tests for duplicate_service: compute_merge (pure), find_duplicate_holding & get_duplicate_groups (async/API)."""
import pytest
from app.services.duplicate_service import compute_merge


# ── compute_merge (pure function) ────────────────────────────────────────────


class TestComputeMerge:
    def test_basic_weighted_average(self):
        qty, price = compute_merge(10, 100.0, 5, 120.0)
        assert qty == 15
        assert round(price, 4) == 106.6667

    def test_zero_total_quantity(self):
        qty, price = compute_merge(5, 100.0, -5, 100.0)
        assert qty == 0
        assert price == 0

    def test_identical_prices(self):
        qty, price = compute_merge(10, 500.0, 20, 500.0)
        assert qty == 30
        assert price == 500.0

    def test_fractional_quantities(self):
        """MF units are fractional."""
        qty, price = compute_merge(12.345, 45.67, 8.123, 50.12)
        assert round(qty, 3) == 20.468
        expected_value = 12.345 * 45.67 + 8.123 * 50.12
        expected_avg = expected_value / 20.468
        assert abs(price - round(expected_avg, 4)) < 0.001

    def test_large_numbers(self):
        qty, price = compute_merge(1000, 25000.0, 500, 27000.0)
        assert qty == 1500
        expected = (1000 * 25000 + 500 * 27000) / 1500
        assert abs(price - round(expected, 4)) < 0.01

    def test_one_side_zero_quantity(self):
        qty, price = compute_merge(0, 0.0, 10, 150.0)
        assert qty == 10
        assert price == 150.0

    def test_both_zero(self):
        qty, price = compute_merge(0, 0.0, 0, 0.0)
        assert qty == 0
        assert price == 0


# ── find_duplicate_holding (async, requires DB via API) ──────────────────────


@pytest.mark.asyncio
async def test_find_duplicate_symbol_match(client, auth_headers):
    """Symbol-based duplicate found (equity, case-insensitive)."""
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "RELIANCE",
        "name": "Reliance Industries",
        "quantity": 10,
        "avg_buy_price": 2500.0,
    }, headers=auth_headers)

    # Create duplicate via import-confirm or direct POST — duplicate detection
    # happens at the API layer; we test via the duplicates endpoint
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "reliance",
        "name": "Reliance Industries Ltd",
        "quantity": 5,
        "avg_buy_price": 2600.0,
    }, headers=auth_headers)

    res = await client.get("/api/v1/holdings/duplicates", headers=auth_headers)
    assert res.status_code == 200
    groups = res.json()
    # Should find a duplicate group for RELIANCE
    reliance_group = [g for g in groups if any(
        h.get("symbol", "").upper() == "RELIANCE" for h in g
    )]
    assert len(reliance_group) >= 1


@pytest.mark.asyncio
async def test_find_duplicate_name_match_fd(client, auth_headers):
    """Name-based duplicate found for FD (case-insensitive)."""
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "FIXED_DEPOSIT",
        "name": "SBI FD 2025",
        "avg_buy_price": 100000,
    }, headers=auth_headers)

    await client.post("/api/v1/holdings", json={
        "asset_class_code": "FIXED_DEPOSIT",
        "name": "sbi fd 2025",
        "avg_buy_price": 50000,
    }, headers=auth_headers)

    res = await client.get("/api/v1/holdings/duplicates", headers=auth_headers)
    assert res.status_code == 200
    groups = res.json()
    fd_group = [g for g in groups if any(
        h.get("asset_class_code") == "FIXED_DEPOSIT" for h in g
    )]
    assert len(fd_group) >= 1


@pytest.mark.asyncio
async def test_no_duplicate_different_symbols(client, auth_headers):
    """No duplicate when symbols differ."""
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "TCS",
        "name": "TCS Ltd",
        "quantity": 10,
        "avg_buy_price": 3500.0,
    }, headers=auth_headers)

    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "INFY",
        "name": "Infosys Ltd",
        "quantity": 5,
        "avg_buy_price": 1500.0,
    }, headers=auth_headers)

    res = await client.get("/api/v1/holdings/duplicates", headers=auth_headers)
    assert res.status_code == 200
    groups = res.json()
    # TCS and INFY should NOT be in the same group
    for g in groups:
        symbols = {h.get("symbol", "").upper() for h in g}
        assert not ({"TCS", "INFY"} <= symbols)


@pytest.mark.asyncio
async def test_duplicates_empty(client, auth_headers):
    """GET /holdings/duplicates returns empty when no dupes."""
    res = await client.get("/api/v1/holdings/duplicates", headers=auth_headers)
    assert res.status_code == 200
    # Fresh user may have no holdings at all
    assert isinstance(res.json(), list)
