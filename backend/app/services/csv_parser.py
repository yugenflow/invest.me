"""CSV parsers for broker exports with smart auto-detection.

Handles real broker export quirks:
- Metadata/summary rows before the actual header row
- Headers with count suffixes like "Symbol (13)"
- Indian number formatting with commas ("1,09,301.40")
- Percentage and +/- prefixed values

Essential columns we look for (everything else is derivable):
  1. Symbol   — stock ticker / instrument name
  2. Quantity — number of shares/units held
  3. Avg Price — average buy price per unit
  4. Category — asset class / segment (optional, defaults to EQUITY_IN)
"""
import csv
import io
import re


# --- Utility helpers ---

def _clean_number(val: str) -> float:
    """Parse a number that may have Indian comma formatting, quotes, +/- signs, or % suffix.

    Examples: "1,09,301.40" -> 109301.40, "+47.39%" -> 47.39, "-2,215.41" -> -2215.41
    """
    if not val or not isinstance(val, str):
        return 0.0
    cleaned = val.strip().strip('"').strip("'")
    cleaned = cleaned.rstrip("%")
    cleaned = cleaned.replace(",", "")
    cleaned = cleaned.lstrip("+")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def _clean_header(header: str) -> str:
    """Strip count suffixes and whitespace from a header.

    Example: "Symbol (13)" -> "Symbol"
    """
    cleaned = header.strip()
    cleaned = re.sub(r"\s*\(\d+\)\s*$", "", cleaned)
    return cleaned


def _count_text_cells(cells: list[str]) -> int:
    """Count non-numeric, non-empty cells in a row."""
    count = 0
    for cell in cells:
        val = cell.strip().strip('"')
        if not val:
            continue
        try:
            float(val.replace(",", "").lstrip("+").rstrip("%"))
            continue
        except ValueError:
            pass
        count += 1
    return count


def _find_header_row(content: str) -> tuple[int, list[str]]:
    """Scan the CSV to find the real header row, skipping metadata/summary rows.

    Picks the row with the most text (non-numeric) cells among the first 10 rows.
    """
    reader = csv.reader(io.StringIO(content))
    best_index = 0
    best_row: list[str] = []
    best_count = 0

    for i, row in enumerate(reader):
        if i > 10:
            break
        tc = _count_text_cells(row)
        if tc > best_count:
            best_count = tc
            best_index = i
            best_row = row

    if best_row:
        return (best_index, [_clean_header(h) for h in best_row])

    reader = csv.reader(io.StringIO(content))
    try:
        first = next(reader)
        return (0, [_clean_header(h) for h in first])
    except StopIteration:
        return (0, [])


def _get_data_rows(content: str, header_row_index: int) -> csv.DictReader:
    """Return a DictReader starting from the data rows, using cleaned headers."""
    lines = content.splitlines()
    if header_row_index >= len(lines):
        return csv.DictReader(io.StringIO(""))

    header_line = lines[header_row_index]
    header_reader = csv.reader(io.StringIO(header_line))
    headers = [_clean_header(h) for h in next(header_reader)]

    data_content = "\n".join(lines[header_row_index + 1:])
    reader = csv.DictReader(io.StringIO(data_content), fieldnames=headers)
    return reader


# --- Smart fuzzy column matching ---
#
# Each field has:
#   - exact aliases: matched as full header name (lowercased)
#   - keywords: if ANY keyword appears anywhere in the header, it's a candidate
#
# Priority: exact alias > keyword match
# Essential fields: symbol, quantity, avg_buy_price (must find these 3 to auto-parse)
# Nice-to-have: name, asset_class_code (category), exchange, buy_currency

