import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    email = f"signup-{uuid.uuid4().hex[:8]}@example.com"
    res = await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Signup User",
    })
    assert res.status_code == 201
    assert res.json()["email"] == email


@pytest.mark.asyncio
async def test_signup_duplicate(client: AsyncClient):
    email = f"dup-{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Dup User",
    })
    res = await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Dup User 2",
    })
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    email = f"login-{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Login User",
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpassword123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    email = f"wrongpw-{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Wrong PW User",
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "wrongpassword",
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/users/me", headers=auth_headers)
    assert res.status_code == 200
    assert "email" in res.json()


@pytest.mark.asyncio
async def test_unauthorized(client: AsyncClient):
    res = await client.get("/api/v1/users/me")
    assert res.status_code == 403
