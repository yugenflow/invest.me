# Invest.me — Claude Session Context

> This file is read at the start of every Claude Code session.
> Keep it updated after every significant change.

**Last updated:** 2026-02-01

---

## Project Summary

Invest.me is a full-stack investment portfolio management platform for Indian retail investors. Users can track holdings across asset classes, import from brokers, view analytics, and (soon) get AI-powered advice.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router, Turbopack) | 15.1.0 |
| UI | React + TypeScript | 19.0.0 |
| Styling | Tailwind CSS (class-based dark mode) | 3.4.17 |
| State | Zustand | 5.0.2 |
| Charts | Recharts | 2.15.0 |
| Icons | Lucide React | 0.468.0 |
| Toasts | react-hot-toast | 2.4.1 |
| Backend | FastAPI + Uvicorn | 0.115.6 |
| ORM | SQLAlchemy (async) + Asyncpg | 2.0.36 |
| Database | PostgreSQL 16 | — |
| Cache | Redis 7 | — |
| Auth | JWT (python-jose) + Bcrypt | — |
| Tasks | Celery | 5.4.0 |
| Migrations | Alembic | 1.14.0 |
| Infra | Docker Compose | — |

---

## Directory Layout

```
Invest.me/
├── frontend/src/
│   ├── app/
│   │   ├── (auth)/          login, signup
│   │   ├── (onboarding)/    risk-profile wizard
│   │   ├── (dashboard)/     all protected pages (layout has Sidebar + TopBar)
│   │   │   ├── dashboard/   portfolio overview       ✅
│   │   │   ├── import/      CSV & manual import      ✅
│   │   │   ├── advisor/     Smart Advisor             🔜
│   │   │   ├── market-intel/                          🔜
│   │   │   ├── rebalance/                             🔜
│   │   │   ├── sentiment/                             🔜
│   │   │   ├── expert-opinion/                        🔜
│   │   │   ├── new-avenues/                           🔜
│   │   │   ├── subscription/ 3-tier pricing page      ✅
│   │   │   └── settings/    profile & password        ✅
│   │   └── (public)         about, services, solutions, community
│   ├── components/
│   │   ├── ui/              Button, Card, Input, Select, Modal, ComingSoon
│   │   ├── layout/          Sidebar, TopBar, Navbar, Footer, ThemeProvider
│   │   ├── dashboard/       NetWorthCard, StatCard, TopMoverCard, TopHoldings, HoldingsTable
│   │   ├── charts/          PerformanceChart, DonutChart
│   │   ├── portfolio/       HoldingForm
│   │   ├── import/          CsvImportModal, ManualEntryModal, DropZone, ColumnMapper, etc.
│   │   └── onboarding/      ProgressBar
│   ├── hooks/               useDashboard, usePortfolio, useImport
│   ├── lib/                 api.ts (axios + JWT interceptors), utils.ts (cn, formatCurrency, etc.)
│   ├── stores/              authStore.ts (Zustand — tokens, user, logout)
│   └── types/               index.ts (UserProfile, Holding, Transaction, etc.)
│
├── backend/
│   ├── app/
│   │   ├── routes/          auth, users, onboarding, holdings, transactions, asset_classes, portfolio, dashboard, import
│   │   ├── models/          User, RiskProfile, Holding, Transaction, Goal, AssetClass, Signal, etc.
│   │   ├── services/        auth_service, portfolio_service, risk_engine, csv_parser
│   │   ├── config.py        Pydantic Settings
│   │   ├── database.py      async engine + session
│   │   └── redis.py         async Redis client
│   └── tests/               test_auth, test_onboarding, test_holdings, test_portfolio, test_csv_import
│
├── alembic/                 DB migrations
├── scripts/                 seed_asset_classes.py
├── docker-compose.yml       db, redis, backend, celery-worker, frontend
├── claude.md                ← this file
└── DOCUMENTATION.md         full project docs for humans & external tools
```

---

## Design System Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `brand-lime` | #D4F358 | Primary accent, CTAs, active states |
| `brand-black` | #0F172A | Text on lime backgrounds |
| `navy-900` | #051019 | Darkest background |
| `navy-800` | #0B1C2E | Card background (dark mode) |
| `navy-700` | #15283D | Borders (dark mode) |
| `alert-red` | #FF3B30 | Errors, losses |
| `gain` | #4d7c0f | Positive returns |
| `rounded-card` | 14px | Card border radius |
| Font | Plus Jakarta Sans | 400–700 weights |

**Component conventions:**
- `Button` — variants: primary / secondary / outline / ghost / danger; sizes: sm / md / lg
- `Card` — optional `glass` prop for frosted look; default has border + `rounded-card`
- Dark mode via `dark:` Tailwind classes throughout

