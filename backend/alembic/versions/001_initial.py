"""initial

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("pan_hash", sa.String(64), nullable=True),
        sa.Column("preferred_currency", sa.String(3), server_default="INR"),
        sa.Column("onboarding_completed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Risk Profiles
    op.create_table(
        "risk_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("version", sa.Integer(), server_default="1"),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("monthly_income", sa.Float(), nullable=True),
        sa.Column("savings", sa.Float(), nullable=True),
        sa.Column("liabilities", sa.Float(), nullable=True),
        sa.Column("scenario_responses", postgresql.JSONB(), nullable=True),
        sa.Column("risk_score", sa.Integer(), nullable=True),
        sa.Column("risk_persona", sa.String(50), nullable=True),
        sa.Column("is_current", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Asset Classes
    op.create_table(
        "asset_classes",
        sa.Column("code", sa.String(30), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("fields_schema", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Holdings
    op.create_table(
        "holdings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("asset_class_code", sa.String(30), sa.ForeignKey("asset_classes.code"), nullable=False),
        sa.Column("symbol", sa.String(50), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("quantity", sa.Float(), server_default="0"),
        sa.Column("avg_buy_price", sa.Float(), server_default="0"),
        sa.Column("buy_currency", sa.String(3), server_default="INR"),
        sa.Column("exchange", sa.String(20), nullable=True),
        sa.Column("buy_date", sa.Date(), nullable=True),
        sa.Column("maturity_date", sa.Date(), nullable=True),
        sa.Column("interest_rate", sa.Float(), nullable=True),
        sa.Column("institution", sa.String(255), nullable=True),
        sa.Column("sebi_category", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Transactions
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("holding_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("holdings.id"), nullable=True),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("symbol", sa.String(50), nullable=True),
        sa.Column("quantity", sa.Float(), server_default="0"),
        sa.Column("price", sa.Float(), server_default="0"),
        sa.Column("currency", sa.String(3), server_default="INR"),
        sa.Column("total_amount", sa.Float(), server_default="0"),
        sa.Column("fees", sa.Float(), server_default="0"),
        sa.Column("transaction_date", sa.Date(), nullable=True),
        sa.Column("broker", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Broker Connections
    op.create_table(
        "broker_connections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("broker_name", sa.String(50), nullable=False),
        sa.Column("access_token_enc", sa.String(500), nullable=True),
        sa.Column("refresh_token_enc", sa.String(500), nullable=True),
        sa.Column("token_expiry", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Market Data
    op.create_table(
        "market_data",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("symbol", sa.String(50), nullable=False, index=True),
        sa.Column("exchange", sa.String(20), nullable=True),
        sa.Column("current_price", sa.Float(), nullable=True),
        sa.Column("previous_close", sa.Float(), nullable=True),
        sa.Column("day_change_pct", sa.Float(), nullable=True),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("last_updated", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("symbol", "exchange", name="uq_market_data_symbol_exchange"),
    )

    # Signals
    op.create_table(
        "signals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("related_symbol", sa.String(50), nullable=True),
        sa.Column("signal_type", sa.String(50), nullable=False),
        sa.Column("headline", sa.String(500), nullable=False),
        sa.Column("severity", sa.Integer(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Reports
    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("symbol", sa.String(50), nullable=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("analyst_rating", sa.String(50), nullable=True),
        sa.Column("target_prices", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Goals
    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("goal_name", sa.String(255), nullable=False),
        sa.Column("target_amount", sa.Float(), server_default="0"),
        sa.Column("horizon_years", sa.Integer(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Currencies
    op.create_table(
        "currencies",
        sa.Column("code", sa.String(3), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("symbol", sa.String(5), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Exchange Rates
    op.create_table(
        "exchange_rates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("from_currency", sa.String(3), sa.ForeignKey("currencies.code"), nullable=False),
        sa.Column("to_currency", sa.String(3), sa.ForeignKey("currencies.code"), nullable=False),
        sa.Column("rate", sa.Float(), nullable=False),
        sa.Column("last_updated", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("exchange_rates")
    op.drop_table("currencies")
    op.drop_table("goals")
    op.drop_table("reports")
    op.drop_table("signals")
    op.drop_table("market_data")
    op.drop_table("broker_connections")
    op.drop_table("transactions")
    op.drop_table("holdings")
    op.drop_table("asset_classes")
    op.drop_table("risk_profiles")
    op.drop_table("users")
