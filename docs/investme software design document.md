This is a comprehensive Software Design Document (SDD). It is structured to serve two purposes:
1.  **For Claude Code:** To provide technical architecture, database schemas, and logic flows.
2.  **For Google Stitch/Designers:** To provide precise visual guidelines for prototyping.

---

# Software Design Document (SDD): Project "Nexus Wealth"

## 1. Introduction & Vision
**Invest.me** is a modern, holistic wealth management platform acting as an intelligent financial advisor. It aggregates user assets (Equities, Mutual Funds, Crypto, Gold/Alt-assets) to provide a unified net worth snapshot. Beyond tracking, it offers "Smart Signals," risk-adjusted optimization, and institutional-grade market intelligence.

### 1.1 Scope
The initial release is a **Realist MVP (Web Platform)**. It focuses on:
*   User Profiling & Risk Assessment.
*   Portfolio Aggregation (Manual + Broker Connectors).
*   Dashboard Analytics.
*   Smart Advisor (Red flags, Macro intel, Optimization).
*   Market Intelligence (Reports & Valuation Targets).

---

## 2. Design Guidelines (UI/UX)
*Use this section for Google Stitch/Prototyping tools.*

### 2.1 Design Philosophy
*   **Style:** Modern, Sleek, Tech-Forward, "Fintech Elegant."
*   **Typography:** Sans-serif exclusively. Recommended families: *Inter* or *Space Grotesk* for headers, *Roboto* or *Lato* for body text.
*   **Shapes:** Rounded corners (approx 12px-16px) on cards. Subtle glassmorphism in the dark theme.

### 2.2 Color Palettes & Themes

#### **Light Mode (High Energy / Clean)**
*   **Background:** `#FFFFFF` (White) and `#F4F6F8` (Off-white/Light Grey for sections).
*   **Primary Text:** `#0F172A` (Rich Black).
*   **Accent/Brand Color:** `#CCFF00` or `#D4F846` (Neon Lime Green) – used for primary buttons, active states, and positive trends.
*   **Alerts/Red Flags:** `#FF3B30` (Vibrant Red) – used for borders on warning cards.
*   **Secondary Accents:** Black borders/strokes (1px) to give a sharp, defined look.

#### **Dark Mode (Deep / Professional)**
*   **Background:** `#000000` (Pure Black).
*   **Card Backgrounds:** `#0B0F19` (Very Dark Navy) to `#111827` (Dark Blue-Grey) with a linear gradient.
*   **Primary Text:** `#FFFFFF` (White).
*   **Secondary Text:** `#94A3B8` (Slate Grey).
*   **Accents:** Deep Navy Blue gradients (`#1E3A8A` to `#3B82F6`) for fills and visual depth.
*   **Neon Pop:** Keep the Lime Green (`#CCFF00`) specifically for "Call to Action" buttons to create high contrast against the black.

### 2.3 Layout Structure
*   **Global:** Sidebar Navigation (collapsible) on the left. Top bar for Profile and Theme Toggle (Sun/Moon icon).
*   **Dashboard:** Grid-based masonry layout.
*   **Responsiveness:** Mobile-first approach, stacking grids on smaller screens.

---

## 3. System Architecture

### 3.1 Tech Stack (Recommended for Scalability & AI Capability)
*   **Frontend:** Next.js (React) + Tailwind CSS (for rapid, custom styling).
*   **Backend:** Python (FastAPI or Django). *Reason: Superior for financial libraries (Pandas, NumPy) and scraping/crawling capabilities.*
*   **Database:** PostgreSQL (Relational data for users/assets).
*   **Caching:** Redis (For real-time price feeds and session management).
*   **Task Queue:** Celery (For background scraping and portfolio analysis).

### 3.2 High-Level Data Flow
1.  **Input:** User provides credentials (Oauth) or manual entry.
2.  **Ingestion:** Backend connectors fetch data from Broker APIs (Zerodha/Upstox) and Crypto APIs (Binance/CoinDCX).
3.  **Normalization:** All assets are converted to a standard format and currency (INR).
4.  **Analysis Engine:**
    *   *Valuation Service:* Fetches current market prices.
    *   *Risk Engine:* Compares portfolio volatility vs. User Risk Profile.
    *   *Intel Engine:* Scrapes news/reports and tags them against user holdings.
5.  **Presentation:** API serves JSON data to the React Frontend.

---

## 4. MVP Feature Specifications

### 4.1 Onboarding & Risk Profiling ("The Holistic Assessment")
**Goal:** Determine Risk Appetite without asking "What is your risk appetite?"
*   **Mechanism:** Multi-step wizard.
*   **Inputs:**
    *   **Demographics:** Age, Location.
    *   **Financials:** Monthly Income, Monthly Savings, Existing Liabilities.
    *   **Psychographic/Goals:**
        *   *Scenario-based questions:* "If the market drops 20% tomorrow, would you: (a) Buy more, (b) Hold, (c) Sell everything."
        *   *Goals:* "Saving for: Retirement (20y), Home (5y), Vacation (1y)."
*   **Output:** The backend calculates a `Risk_Score` (1-10) and assigns a persona (e.g., "Aggressive Growth Seeker" or "Conservative Preserver").

