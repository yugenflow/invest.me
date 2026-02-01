import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard(client: AsyncClient, auth_headers: dict):
    # Add some holdings first
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "HDFC",
        "name": "HDFC Bank",
        "quantity": 10,
        "avg_buy_price": 1600.0,
    }, headers=auth_headers)

    res = await client.get("/api/v1/dashboard", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "allocation" in data
    assert "performance" in data
    assert "top_holdings" in data


@pytest.mark.asyncio
async def test_portfolio_summary(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/portfolio/summary", headers=auth_headers)
    assert res.status_code == 200
    assert "total_invested" in res.json()


@pytest.mark.asyncio
async def test_portfolio_allocation(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/portfolio/allocation", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_portfolio_performance(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/portfolio/performance?days=30", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert "portfolio" in data
    assert isinstance(data["portfolio"], list)