FIELD_MATCH_RULES: dict[str, dict] = {
    "symbol": {
        "exact": ["symbol", "ticker", "instrument", "scrip", "scrip code",
                  "stock symbol", "script code", "tradingsymbol", "trading symbol",
                  "security", "security name", "stock", "stock name", "isin"],
        "keywords": ["symbol", "ticker", "scrip", "instrument", "security", "stock", "isin"],
    },
    "name": {
        "exact": ["name", "company name", "company", "stock name", "scrip name",
                  "security name", "security", "description"],
        "keywords": ["company", "name", "security", "description"],
    },
    "quantity": {
        "exact": ["quantity", "qty", "qty.", "shares", "units", "net qty",
                  "holding qty", "total qty", "total quantity", "no. of shares",
                  "number of shares", "holdings"],
        "keywords": ["qty", "quantity", "shares", "units", "holdings"],
    },
    "avg_buy_price": {
        "exact": ["avg. cost", "average price", "avg price", "avg_price", "avg cost",
                  "buy price", "purchase price", "cost price", "buy avg", "avg. price",
                  "average cost", "buy avg.", "avg buy price", "cost"],
        "keywords": ["avg", "average", "cost", "buy price", "purchase"],
    },
    "asset_class_code": {
        "exact": ["asset class", "asset_class", "segment", "category", "type",
                  "instrument type", "asset type"],
        "keywords": ["category", "segment", "asset", "type"],
    },
    "exchange": {
        "exact": ["exchange", "market", "exch", "exchange name"],
        "keywords": ["exchange", "exch"],
    },
    "buy_currency": {
        "exact": ["currency", "buy_currency", "ccy", "trade currency"],
        "keywords": ["currency", "ccy"],
    },
}

# Fields we must find to auto-parse (without manual column mapping)
ESSENTIAL_FIELDS = {"symbol", "quantity", "avg_buy_price"}


def fuzzy_match_columns(headers: list[str]) -> dict[str, str]:
    """Smart column matching: maps CSV headers to our canonical fields.

    Strategy:
    1. Try exact alias match (header lowercased == alias)
    2. Try keyword match (any keyword is a substring of the header)
    3. For ambiguous matches, prefer the first header that matches

    Returns dict mapping our field name -> CSV header name.
    """
    mapping: dict[str, str] = {}
    used_headers: set[str] = set()  # prevent double-mapping a single header

    # Pass 1: Exact alias matches (highest confidence)
    for field, rules in FIELD_MATCH_RULES.items():
        if field in mapping:
            continue
        for header in headers:
            if header in used_headers:
                continue
            header_low = header.lower().strip()
            if header_low in rules["exact"]:
                mapping[field] = header
                used_headers.add(header)
                break

    # Pass 2: Keyword substring matches (lower confidence)
    for field, rules in FIELD_MATCH_RULES.items():
        if field in mapping:
            continue
        for header in headers:
            if header in used_headers:
                continue
            header_low = header.lower().strip()
            for kw in rules["keywords"]:
                if kw in header_low:
                    mapping[field] = header
                    used_headers.add(header)
                    break
            if field in mapping:
                break

    return mapping


def has_essential_columns(mapping: dict[str, str]) -> bool:
    """Check if we found the 3 essential columns: symbol, quantity, avg_buy_price."""
    return all(f in mapping for f in ESSENTIAL_FIELDS)


# --- Broker-specific parsers ---

def parse_zerodha_csv(content: str) -> list[dict]:
    """Parse Zerodha holdings CSV format."""
    header_idx, _h = _find_header_row(content)
    reader = _get_data_rows(content, header_idx)
    holdings = []
    for row in reader:
        try:
            symbol = (row.get("Instrument") or row.get("instrument") or row.get("Symbol") or "").strip()
            if not symbol:
                continue
            qty = _clean_number(row.get("Qty.") or row.get("qty") or row.get("Quantity") or "0")
            if qty == 0:
                continue
            holdings.append({
                "symbol": symbol,
                "name": symbol,
                "quantity": qty,
                "avg_buy_price": _clean_number(row.get("Avg. cost") or row.get("avg_cost") or row.get("Average Price") or "0"),
                "asset_class_code": "EQUITY_IN",
                "exchange": (row.get("Exchange") or "NSE").strip(),
                "buy_currency": "INR",
            })
        except (ValueError, KeyError):
            continue
    return holdings


def parse_upstox_csv(content: str) -> list[dict]:
    """Parse Upstox holdings CSV format."""
    header_idx, _h = _find_header_row(content)
    reader = _get_data_rows(content, header_idx)
    holdings = []
    for row in reader:
        try:
            symbol = (row.get("Symbol") or row.get("symbol") or "").strip()
            if not symbol:
                continue
            qty = _clean_number(row.get("Net Qty") or row.get("Quantity") or row.get("quantity") or "0")
            if qty == 0:
                continue
            category = (row.get("Category") or row.get("Exchange") or "NSE").strip()
            exchange = category.split()[0] if category else "NSE"
            holdings.append({
                "symbol": symbol,
                "name": row.get("Company Name") or symbol,
                "quantity": qty,
                "avg_buy_price": _clean_number(
                    row.get("Avg. Price") or row.get("Average Price") or row.get("avg_price") or "0"
                ),
                "asset_class_code": "EQUITY_IN",
                "exchange": exchange,
                "buy_currency": "INR",
            })
        except (ValueError, KeyError):
            continue
    return holdings


