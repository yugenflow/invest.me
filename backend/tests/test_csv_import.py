import pytest
from app.services.csv_parser import parse_csv


def test_parse_zerodha_csv():
    csv_content = """Instrument,Qty.,Avg. cost,LTP,Cur. val,P&L,Net chg.,Day chg.
RELIANCE,10,2500.00,2600.00,26000.00,1000.00,4.00%,0.50%
TCS,5,3500.00,3600.00,18000.00,500.00,2.86%,0.30%"""

    rows = parse_csv(csv_content, "zerodha")
    assert len(rows) == 2
    assert rows[0]["symbol"] == "RELIANCE"
    assert rows[0]["quantity"] == 10
    assert rows[0]["avg_buy_price"] == 2500.0
    assert rows[0]["asset_class_code"] == "EQUITY_IN"


def test_parse_upstox_csv():
    csv_content = """Symbol,Company Name,Quantity,Average Price,LTP,Current Value,P&L
INFY,Infosys Ltd,20,1500.00,1550.00,31000.00,1000.00
WIPRO,Wipro Ltd,15,400.00,420.00,6300.00,300.00"""

    rows = parse_csv(csv_content, "upstox")
    assert len(rows) == 2
    assert rows[0]["symbol"] == "INFY"
    assert rows[0]["quantity"] == 20


def test_unsupported_broker():
    with pytest.raises(ValueError, match="Unsupported broker"):
        parse_csv("data", "unknown_broker")
