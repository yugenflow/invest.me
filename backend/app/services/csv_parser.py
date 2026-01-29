"""CSV parsers for Zerodha and Upstox broker exports."""
import csv
import io
from datetime import datetime


def parse_zerodha_csv(content: str) -> list[dict]:
    """Parse Zerodha holdings CSV format."""
    reader = csv.DictReader(io.StringIO(content))
    holdings = []
    for row in reader:
        try:
            holdings.append({
                "symbol": row.get("Instrument", row.get("instrument", row.get("Symbol", ""))).strip(),
                "name": row.get("Instrument", row.get("instrument", row.get("Symbol", ""))).strip(),
                "quantity": float(row.get("Qty.", row.get("qty", row.get("Quantity", 0)))),
                "avg_buy_price": float(row.get("Avg. cost", row.get("avg_cost", row.get("Average Price", 0)))),
                "asset_class_code": "EQUITY_IN",
                "exchange": row.get("Exchange", "NSE"),
                "buy_currency": "INR",
            })
        except (ValueError, KeyError):
            continue
    return holdings


def parse_upstox_csv(content: str) -> list[dict]:
    """Parse Upstox holdings CSV format."""
    reader = csv.DictReader(io.StringIO(content))
    holdings = []
    for row in reader:
        try:
            holdings.append({
                "symbol": row.get("Symbol", row.get("symbol", "")).strip(),
                "name": row.get("Company Name", row.get("Symbol", "")).strip(),
                "quantity": float(row.get("Quantity", row.get("quantity", 0))),
                "avg_buy_price": float(row.get("Average Price", row.get("avg_price", 0))),
                "asset_class_code": "EQUITY_IN",
                "exchange": row.get("Exchange", "NSE"),
                "buy_currency": "INR",
            })
        except (ValueError, KeyError):
            continue
    return holdings


PARSERS = {
    "zerodha": parse_zerodha_csv,
    "upstox": parse_upstox_csv,
}


def parse_csv(content: str, broker: str) -> list[dict]:
    parser = PARSERS.get(broker.lower())
    if not parser:
        raise ValueError(f"Unsupported broker: {broker}")
    return parser(content)
