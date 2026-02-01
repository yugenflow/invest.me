# Invest.me — Project Documentation

**Version:** 1.0.0-alpha
**Last updated:** 2026-01-30

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Getting Started](#4-getting-started)
5. [Frontend](#5-frontend)
6. [Backend](#6-backend)
7. [Database](#7-database)
8. [Authentication & Security](#8-authentication--security)
9. [Design System](#9-design-system)
10. [Features](#10-features)
11. [API Reference](#11-api-reference)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Roadmap](#14-roadmap)

---

## 1. Overview

**Invest.me** is a full-stack investment portfolio management platform designed for Indian retail investors. It enables users to:

- Track holdings across 15+ asset classes (equities, mutual funds, crypto, gold, FDs, PPF, NPS, real estate, bonds, etc.)
- Import portfolio data from broker CSVs (Upstox, Zerodha, Groww auto-detected)
- Visualize portfolio performance, asset allocation, and top holdings
- Complete a risk profiling questionnaire to receive a personalized risk score and persona
- Manage account settings and subscription plans

The platform is in active development with AI-powered features (smart advisor, market intelligence, rebalancing, sentiment analysis) on the roadmap.

---

## 2. Architecture

```
┌───────────────┐     HTTP/REST      ┌──────────────────┐
│   Next.js 15  │ ◄──────────────── │   FastAPI         │
│   (React 19)  │   JSON + JWT       │   (Uvicorn)      │
│   Port 3000   │                    │   Port 8000       │
└───────────────┘                    └──────┬───────────┘
                                           │
                              ┌────────────┼────────────┐
                              │            │            │
                         ┌────▼────┐  ┌────▼────┐  ┌───▼────┐
                         │PostgreSQL│  │  Redis  │  │ Celery │
                         │   :5432  │  │  :6379  │  │ Worker │
                         └─────────┘  └─────────┘  └────────┘
```

**Request flow:**
1. User interacts with Next.js frontend
2. Axios client sends REST requests to FastAPI with JWT bearer token
3. FastAPI validates token, processes request via service layer
4. SQLAlchemy async ORM reads/writes PostgreSQL
5. Redis handles token blacklisting and caching
6. Celery handles background tasks (future: market data fetching)

**All services orchestrated via Docker Compose.**

---

## 3. Tech Stack

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.1.0 | React framework (App Router, Turbopack) |
| React | 19.0.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Zustand | 5.0.2 | Lightweight state management |
| Axios | 1.7.9 | HTTP client with interceptors |
| Recharts | 2.15.0 | Charts (line, pie/donut) |
| Lucide React | 0.468.0 | Icon library |
| next-themes | 0.4.4 | Dark mode (class strategy) |
| react-hot-toast | 2.4.1 | Toast notifications |
| react-dropzone | 14.3.5 | File drag & drop |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115.6 | Async web framework |
| Uvicorn | 0.34.0 | ASGI server |
| SQLAlchemy | 2.0.36 | Async ORM |
| asyncpg | 0.30.0 | PostgreSQL async driver |
| Alembic | 1.14.0 | Database migrations |
| Pydantic | 2.10.3 | Request/response validation |
| python-jose | 3.3.0 | JWT encoding/decoding |
| passlib + bcrypt | 1.7.4 / 4.2.1 | Password hashing |
| redis | 5.2.1 | Async Redis client |
| celery | 5.4.0 | Background task queue |
| pandas | 2.2.3 | CSV/data processing |
| pytest | 8.3.4 | Testing framework |

### Infrastructure

| Service | Version | Purpose |
|---------|---------|---------|
| PostgreSQL | 16-Alpine | Primary database |
| Redis | 7-Alpine | Token blacklist, caching, Celery broker |
| Docker Compose | — | Container orchestration |

---

## 4. Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (recommended)

### Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url> && cd Invest.me

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build

# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed asset classes
docker-compose exec backend python scripts/seed_asset_classes.py
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

### Manual Setup (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev    # Starts on port 3000 with Turbopack
```

### Environment Variables

```env
# Database
POSTGRES_USER=investme
POSTGRES_PASSWORD=investme_secret
POSTGRES_DB=investme
DATABASE_URL=postgresql+asyncpg://investme:investme_secret@db:5432/investme

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=<change-in-production>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Celery
CELERY_BROKER_URL=redis://redis:6379/1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 5. Frontend

### Route Structure

The frontend uses Next.js App Router with route groups for layout separation:

| Route Group | Layout | Pages |
|-------------|--------|-------|
| `(auth)` | Centered card layout | `/login`, `/signup` |
| `(onboarding)` | Clean single-page layout | `/onboarding` |
| `(dashboard)` | Sidebar + TopBar layout | All protected pages |
| Root | Public Navbar + Footer | `/`, `/about`, `/services`, `/solutions`, `/community` |

### Dashboard Pages

| Path | Component | Status |
|------|-----------|--------|
| `/dashboard` | Portfolio overview — net worth, gains, allocation donut, performance line chart, top holdings, holdings table | Fully built |
| `/import` | CSV upload (drag-drop, broker auto-detect, column mapping, preview) + manual entry modal | Fully built |
| `/advisor` | Smart Advisor — AI-powered investment recommendations | Coming Soon placeholder |
| `/market-intel` | Market Intelligence — news, analysis, sector insights, red flags | Coming Soon placeholder |
| `/rebalance` | Rebalance Suggestions — AI-driven portfolio rebalancing | Coming Soon placeholder |
| `/sentiment` | Sentiment Index — real-time market sentiment tracking | Coming Soon placeholder |
| `/expert-opinion` | Expert Opinion — curated analyst & expert insights | Coming Soon placeholder |
| `/new-avenues` | New Avenues — IPOs, new funds, alternative investments | Coming Soon placeholder |
| `/subscription` | 3-tier pricing page (Basic/Pro/Premium), billing toggle, FAQ | Fully built |
| `/settings` | User profile editing, password change | Fully built |

### Component Library

**UI primitives** (`components/ui/`):

| Component | Props | Notes |
|-----------|-------|-------|
| `Button` | `variant`: primary / secondary / outline / ghost / danger; `size`: sm / md / lg; `loading`: boolean | ForwardRef, full a11y |
| `Card` | `glass`: boolean | Rounded-card border, optional frosted glass effect |
| `Input` | Standard HTML + `label`, `error` | Styled input with validation state |
| `Select` | Standard HTML + `label`, `options` | Styled dropdown |
| `Modal` | `open`, `onClose`, `title` | Portal-based overlay |
| `ComingSoon` | `title`, `description` | Placeholder for future features |

**Layout** (`components/layout/`):

| Component | Description |
|-----------|-------------|
| `Sidebar` | Collapsible nav (280px → 64px). 9 nav items, "Upgrade to Pro" card, user profile footer |
| `TopBar` | Breadcrumb, search (future), theme toggle, notifications (future) |
| `ThemeProvider` | next-themes wrapper with class strategy |
| `ThemeToggle` | Sun/Moon icon toggle |
| `Navbar` | Public marketing pages navbar |
| `Footer` | Public footer |

**Dashboard** (`components/dashboard/`):

| Component | Description |
|-----------|-------------|
| `NetWorthCard` | Total portfolio value, invested amount, total gain/loss with percentage |
| `StatCard` | Generic stat display (label, value, optional sub-value) |
| `TopMoverCard` | Best/worst performing holdings |
| `TopHoldings` | Top 5 holdings by value |
| `HoldingsTable` | Full holdings list with sorting, asset class tags |

**Charts** (`components/charts/`):

| Component | Library | Description |
|-----------|---------|-------------|
| `PerformanceChart` | Recharts LineChart | Portfolio value over time (30/90/180/365 day ranges) |
| `DonutChart` | Recharts PieChart | Asset allocation breakdown with legends |

### State Management

**Zustand store** (`stores/authStore.ts`):
```typescript
interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  setToken: (token: string) => void;
  logout: () => void;
}
```

**Custom hooks** (`hooks/`):
- `useDashboard()` — fetches `/dashboard` endpoint, returns summary, allocation, performance, holdings
- `usePortfolio()` — fetches `/holdings`, supports CRUD operations
- `useImport()` — handles CSV upload, preview, column mapping, confirm

### API Client

Located at `lib/api.ts`. Axios instance with:
- Base URL from `NEXT_PUBLIC_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>` header
- Response interceptor: on 401, attempts silent token refresh via `/auth/refresh`, retries original request; on failure, logs out and redirects to `/login`

---

## 6. Backend

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app creation, CORS, router includes
│   ├── config.py            # Pydantic Settings (env-based config)
│   ├── database.py          # SQLAlchemy async engine, session factory
│   ├── redis.py             # Async Redis client
│   ├── celery_app.py        # Celery configuration
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # User, RiskProfile, Goal
│   │   ├── holding.py       # Holding, Transaction
│   │   ├── asset_class.py   # AssetClass enum/table
│   │   ├── signal.py        # Market signals
│   │   └── ...
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # /auth/*
│   │   ├── users.py         # /users/*
│   │   ├── onboarding.py    # /onboarding/*
│   │   ├── holdings.py      # /holdings/*
│   │   ├── transactions.py  # /transactions/*
│   │   ├── asset_classes.py # /asset_classes/*
│   │   ├── portfolio.py     # /portfolio/*
│   │   ├── dashboard.py     # /dashboard/*
│   │   └── imports.py       # /import/*
│   └── services/
│       ├── auth_service.py      # Signup, login, token management
│       ├── portfolio_service.py # Aggregation, allocation, performance
│       ├── risk_engine.py       # Risk score calculation
│       └── csv_parser.py        # CSV parsing, broker detection
├── tests/
│   ├── test_auth.py
│   ├── test_onboarding.py
│   ├── test_holdings.py
│   ├── test_portfolio.py
│   └── test_csv_import.py
├── alembic/                 # Database migration scripts
├── requirements.txt
└── Dockerfile
```

### Services Layer

**auth_service.py:**
- User registration (email uniqueness, bcrypt hashing)
- Login (credential validation, JWT pair generation)
- Token refresh with rotation (old token blacklisted in Redis)
- Logout (token blacklisting)

**portfolio_service.py:**
- `get_summary()` — total invested, current value, gains, XIRR (planned)
- `get_allocation()` — holdings grouped by asset class with percentages
- `get_performance()` — time-series data points for charting
- `get_dashboard()` — aggregated response (summary + allocation + performance + top holdings)

**risk_engine.py:**
- Weighted scoring algorithm:
  - Age factor (20%): younger = higher risk tolerance
  - Income/liability ratio (20%): lower debt = higher risk tolerance
  - Savings buffer (15%): more months of runway = higher tolerance
  - Scenario responses (45%): average of 1–5 scale behavioral questions
- Output: risk score (1–10), risk persona (Conservative / Moderate Conservative / Moderate / Moderate Aggressive / Aggressive)

**csv_parser.py:**
- Auto-detects broker format from file headers (Upstox, Zerodha, Groww, etc.)
- Parses CSV with pandas (handles BOM encoding, multi-line headers)
- Returns structured preview for user confirmation
- On confirm: creates Holding + corresponding buy Transaction per row

---

## 7. Database

### Entity Relationship

```
User (1) ──── (1) RiskProfile
  │
  ├──── (*) Goal
  │
  └──── (*) Holding
              │
              └──── (*) Transaction
```

### Models

**User:**
- id, email (unique), hashed_password, full_name, phone
- preferred_currency (default: INR), onboarding_completed (boolean)
- created_at, updated_at

**RiskProfile:**
- user_id (FK), age, annual_income, monthly_savings, total_liabilities
- scenario_responses (JSON array of 1–5 values)
- risk_score (1–10), risk_persona (string)
- financial_goals (relation)

**Goal:**
- risk_profile_id (FK), goal_name, target_amount, horizon_years

**Holding:**
- user_id (FK), asset_class_code, symbol, name
- quantity, avg_buy_price, buy_currency
- maturity_date, interest_rate, institution (for FDs, bonds)
- is_deleted (soft delete), created_at, updated_at

**Transaction:**
- holding_id (FK), type (BUY/SELL/DIVIDEND)
- quantity, price, date, notes

**AssetClass:**
- code (PK), name, category, description

### Supported Asset Classes

| Code | Name | Category |
|------|------|----------|
| EQUITY_IN | Indian Equity | Equity |
| EQUITY_US | US Equity | Equity |
| MUTUAL_FUND | Mutual Funds | Funds |
| CRYPTO | Cryptocurrency | Crypto |
| GOLD_PHYSICAL | Physical Gold | Gold |
| GOLD_SGB | Sovereign Gold Bond | Gold |
| GOLD_ETF | Gold ETF | Gold |
| GOLD_DIGITAL | Digital Gold | Gold |
| FIXED_DEPOSIT | Fixed Deposits | Fixed Income |
| PPF | Public Provident Fund | Fixed Income |
| EPF | Employee Provident Fund | Fixed Income |
| NPS | National Pension Scheme | Pension |
| REAL_ESTATE | Real Estate | Real Estate |
| BOND | Bonds | Fixed Income |
| OTHER | Other | Other |

### Migrations

Managed via Alembic. Initial migration: `001_initial.py`.

```bash
# Generate new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 8. Authentication & Security

### JWT Flow

```
Login Request
    │
    ▼
Validate credentials (bcrypt compare)
    │
    ▼
Generate access_token (15 min) + refresh_token (7 days)
    │
    ▼
Return access_token in JSON body
Store refresh_token in HttpOnly cookie
    │
    ▼
Frontend stores access_token in Zustand (memory-only)
    │
    ▼
Every API request: Authorization: Bearer <access_token>
    │
    ▼
On 401: Axios interceptor calls /auth/refresh
    │
    ▼
Backend validates refresh_token, blacklists old one, issues new pair
    │
    ▼
On refresh failure: logout → clear store → redirect /login
```

### Security Measures

- Passwords hashed with bcrypt (passlib)
- JWT tokens signed with HS256
- Refresh token rotation (old token blacklisted in Redis with TTL)
- CORS restricted to frontend origin
- Soft-delete for holdings (data preservation)
- Environment-based configuration (no hardcoded secrets)

---

## 9. Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-lime` | #D4F358 | Primary accent — buttons, active nav, highlights, badges |
| `brand-lime-hover` | #C2E04A | Hover state for primary actions |
| `brand-black` | #0F172A | Text on lime backgrounds |
| `gain` | #4d7c0f | Positive values (green) |
| `alert-red` | #FF3B30 | Negative values, errors, destructive actions |

### Dark Mode Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `navy-900` | #051019 | Deepest background |
| `navy-800` | #0B1C2E | Card/surface background |
| `navy-700` | #15283D | Borders, dividers, hover states |
| `surface-dark` | #0B1C2E | General dark surface |
| `surface-dark-card` | #111827 | Secondary dark card |

### Light Mode

| Token | Usage |
|-------|-------|
| `bg-white` | Card backgrounds |
| `bg-gray-50` | Page background |
| `border-gray-200` | Borders |
| `text-gray-500/400` | Secondary text |

### Typography

- **Font:** Plus Jakarta Sans (Google Fonts)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Heading class:** `font-heading` — mapped to Plus Jakarta Sans
- **Body class:** `font-body` — mapped to Plus Jakarta Sans
- Headings typically use `font-extrabold` (800 weight via Tailwind)

### Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-card` | 14px | All card-like surfaces |
| `rounded-3xl` | 24px | Large containers |
| `rounded-4xl` | 32px | Hero sections |
| `w-sidebar` | 280px | Expanded sidebar |
| `w-sidebar-collapsed` | 64px | Collapsed sidebar |

### Component Patterns

**Buttons:**
```
Primary:   bg-brand-lime text-brand-black     → main CTAs
Outline:   border + transparent bg            → secondary actions
Ghost:     transparent + hover bg             → tertiary/icon buttons
Danger:    bg-alert-red text-white            → destructive actions
Sizes:     sm (px-3 py-1.5) / md (px-4 py-2) / lg (px-6 py-3)
```

**Cards:**
```
Default:   bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-700 rounded-card p-6
Glass:     Same + 80% opacity + backdrop-blur-sm
```

**Feature Status Indicators:**
- Included: `Check` icon in `text-brand-lime` + normal text
- Excluded: `X` icon in `text-gray-300 dark:text-gray-600` + strikethrough text

---

## 10. Features

### 10.1 Authentication (Fully Built)

**Page Design:** Split-screen layout inside a rounded card container:
- **Left panel** — Form area with Invest.me logo, Sign In/Sign Up pill toggle, input fields with left-aligned icons (Mail, Lock, User), password visibility toggle, primary CTA button, social login buttons (Google, Apple, Facebook, X), copyright footer with Terms & Privacy links
- **Right panel** (desktop only) — Dark navy gradient with subtle lime line-grid background, floating glass cards, and a 4-slide auto-rotating carousel (5s interval) with clickable pagination dots

**Showcase Carousel Slides:**
1. **Track Your Portfolio** — Portfolio Value donut chart (₹24.5L), Top Holdings list, Performance bar chart (+24.6%)
2. **Smart Advisor** — Rebalance Alert (86% risk alignment), AI Chat Q&A, Portfolio Health Score (85/100)
3. **Market Intelligence** — Market News feed (3 headlines), Sector Heatmap (5 sectors), Analyst Picks (3 stocks)
4. **Sentiment Index** — Sentiment Gauge (70 = Bullish), Trending Signals (Nifty/Sensex/BankNifty), Social Buzz (hashtags)
5. **New Avenues** — Upcoming IPOs (3 with Subscribe/Neutral ratings), New Fund Launches (3 sectoral/thematic), Alternative Investments (SGBs, REITs, invoice discounting)

**Login** (`/login`):
- Email + password form with icon-prefixed inputs
- Password visibility toggle (eye icon)
- Error handling with toast notifications
- Social login buttons (Google, Apple, Facebook, X) — UI only, shows "coming soon" toast
- Redirects to onboarding if incomplete, else dashboard
- "Create one for free" link to signup

**Signup** (`/signup`):
- Full name, email, password with icon-prefixed inputs
- Password visibility toggle
- Social signup buttons (Google, Apple, Facebook, X) — UI only
- Client-side validation (min 8 char password)
- Auto-login after signup, redirects to onboarding

### 10.2 Onboarding — Risk Profiling (Fully Built)

**Route:** `/onboarding`

4-step wizard with progress bar:
1. **Demographics** — Age, occupation
2. **Financials** — Annual income, monthly savings, total liabilities
3. **Risk Scenarios** — 5 behavioral questions (1–5 Likert scale)
4. **Goals** — Add financial goals (name, target amount, time horizon)

**Output:** Risk score (1–10) and persona assignment. Marks `onboarding_completed = true`.

### 10.3 Portfolio Dashboard (Fully Built)

**Route:** `/dashboard`

- **Net Worth Card** — Total portfolio value, total invested, total gain/loss (absolute + percentage)
- **Stat Cards** — Best performer, worst performer, number of holdings
- **Allocation Donut Chart** — Asset class breakdown (Recharts PieChart)
- **Performance Line Chart** — Portfolio value over time with range selector (30d/90d/180d/1yr)
- **Top Holdings** — Top 5 by current value
- **Holdings Table** — Full sortable table with asset class badges, actions (edit/delete)

### 10.4 Import Holdings (Fully Built)

**Route:** `/import`

Two methods:

**CSV Import:**
1. Drag & drop or browse file upload
2. Auto-detects broker (Upstox, Zerodha, Groww, etc.)
3. Column mapping UI — user maps CSV columns to app fields
4. Editable preview table — inline editing before confirm
5. Confirm → bulk creates holdings + buy transactions

**Manual Entry:**
- Spreadsheet-style modal
- Fields: symbol, name, asset class, quantity, avg buy price, date
- Add multiple rows before submitting

### 10.5 Settings (Fully Built)

**Route:** `/settings`

- **Profile Section** — Edit full name, phone, preferred currency
- **Password Section** — Current password + new password + confirm

### 10.6 Subscription (Fully Built)

**Route:** `/subscription`

- **Page header:** "Choose Your Plan" + subtitle about 14-day trial
- **Billing toggle:** Monthly / Annual (pill-shaped, "Save 17%" badge)
- **3-tier pricing cards:**
  - **Basic** (₹499/mo, ₹4,999/yr) — Portfolio Dashboard, Import, Basic Smart Advisor (5 queries/mo)
  - **Pro** (₹1,299/mo, ₹12,999/yr) — Everything in Basic + Full Advisor + Market Intel + Rebalance. Highlighted card with lime border/ring + "Most Popular" badge
  - **Premium** (₹7,499/mo, ₹74,999/yr) — Everything in Pro + Sentiment Index + New Avenues + Personal Advisor + Early Access
- **Trust note:** "No credit card required for trial"
- **FAQ accordion:** 5 common questions about billing, switching, cancellation
- CTA buttons show toast (no payment backend yet)

### 10.7 Coming Soon Features

All use the `ComingSoon` placeholder component:

| Feature | Description | Route |
|---------|-------------|-------|
| Smart Advisor | AI-powered investment recommendations and Q&A | `/advisor` |
| Market Intelligence | Real-time news, analyst reports, sector analysis, red flags | `/market-intel` |
| Rebalance Suggestions | AI-driven portfolio rebalancing based on goals and risk profile | `/rebalance` |
| Sentiment Index | Market sentiment tracking and analysis | `/sentiment` |
| Expert Opinion | Curated insights from market experts and analysts | `/expert-opinion` |
| New Avenues | IPO alerts, new fund launches, alternative investment opportunities | `/new-avenues` |

---

## 11. API Reference

Base URL: `http://localhost:8000/api/v1`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login, returns JWT | No |
| POST | `/auth/refresh` | Rotate refresh token | Cookie |
| POST | `/auth/logout` | Blacklist refresh token | Cookie |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Bearer |
| PATCH | `/users/me` | Update profile fields | Bearer |
| POST | `/users/me/change-password` | Change password | Bearer |

### Onboarding

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/onboarding/risk-profile` | Create risk profile + goals | Bearer |
| GET | `/onboarding/risk-profile` | Get current risk profile | Bearer |

### Holdings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/holdings/` | List all holdings | Bearer |
| POST | `/holdings/` | Create holding (+ auto buy transaction) | Bearer |
| GET | `/holdings/{id}` | Get single holding | Bearer |
| PATCH | `/holdings/{id}` | Update holding | Bearer |
| DELETE | `/holdings/{id}` | Soft-delete holding | Bearer |

### Asset Classes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/asset_classes/` | List all asset classes | Bearer |

### Portfolio Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/portfolio/summary` | Total invested, current value, gains | Bearer |
| GET | `/portfolio/allocation` | Asset allocation breakdown | Bearer |
| GET | `/portfolio/performance?days=30` | Performance time-series | Bearer |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/` | Aggregated dashboard data | Bearer |

### Import

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/import/csv` | Upload CSV, returns preview | Bearer |
| POST | `/import/csv/confirm` | Confirm and import holdings | Bearer |

---

## 12. Testing

### Backend Tests

```bash
# Run all tests
cd backend
pytest

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/
```

**Test files:**
- `test_auth.py` — Signup, login, token refresh, logout flows
- `test_onboarding.py` — Risk profile creation and retrieval
- `test_holdings.py` — CRUD operations, soft delete
- `test_portfolio.py` — Summary, allocation, performance aggregations
- `test_csv_import.py` — CSV parsing, broker detection, column mapping

### Frontend

No test setup yet. Planned: Vitest + React Testing Library.

---

## 13. Deployment

### Docker Compose (Production-like)

```yaml
services:
  db:         PostgreSQL 16-Alpine, port 5432, persistent volume
  redis:      Redis 7-Alpine, port 6379
  backend:    FastAPI app, port 8000, depends on db + redis
  celery-worker: Celery process, depends on db + redis
  frontend:   Next.js standalone, port 3000, depends on backend
```

```bash
# Full stack
docker-compose up --build -d

# Apply migrations
docker-compose exec backend alembic upgrade head

# Seed data
docker-compose exec backend python scripts/seed_asset_classes.py
```

### Environment Checklist for Production

- [ ] Change `JWT_SECRET_KEY` to a strong random value
- [ ] Set `CORS_ORIGINS` to production domain
- [ ] Use managed PostgreSQL and Redis
- [ ] Enable HTTPS
- [ ] Set `DATABASE_URL` to production connection string
- [ ] Configure `NEXT_PUBLIC_API_URL` to production API domain

---

## 14. Roadmap

### Phase 1 — Core Platform (Complete)
- [x] User authentication with JWT
- [x] Risk profiling and onboarding
- [x] Portfolio dashboard with charts
- [x] Holdings management (CRUD)
- [x] CSV import with broker detection
- [x] Manual entry
- [x] User settings
- [x] Subscription pricing UI
- [x] Dark mode
- [x] Responsive design

### Phase 2 — Intelligence Layer (In Progress)
- [x] Live market data integration (equity prices, MF NAVs)
- [ ] Smart Advisor — Advice layer, rebalancing, alerts & red flags, macro intelligence, optimization. 
- [ ] Market Intelligence — news aggregation, sector analysis, Expert Opinion — curated analyst insights (reports seeded by our own in-house experts)

### Phase 3 — Advanced Analytics
- [ ] Sentiment Index — market mood from social/news signals
- [ ] New Avenues — IPO tracking, new fund alerts
- [ ] XIRR / TWR performance calculations
- [ ] Tax harvesting suggestions

### Phase 4 — Platform Expansion
- [ ] Payment integration (Razorpay) for subscription billing
- [ ] Broker API connections (Zerodha Kite, Upstox, Groww)
- [ ] Mobile app (React Native or PWA)
- [ ] Email notifications and alerts
- [ ] Portfolio sharing / advisor collaboration
- [ ] Multi-currency support with FX rates
- [ ] Guided walkthrough of the platform like those guided feature walkthroughs

### Phase 5 - Additional Features
- [ ] Flexible grid for portfolio => allow user to drag and drop stats, metrics, change dashboard layout
- [ ] AI-chatbot for all things that a user may require to do on the platform


---

## Changelog

### 2026-01-30
- Built subscription page with 3-tier pricing (Basic/Pro/Premium)
- Monthly/annual billing toggle with 17% savings
- Feature comparison across tiers with included/excluded indicators
- Pro tier visual highlight (lime border, ring, scale, "Most Popular" badge)
- FAQ accordion with 5 items
- Created project documentation (`claude.md` + `DOCUMENTATION.md`)
- Added Kotak Neo CSV parser support with broker signature auto-detection
- Added fuzzy fallback (name→symbol promotion) and summary row filtering in CSV parser
- Added parse error guidance UX in CSV import modal
- Redesigned login & signup pages — split-screen layout with dark showcase panel
- Built 4-slide auto-rotating feature carousel (Portfolio, Advisor, Market Intel, Sentiment) with unique glass card pictorials per slide
- Line grid background on showcase panel, clickable pagination dots
- Added social login buttons (Google, Apple, Facebook, X) on login and signup — UI placeholders with toast notifications
- Added 5th carousel slide "New Avenues" with IPOs, new funds, and alternative investments pictorials
- Enlarged carousel pagination dots for easier click targets
- CSV format help section now has Indian Equity / Crypto asset class toggle with per-class column tables
- Crypto tab shows expected headers with "coming soon" banner (parser not yet implemented)

### Scope Note — Asset Classes
The platform currently supports **Indian equity** as the primary asset class for all features (CSV import, dashboard, portfolio analytics). Crypto, US equity, and other asset classes are referenced in the UI and planned for future phases but are **not yet implemented** in the backend parser or analytics layer. Manual entry can be used as a workaround for non-equity holdings.
