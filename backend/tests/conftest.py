import pytest
import uuid
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from sqlalchemy import select

from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.models.asset_class import AssetClass

# Use a separate test database or SQLite for tests
TEST_DATABASE_URL = settings.DATABASE_URL

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with test_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


SEED_ASSET_CLASSES = [
    {"code": "EQUITY_IN", "name": "Indian Equity", "category": "Equity",
     "fields_schema": {"required": ["symbol", "name", "quantity", "avg_buy_price", "exchange"], "optional": ["buy_date", "sebi_category"]}},
    {"code": "EQUITY_US", "name": "US Equity", "category": "Equity",
     "fields_schema": {"required": ["symbol", "name", "quantity", "avg_buy_price"], "optional": ["buy_date", "exchange"]}},
    {"code": "MUTUAL_FUND", "name": "Mutual Fund", "category": "Funds",
     "fields_schema": {"required": ["name", "quantity", "avg_buy_price"], "optional": ["symbol", "sebi_category", "institution"]}},
    {"code": "CRYPTO", "name": "Cryptocurrency", "category": "Crypto",
     "fields_schema": {"required": ["symbol", "name", "quantity", "avg_buy_price"], "optional": ["exchange"]}},
    {"code": "GOLD_PHYSICAL", "name": "Physical Gold", "category": "Gold",
     "fields_schema": {"required": ["name", "quantity", "avg_buy_price"], "optional": ["buy_date"]}},
    {"code": "GOLD_SGB", "name": "Sovereign Gold Bond", "category": "Gold",
     "fields_schema": {"required": ["name", "quantity", "avg_buy_price", "maturity_date", "interest_rate"], "optional": ["buy_date", "institution"]}},
    {"code": "GOLD_ETF", "name": "Gold ETF", "category": "Gold",
     "fields_schema": {"required": ["symbol", "name", "quantity", "avg_buy_price"], "optional": ["exchange"]}},
    {"code": "GOLD_DIGITAL", "name": "Digital Gold", "category": "Gold",
     "fields_schema": {"required": ["name", "quantity", "avg_buy_price"], "optional": ["institution"]}},
    {"code": "FIXED_DEPOSIT", "name": "Fixed Deposit", "category": "Fixed Income",
     "fields_schema": {"required": ["name", "avg_buy_price", "interest_rate", "maturity_date", "institution"], "optional": ["buy_date"]}},
    {"code": "PPF", "name": "Public Provident Fund", "category": "Fixed Income",
     "fields_schema": {"required": ["name", "avg_buy_price", "institution"], "optional": ["interest_rate", "maturity_date"]}},
    {"code": "EPF", "name": "Employee Provident Fund", "category": "Fixed Income",
     "fields_schema": {"required": ["name", "avg_buy_price"], "optional": ["institution", "interest_rate"]}},
    {"code": "NPS", "name": "National Pension System", "category": "Fixed Income",
     "fields_schema": {"required": ["name", "avg_buy_price"], "optional": ["institution"]}},
    {"code": "REAL_ESTATE", "name": "Real Estate", "category": "Real Estate",
     "fields_schema": {"required": ["name", "avg_buy_price"], "optional": ["buy_date", "institution"]}},
    {"code": "BOND", "name": "Bond", "category": "Fixed Income",
     "fields_schema": {"required": ["name", "quantity", "avg_buy_price", "interest_rate", "maturity_date"], "optional": ["symbol", "institution"]}},
    {"code": "OTHER", "name": "Other", "category": "Other",
     "fields_schema": {"required": ["name", "avg_buy_price"], "optional": ["quantity", "institution"]}},
]


@pytest.fixture(scope="session", autouse=True)
async def create_tables():
    """Create all tables and seed asset classes before tests, drop after.

    Skips DB setup if the database is unreachable (allows pure/mocked tests
    to run without Postgres).
    """
    _db_available = False
    try:
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _db_available = True
        print("\n[conftest] DB tables created successfully")
    except Exception as e:
        print(f"\n[conftest] DB not available, skipping table creation: {e}")

    if _db_available:
        try:
            async with test_session() as session:
                for ac_data in SEED_ASSET_CLASSES:
                    existing = await session.execute(
                        select(AssetClass).where(AssetClass.code == ac_data["code"])
                    )
                    if not existing.scalar_one_or_none():
                        session.add(AssetClass(**ac_data))
                await session.commit()
            print("[conftest] Asset classes seeded successfully")
        except Exception as e:
            print(f"[conftest] Failed to seed asset classes: {e}")

    yield

    if _db_available:
        try:
            async with test_engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
        except Exception:
            pass


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Create a test user and return auth headers."""
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "testpassword123",
        "full_name": "Test User",
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpassword123",
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
