import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_holding(client: AsyncClient, auth_headers: dict):
    res = await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "RELIANCE",
        "name": "Reliance Industries",
        "quantity": 10,
        "avg_buy_price": 2500.0,
        "exchange": "NSE",
    }, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["symbol"] == "RELIANCE"


@pytest.mark.asyncio
async def test_list_holdings(client: AsyncClient, auth_headers: dict):
    # Create a holding first
    await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "TCS",
        "name": "TCS Ltd",
        "quantity": 5,
        "avg_buy_price": 3500.0,
    }, headers=auth_headers)

    res = await client.get("/api/v1/holdings", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.asyncio
async def test_update_holding(client: AsyncClient, auth_headers: dict):
    create_res = await client.post("/api/v1/holdings", json={
        "asset_class_code": "EQUITY_IN",
        "symbol": "INFY",
        "name": "Infosys",
        "quantity": 20,
        "avg_buy_price": 1500.0,
    }, headers=auth_headers)
    holding_id = create_res.json()["id"]

    res = await client.patch(f"/api/v1/holdings/{holding_id}", json={
        "quantity": 30,
    }, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["quantity"] == 30


@pytest.mark.asyncio
async def test_delete_holding(client: AsyncClient, auth_headers: dict):
    create_res = await client.post("/api/v1/holdings", json={
        "asset_class_code": "FIXED_DEPOSIT",
        "name": "SBI FD",
        "avg_buy_price": 100000,
        "interest_rate": 7.0,
        "institution": "SBI",
    }, headers=auth_headers)
    holding_id = create_res.json()["id"]

    res = await client.delete(f"/api/v1/holdings/{holding_id}", headers=auth_headers)
    assert res.status_code == 204
