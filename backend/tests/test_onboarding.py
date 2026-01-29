import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_risk_profile(client: AsyncClient, auth_headers: dict):
    res = await client.post("/api/v1/onboarding/risk-profile", json={
        "age": 30,
        "monthly_income": 100000,
        "savings": 500000,
        "liabilities": 200000,
        "scenario_responses": {
            "market_drop": 3,
            "windfall": 4,
            "time_horizon": 4,
            "loss_tolerance": 3,
            "volatility": 3,
        },
        "goals": [
            {"goal_name": "Retirement", "target_amount": 10000000, "horizon_years": 25}
        ],
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] is not None
    assert data["risk_persona"] is not None
    assert data["is_current"] is True


@pytest.mark.asyncio
async def test_get_risk_profile(client: AsyncClient, auth_headers: dict):
    # First create one
    await client.post("/api/v1/onboarding/risk-profile", json={
        "age": 25,
        "monthly_income": 80000,
        "savings": 300000,
        "liabilities": 0,
        "scenario_responses": {"market_drop": 4, "windfall": 5},
    }, headers=auth_headers)

    res = await client.get("/api/v1/onboarding/risk-profile", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["is_current"] is True