PARSERS = {
    "zerodha": parse_zerodha_csv,
    "upstox": parse_upstox_csv,
}


# --- Broker auto-detection ---

BROKER_SIGNATURES: dict[str, set[str]] = {
    "zerodha": {"Instrument", "Qty.", "Avg. cost"},
    "upstox": {"Symbol", "Net Qty", "Avg. Price", "Category"},
}


def detect_broker(headers: list[str]) -> tuple[str | None, float]:
    """Detect broker from CSV headers."""
    header_set = {h.strip() for h in headers}
    best_broker = None
    best_score = 0.0
    for broker, signature in BROKER_SIGNATURES.items():
        if not signature:
            continue
        matched = len(header_set & signature)
        score = matched / len(signature)
        if score > best_score:
            best_score = score
            best_broker = broker
    return (best_broker, best_score) if best_score > 0 else (None, 0.0)


# --- Generic CSV parser ---

def parse_generic_csv(content: str, column_mapping: dict[str, str]) -> list[dict]:
    """Parse any CSV using a column mapping (our field -> CSV header name)."""
    header_idx, _h = _find_header_row(content)
    reader = _get_data_rows(content, header_idx)
    holdings = []

    for row in reader:
        try:
            symbol = (row.get(column_mapping.get("symbol", "")) or "").strip()
            name_col = column_mapping.get("name", column_mapping.get("symbol", ""))
            name = (row.get(name_col) or symbol).strip()
            quantity = _clean_number(row.get(column_mapping.get("quantity", "")) or "0")
            avg_buy_price = _clean_number(row.get(column_mapping.get("avg_buy_price", "")) or "0")

            if not symbol or quantity == 0:
                continue

            # Extract exchange from category-style fields like "NSE EQ" -> "NSE"
            raw_exchange = (row.get(column_mapping.get("exchange", "")) or "").strip()
            exchange = raw_exchange.split()[0] if raw_exchange else "NSE"

            holdings.append({
                "symbol": symbol,
                "name": name or symbol,
                "quantity": quantity,
                "avg_buy_price": avg_buy_price,
                "asset_class_code": (row.get(column_mapping.get("asset_class_code", "")) or "EQUITY_IN").strip() or "EQUITY_IN",
                "exchange": exchange or "NSE",
                "buy_currency": (row.get(column_mapping.get("buy_currency", "")) or "INR").strip() or "INR",
            })
        except (ValueError, KeyError):
            continue

    return holdings


# --- Main entry point ---

def parse_csv(
    content: str,
    broker: str | None = None,
    column_mapping: dict[str, str] | None = None,
) -> tuple[list[dict], str | None, float]:
    """Parse CSV content with hybrid detection.

    Returns (rows, detected_broker, confidence).

    Priority:
    1. Explicit broker → use broker-specific parser
    2. Explicit column_mapping → use generic parser
    3. Auto-detect broker by header signatures
    4. Smart fuzzy match: find essential columns (symbol, qty, avg price) by
       alias + keyword matching → generic parser
    5. Nothing worked → return empty rows + headers for manual mapping UI
    """
    # 1. Explicit broker
    if broker:
        parser = PARSERS.get(broker.lower())
        if not parser:
            raise ValueError(f"Unsupported broker: {broker}")
        return (parser(content), broker, 1.0)

    # Find the real header row
    header_idx, headers = _find_header_row(content)
    if not headers:
        raise ValueError("CSV file is empty or has no recognizable headers")

    # 2. Explicit column mapping
    if column_mapping:
        rows = parse_generic_csv(content, column_mapping)
        return (rows, None, 0.0)

    # 3. Auto-detect known broker
    detected_broker, confidence = detect_broker(headers)
    if detected_broker and confidence >= 0.8:
        parser = PARSERS.get(detected_broker)
        if parser:
            rows = parser(content)
            if rows:
                return (rows, detected_broker, confidence)

    # 4. Smart fuzzy match on essential columns
    fuzzy_mapping = fuzzy_match_columns(headers)
    if has_essential_columns(fuzzy_mapping):
        rows = parse_generic_csv(content, fuzzy_mapping)
        if rows:
            return (rows, detected_broker, confidence)

    # 5. Nothing worked — return headers for manual column mapping
    return ([], detected_broker, confidence)