---

## API Base

- Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- All API calls go through `frontend/src/lib/api.ts` → `{API_URL}/api/v1/*`
- JWT access token added via Axios request interceptor
- 401 responses trigger silent token refresh

---

## Auth Flow

1. Signup → creates user → redirect to `/onboarding`
2. Login → JWT access (15 min) + refresh (7 day, HttpOnly cookie) → Zustand stores token
3. Onboarding incomplete → redirect to `/onboarding`
4. Token refresh handled by Axios interceptor on 401
5. Logout → blacklist refresh token in Redis → clear Zustand → redirect `/login`

---

## Feature Status

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Auth (login/signup/logout) | ✅ | ✅ | JWT + refresh rotation |
| Onboarding (risk profile) | ✅ | ✅ | 4-step wizard, weighted risk scoring |
| Dashboard | ✅ | ✅ | Summary, allocation chart, performance chart, holdings table |
| Holdings CRUD | ✅ | ✅ | Add/edit/delete, auto-creates buy transaction |
| CSV Import | ✅ | ✅ | Broker detection (Zerodha, Upstox, Kotak Neo + fuzzy fallback), column mapping, preview, confirm |
| Manual Entry | ✅ | ✅ | Spreadsheet-style modal |
| Settings | ✅ | ✅ | Profile update, password change |
| Subscription | ✅ | — | 3-tier pricing UI, no payment backend yet |
| Smart Advisor | 🔜 | 🔜 | AI-powered recommendations |
| Market Intel | 🔜 | 🔜 | News, analysis, sector insights |
| Rebalance | 🔜 | 🔜 | AI portfolio rebalancing suggestions |
| Sentiment Index | 🔜 | 🔜 | Real-time market sentiment |
| Expert Opinion | 🔜 | 🔜 | Curated expert insights |
| New Avenues | 🔜 | 🔜 | IPOs, new funds, alt investments |
| Live Market Data | — | ✅ | yfinance + Redis cache + Celery Beat; 3-tier fallback |

---

## Current Session / Recent Changes

- **2026-01-30:** Built subscription page (`/subscription`) — 3-tier pricing (Basic ₹499, Pro ₹1,299, Premium ₹7,499), monthly/annual toggle, feature comparison, FAQ accordion. Pro card highlighted with lime border + "Most Popular" badge. Centered headings/prices, equal-height side cards.
- **2026-01-30:** Added Kotak Neo CSV parser support. Added broker signature detection for Kotak. Added fuzzy fallback (name→symbol promotion). Added summary row filtering. Added parse error guidance UX in frontend. Updated broker dropdown to include Kotak Neo.
- **2026-01-30:** Redesigned login & signup pages — split-screen layout (form left, dark showcase panel right). Sign In/Sign Up pill toggle, icon-prefixed inputs, password visibility toggle, styled dividers. Signup page mirrors same design. Auth layout contains shared split-screen shell.
- **2026-01-30:** Showcase panel upgraded — 4-slide auto-rotating carousel (5s interval) with unique pictorial glass cards per feature: Track Portfolio (donut chart, holdings list, performance bars), Smart Advisor (rebalance alert, AI chat, health score), Market Intel (news feed, sector heatmap, analyst picks), Sentiment Index (gauge, trending signals, social buzz). Line grid background, clickable pagination dots. Cards straightened (no rotation).
- **2026-01-30:** Added social login buttons (Google, Apple, Facebook, X) with brand SVG icons on both login and signup pages. Buttons show toast "coming soon" — no backend OAuth yet.
- **2026-01-30:** Added 5th carousel slide "New Avenues" (Upcoming IPOs, New Funds, Alternative Investments). Enlarged pagination dots for easier clicking (h-2.5/w-2.5 inactive, h-2.5/w-14 active).
- **2026-01-31:** CSV format help now has Indian Equity / Crypto toggle. Equity tab shows current broker formats (Zerodha, Upstox, Kotak Neo). Crypto tab shows expected headers (Coin, Quantity, Avg Buy Price, Currency) with "coming soon" banner. Crypto support is UI-ready but not yet implemented in the parser — current focus is Indian equity.
- **2026-02-01:** Live Market Data — Price Service. Added yfinance-based price fetching with 3-tier fallback (Redis cache → market_data table → cost basis). New files: `price_history.py` model, `price_service.py` (symbol mapping, caching, batch fetch), `tasks/price_tasks.py` (Celery tasks for 15-min current prices + daily EOD OHLCV with 1y backfill), `api/v1/prices.py` (manual refresh + cache status endpoints). Updated portfolio_service.py to use real market prices for summary, allocation, performance chart, and top holdings. Added celery-beat service to docker-compose.yml. Migration `002_add_price_history.py` for price_history table.
- **2026-02-01:** Simplified Manual Entry forms — MF now asks Fund Name + Units + Amount Invested (derives NAV). Gold Physical/Digital ask Total Cost instead of Price/gram. Gold SGB asks Total Cost instead of Issue Price (defaults interest rate 2.5%). Added `required` flag to ColDef with red asterisk indicators in table headers. ReviewTable shows derived per-unit price as secondary info line.
- **2026-02-01:** Mutual Fund name → Yahoo Finance ticker resolution. New `mf_resolver.py` service: fund name → mfapi.in search → ISIN → Yahoo Finance search → 0P...BO code. Redis-cached (7-day TTL). Auto-resolves on holding creation (`POST /holdings`) and CSV import confirm. New `resolve_mf_symbols` Celery task for batch resolution of unresolved MF holdings. Updated `to_yfinance_ticker()` for better MF code handling.
- **2026-02-01:** Pre-import MF resolution with manual ISIN fallback. Manual entry for Indian Mutual Fund now has a 3-step flow: Entry → Resolve → Confirm. Fund names are batch-resolved via `POST /import/resolve-mf` before import. Failed resolutions show ISIN input for manual fallback via `POST /import/resolve-isin`. No MF holding gets created without a resolved symbol. Non-MF asset classes remain 2-step. Removed red asterisk indicators from EditableTable. Renamed "Mutual Fund" → "Indian Mutual Fund" in asset class dropdown. Widened Amount Invested column.
- **2026-02-01:** Beta polish — Added "Indian Mutual Fund" tab to CSV import format help (coming soon banner for CAS PDF import). Added "Beta" badge pill next to logo in sidebar. Clicking badge opens a modal showing currently supported features and coming-soon roadmap. Updated CLAUDE.md with scope & roadmap notes.
- **2026-02-01:** Added collapsible "How to import" guide on Import page — 3-column layout covering Indian Equity CSV, Mutual Fund manual entry, and other asset classes. Collapsed by default.
- **2026-02-01:** Scoped manual entry to beta asset classes only — removed US Equity, Cryptocurrency, and Other from the dropdown. Beta supports: Indian Equity, Indian MF, Gold (4 variants), FD, PPF, EPF, NPS, Bonds, Real Estate.

