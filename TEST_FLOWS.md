# Import Holdings — Test Flows

## 1. Import Page Layout

**URL:** `/import`

| # | Test | Expected |
|---|------|----------|
| 1.1 | Navigate to `/import` | 4 cards in 2x2 grid |
| 1.2 | Check card order | CSV (recommended) + Manual on top row; Connectors + Screenshot on bottom row |
| 1.3 | CSV card | Green "Recommended" badge above card, lime ring border, "Upload File" button enabled |
| 1.4 | Manual card | "Start Entry" button enabled |
| 1.5 | Connectors card | Button disabled, grayed out, "Coming Soon" text below |
| 1.6 | Screenshot card | Button disabled, grayed out, "Coming Soon" text below |
| 1.7 | Each card | Shows clock icon + time estimate, icon in lime circle, title (xl), description (base), CTA button (lg) |
| 1.8 | Responsive | 1 col on mobile, 2 cols on sm+ |
| 1.9 | Dark mode | All 4 cards render correctly in dark theme |

---

## 2. CSV Import Flow

### 2A. Step 1 — Upload (with Broker Selector)

| # | Test | Expected |
|---|------|----------|
| 2A.1 | Click "Upload File" | Modal opens, title "Import from CSV" |
| 2A.2 | Step indicator | Shows `● Upload ── ○ Review ── ○ Confirm` |
| 2A.3 | Broker dropdown | Shows "Auto-detect (recommended)", "Upstox", "Zerodha" |
| 2A.4 | DropZone | Shows upload icon + "Drag & drop your CSV file here" + "or click to browse" |
| 2A.5 | Click dropzone | File picker opens, only `.csv` files selectable |
| 2A.6 | Select a file | File name shown with FileText icon |
| 2A.7 | "Upload & Parse" button | Appears after file is selected |
| 2A.8 | Press Escape | Modal closes, state resets |
| 2A.9 | Click backdrop | Modal closes, state resets |
| 2A.10 | Re-open modal | Starts fresh — no stale file/broker selection |

### 2B. Upstox CSV (Auto-detect)

| # | Test | Expected |
|---|------|----------|
| 2B.1 | Upload `upstox_export.csv` with broker = "Auto-detect" | Toast: "13 holdings found (upstox)" |
| 2B.2 | Parser handles metadata rows 1-3 | Summary rows skipped, headers detected at row 4 |
| 2B.3 | Parser handles `Symbol (13)` header | Cleaned to "Symbol" |
| 2B.4 | Parser handles Indian number formatting | `"1,09,301.40"` parsed as `109301.40` |
| 2B.5 | All 13 holdings shown in review table | Symbols: HDFCBANK, BRITANNIA, MOTHERSON, HCLTECH, AVANTIFEED, KOTAKBANK, GOLDIETF, LTTS, MSUMI, ZYDUSLIFE, NH, MARKSANS, ADVENZYMES |
| 2B.6 | Exchange field | Extracted from "NSE EQ" → "NSE" |
| 2B.7 | Avg Price values | Correct: HDFCBANK=718.21, BRITANNIA=5885.24, etc. |

### 2C. Upstox CSV (Explicit Broker Selection)

| # | Test | Expected |
|---|------|----------|
| 2C.1 | Select "Upstox" from broker dropdown, upload CSV | Same result as auto-detect, confidence=1.0 |

### 2D. Zerodha CSV (when sample available)

| # | Test | Expected |
|---|------|----------|
| 2D.1 | Upload Zerodha format CSV | Auto-detects "zerodha", parses correctly |
| 2D.2 | Select "Zerodha" from dropdown | Same result with confidence=1.0 |

### 2E. Unknown CSV (Column Mapper)

| # | Test | Expected |
|---|------|----------|
| 2E.1 | Upload CSV with unusual headers (e.g. `Ticker, Shares, Cost Basis`) | Column Mapper UI appears on Step 1 |
| 2E.2 | Mapper shows all CSV headers | Each header has a dropdown to map to our fields |
| 2E.3 | "Apply Mapping" disabled | Until Symbol + Quantity are mapped |
| 2E.4 | Map Symbol + Quantity + Avg Price → Apply | Re-parses CSV, advances to Step 2 |