### 4.2 Portfolio Inputs (Connectors & Manual)
*   **Manual Entry:** Form to add Asset Name, Quantity, Avg Buy Price, Date.
*   **Connectors (Broker Integration):**
    *   *Equities/MF:* Integration using APIs for Upstox/Zerodha (Kite Connect). *Note: For MVP, if API approval is slow, use CSV Import features (Standard Zerodha/Upstox tradebook format).*
    *   *Crypto:* Read-only API keys for CoinDCX/Binance.
*   **Storage:** Assets stored in `Holdings` table linked to `User_ID`.

### 4.3 The Dashboard
**Visuals:**
*   **Net Worth Card:** Big bold number (Total Assets - Liabilities).
*   **Asset Allocation:** Donut chart (Equity vs. Crypto vs. Gold).
*   **Performance:** Line chart (Portfolio Value vs. Invested Amount) - YTD selector.
*   **Top Movers:** Small list of biggest gainers/losers in the portfolio today.

### 4.4 Smart Advisor & Signals Hub
*Layout: Three Vertical Panes/Columns*

*   **Pane 1: Alerts & Red Flags (The Watchdog)**
    *   **Logic:** Backend checks user holdings against a database of "Negative Events."
    *   *Example:* User holds "Adani Ent." -> System detects "Hindenburg Report" -> Triggers Red Flag card.
    *   *UI:* Red border cards with succinct warning text.

*   **Pane 2: Macro Intelligence (The Context)**
    *   **Logic:** Curated feed based on tags. If user holds Crypto -> Show Bitcoin ETF news. If user holds IT stocks -> Show US Fed Rate news.
    *   *Toggle:* "My Portfolio Relevant" vs. "Global Market".

*   **Pane 3: Optimization (The Fixer)**
    *   **Logic:** Compares `Risk_Score` to `Current_Allocation`.
    *   *Suggestion:* "You are a 'Conservative' investor but hold 40% Crypto. Suggest reducing Crypto exposure by 15%."

### 4.5 Market Intelligence & Reports
*   **Aggregator Engine:**
    *   Backend script scrapes reputable financial news/analysis sites for "Target Prices."
    *   Admin Panel allows internal team to upload proprietary PDF reports and set "Nexus Valuation Targets."
*   **Display:**
    *   Table/Card view: Stock Name | Current Price | Consensus Target | Nexus Target | Upside %.
    *   "Download Report" button for detailed PDFs.

### 4.6 Portfolio Rebalancing & New Avenues
*   **Rebalancing Tool:** A "Before vs. After" visualization.
    *   *UI:* Slider interface. "To reach your goal, Sell [Stock A], Buy [Mutual Fund B]."
*   **New Avenues Explorer:**
    *   Search/Discovery tool filtering assets by "High Growth," "Stable Income," "Undervalued."
    *   Matches recommendations to the user's `Risk_Score`.

---

## 5. Database Schema (Simplified Relational Model)

*   **Users** (`id`, email, password_hash, risk_score, risk_persona, created_at)
*   **Goals** (`id`, user_id, goal_name, target_amount, horizon_years)
*   **AssetClasses** (`id`, name) *e.g., Equity, Crypto, Gold*
*   **Holdings** (`id`, user_id, symbol, quantity, buy_price, current_source_id)
*   **MarketData** (`symbol`, current_price, last_updated, pe_ratio, sector)
*   **Signals** (`id`, related_symbol, type [RED_FLAG, MACRO], headline, source_url, severity)
*   **Reports** (`id`, symbol, analyst_rating, target_price_low, target_price_high, report_url)

---

## 6. Implementation Plan: The MVP Roadmap

### Phase 1: Foundation (Weeks 1-3)
*   Setup Next.js & Python FastAPI backend.
*   Implement Authentication (JWT).
*   Build the "Holistic Assessment" Signup Flow.
*   Build Manual Asset Entry forms.

### Phase 2: Connectors & Dashboard (Weeks 4-6)
*   Implement CSV import for Brokers (Easier first step than full API approval).
*   Attempt Zerodha/Upstox API connectivity (Sandbox mode).
*   Build the Main Dashboard (Charts & Net Worth calc).

### Phase 3: Intelligence & Advisor (Weeks 7-9)
*   Build the Scraper Engine for Market Data.
*   Implement "Red Flag" logic (Keyword matching against news API).
*   Develop the Admin Panel for uploading "Market Reports."

### Phase 4: UI Polish & Dark Mode (Week 10)
*   Refine Tailwind themes.
*   Implement the Light/Dark toggle.
*   QA and Mobile Responsiveness check.

---

## 7. Instructions for Claude Code (Prompting Strategy)

When you feed this to the AI, use these specific prompts based on this SDD:

1.  **For Database:** *"Create a PostgreSQL schema using SQLAlchemy (Python) based on the User, Holdings, and MarketData models defined in the SDD. Include relationships for a user having multiple holdings."*
2.  **For Connectors:** *"Write a Python service that takes a CSV export from Zerodha and parses it into our standard Holdings data model."*
3.  **For UI Components:** *"Create a React component using Tailwind CSS for the 'Smart Advisor' section. It should have three columns. The first column 'Red Flags' should use a red border styling. Support a dark mode prop that changes the background to slate-900."*
4.  **For Logic:** *"Write a function `calculate_portfolio_health` that takes a user's risk score and their current asset allocation, and returns a list of rebalancing string suggestions."*