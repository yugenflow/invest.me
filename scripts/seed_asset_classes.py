"""Seed asset_classes table with reference data."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import async_session
from app.models.asset_class import AssetClass
from sqlalchemy import select

ASSET_CLASSES = [
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


async def seed():
    async with async_session() as session:
        for ac_data in ASSET_CLASSES:
            existing = await session.execute(
                select(AssetClass).where(AssetClass.code == ac_data["code"])
            )
            if not existing.scalar_one_or_none():
                session.add(AssetClass(**ac_data))
        await session.commit()
        print(f"Seeded {len(ASSET_CLASSES)} asset classes.")


if __name__ == "__main__":
    asyncio.run(seed())