---

## Scope & Roadmap Notes

- **Beta scope:** Indian Equity + Mutual Fund import/tracking are the primary focus. Other asset classes (gold, FD, PPF, EPF, NPS, bonds, real estate, crypto) are manual-entry only with cost basis tracking.
- **Smart Advisor** will work across all asset classes when built — no need to restrict scope now; design holistically when building.
- **Import integration priority:** Indian equity CSV → MF CAS PDF → Crypto CSV → Broker API connectors (Zerodha, Upstox, Groww)
- **Step-by-step approach:** No need to integrate all asset classes at once. Each asset class gets import support as the platform matures.

---

## Development Workflow

**Roles:** User = Product Manager (ideation, strategy, plan approval, spot checks). Claude = Developer (planning, implementation, testing, version control).

**Cycle:**

1. **Ideate / Brainstorm** — User describes the feature, problem, or direction. Back-and-forth discussion to refine scope.
2. **Plan** — Claude enters plan mode, explores codebase, produces a detailed implementation plan with file changes, UX flow, and verification steps.
3. **Approve** — User reviews the plan, requests changes or approves.
4. **Implement** — Claude writes the code across all files.
5. **Test** — Claude runs the dev server, performs UI testing via Playwright MCP (navigation, form fills, screenshots, assertions) and API testing via curl/httpie. Reports results with screenshots.
6. **Commit & Push** — On user's go-ahead, Claude commits with a descriptive message and pushes to the remote.

**Testing tools:**
- **Playwright MCP** — browser automation for E2E UI testing (navigate, click, type, screenshot, assert)
- **Backend API tests** — curl/httpie against running backend endpoints
- **TypeScript checks** — `tsc --noEmit` before every commit

---

## Development Notes

- Dev server: `cd frontend && npm run dev` (Turbopack, port 3000 or 3001)
- Backend: runs via Docker or `uvicorn app.main:app` on port 8000
- The `.next` cache can corrupt on OneDrive — fix by deleting `.next/` and restarting
- `@next/swc` version mismatch warning (15.5.7 vs 15.5.11) is benign
- 15 asset classes supported (Indian equity, US equity, MF, crypto, gold variants, FD, PPF, EPF, NPS, real estate, bonds)
- Playwright MCP configured for browser-based UI testing