### 2F. Step 2 — Review & Edit

| # | Test | Expected |
|---|------|----------|
| 2F.1 | Step indicator | `● Upload ── ● Review ── ○ Confirm` |
| 2F.2 | Editable table columns | Name, Symbol, Asset Class, Qty, Avg Price, Currency |
| 2F.3 | Edit a cell | Value updates in real-time |
| 2F.4 | Asset Class dropdown | Indian Equity, US Equity, MF, Crypto, FD, Gold |
| 2F.5 | Currency dropdown | INR, USD |
| 2F.6 | Delete row (Trash icon) | Row removed, count/total updated |
| 2F.7 | Footer | Shows "X holdings" and "Total value: ₹Y" — updates live |
| 2F.8 | "Back" button | Returns to Step 1 (file still selected) |
| 2F.9 | "Next" button | Advances to Step 3 |

### 2G. Step 3 — Confirm

| # | Test | Expected |
|---|------|----------|
| 2G.1 | Step indicator | All 3 steps active |
| 2G.2 | Read-only table | Symbol, Name, Qty, Avg Price, Value — not editable |
| 2G.3 | "Back" button | Returns to Step 2 (edits preserved) |
| 2G.4 | "Import X Holdings" button | Spinner while confirming |
| 2G.5 | On success | Toast "Import complete!", success screen with checkmark |
| 2G.6 | Success screen | Shows count, "View Portfolio" link, "Import More" button |
| 2G.7 | "View Portfolio" | Navigates to `/portfolio` |
| 2G.8 | "Import More" | Modal closes |

### 2H. Error Cases

| # | Test | Expected |
|---|------|----------|
| 2H.1 | Upload non-CSV file | Rejected by dropzone file filter |
| 2H.2 | Upload empty CSV | Toast: "No valid data found in CSV" or column mapper |
| 2H.3 | Backend down | Toast with error message |
| 2H.4 | All rows 0 qty → confirm | Toast: "No valid holdings to import" |

---

## 3. Manual Entry Flow

### 3A. Step 1 — Entry

| # | Test | Expected |
|---|------|----------|
| 3A.1 | Click "Start Entry" | Modal opens, title "Manual Entry" |
| 3A.2 | Step indicator | `● Entry ── ○ Confirm` |
| 3A.3 | Default Asset Class dropdown | Defaults to "Indian Equity" |
| 3A.4 | Table | 1 blank row, all fields empty |
| 3A.5 | Type values | Name, Symbol, Qty, Avg Price all editable |
| 3A.6 | "Add Row" (+) button | Adds another blank row below |
| 3A.7 | Change default asset class | All existing rows update their asset class dropdown |
| 3A.8 | Delete row | Trash icon removes row, count updates |
| 3A.9 | Footer | Holding count + total value, updates live |
| 3A.10 | "Review (N)" button | Shows count of valid rows (symbol + qty > 0) |
| 3A.11 | Button disabled when 0 valid | Cannot proceed without data |
| 3A.12 | Fill 1+ valid rows → click Review | Advances to Step 2 |

### 3B. Step 2 — Confirm

| # | Test | Expected |
|---|------|----------|
| 3B.1 | Read-only review table | Only shows valid rows (filters blank/zero) |
| 3B.2 | "Back" button | Returns to Step 1, entries preserved |
| 3B.3 | "Import X Holdings" | Spinner → success screen |
| 3B.4 | Success screen | Checkmark, count, "View Portfolio" + "Import More" |

---

## 4. Font Size Consistency

| # | Area | Expected Size |
|---|------|---------------|
| 4.1 | Card titles | `text-xl` (20px), font-bold |
| 4.2 | Card descriptions | `text-base` (16px) |
| 4.3 | Card time estimates | `text-sm` (14px) |
| 4.4 | Card CTA buttons | `size="lg"` |
| 4.5 | Table body text | `text-base` (16px) |
| 4.6 | Table headers | `text-sm` uppercase tracking-wide |
| 4.7 | Table inputs | `text-base` (16px) |
| 4.8 | Modal title | `text-lg` (18px) |
| 4.9 | Step indicator labels | `text-sm` (14px), font-semibold |
| 4.10 | DropZone main text | `text-base` (16px) |
| 4.11 | Footer summary | `text-base` (16px) |
| 4.12 | Success heading | `text-2xl` (24px) |
| 4.13 | Matches sidebar nav | Sidebar uses `text-base` for labels — consistent |

---

## 5. Dark Mode

Test each screen in dark mode:

| # | Component | Check |
|---|-----------|-------|
| 5.1 | Method cards | Dark backgrounds, readable text, lime accents |
| 5.2 | Modal overlay | `backdrop-blur` visible |
| 5.3 | Modal body | Dark card background |
| 5.4 | Editable table inputs | Dark bg, light text, visible borders |
| 5.5 | Dropdowns (Select) | Dark background |
| 5.6 | DropZone | Dashed border visible, drag-active state |
| 5.7 | Success screen | Lime checkmark circle on dark bg |
| 5.8 | Column mapper | Dark border panel, readable text |

---

## 6. Backend API (curl / Postman)

### 6A. Auto-detect Upstox

```bash
curl -X POST http://localhost:8000/api/v1/import/csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@upstox_export.csv"
```
- `detected_broker: "upstox"`, `confidence: 1.0`, `count: 13`

### 6B. Explicit broker

```bash
curl -X POST http://localhost:8000/api/v1/import/csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@upstox_export.csv" \
  -F "broker=upstox"
```
- Same result, confidence=1.0

### 6C. Column mapping fallback

```bash
curl -X POST http://localhost:8000/api/v1/import/csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@unknown_format.csv"
```
- `rows: []`, `headers: [...]`, low confidence

### 6D. Explicit column mapping

```bash
curl -X POST http://localhost:8000/api/v1/import/csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@unknown_format.csv" \
  -F 'column_mapping={"symbol":"Ticker","quantity":"Shares","avg_buy_price":"Cost"}'
```
- Parsed rows returned using the mapping

### 6E. Confirm import

```bash
curl -X POST http://localhost:8000/api/v1/import/csv/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rows":[{"symbol":"HDFCBANK","name":"HDFCBANK","quantity":117,"avg_buy_price":718.21,"asset_class_code":"EQUITY_IN","buy_currency":"INR","exchange":"NSE"}],"broker":"upstox"}'
```
- Creates holding + transaction, returns holding object

---

## 7. Quick Smoke Test

1. `/import` → see 4 cards, 2 disabled, 2 active, CSV has "Recommended" badge
2. CSV flow: select "Upstox" broker → upload `upstox_export.csv` → 13 holdings parsed → edit a row → confirm → success
3. CSV flow: leave "Auto-detect" → upload same file → same result
4. Manual flow: add 2 rows → review → confirm → success
5. Go to `/portfolio` → verify imported holdings appear

---

## 8. Parser Edge Cases

| # | Test | Expected |
|---|------|----------|
| 8.1 | CSV with BOM (byte order mark) | `utf-8-sig` decoding handles it |
| 8.2 | CSV with 3 metadata rows before headers | `_find_header_row` skips them |
| 8.3 | Header `Symbol (13)` | Cleaned to `Symbol` |
| 8.4 | Number `"1,09,301.40"` | Parsed as `109301.40` |
| 8.5 | Number `"+47.39%"` | Parsed as `47.39` |
| 8.6 | Number `"-2,215.41 (-0.50%)"` | Not a data field — only used on summary rows which are skipped |
| 8.7 | Empty rows in CSV | Skipped (no symbol or qty=0) |
| 8.8 | Category "NSE EQ" | Exchange extracted as "NSE" |
