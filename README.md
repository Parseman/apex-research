# Berdinvest — Investment Research Platform

A full-stack investment research platform providing AI-powered analysis for US equities and cryptocurrencies. Built for serious investors who want data-driven insights, live market data, and structured portfolio strategy.

---

## Table of Contents

1. [Overview](#overview)
2. [Objectives](#objectives)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Features](#features)
6. [Database Schema](#database-schema)
7. [Edge Functions (AI Analysis)](#edge-functions-ai-analysis)
8. [Data Sources & APIs](#data-sources--apis)
9. [User Roles & Access Control](#user-roles--access-control)
10. [Pages & Navigation Flow](#pages--navigation-flow)
11. [Screener — Equity](#screener--equity)
12. [Screener — Crypto](#screener--crypto)
13. [Favorites System](#favorites-system)
14. [Admin Panel](#admin-panel)
15. [AI Performance Tracking](#ai-performance-tracking)
16. [Environment Variables](#environment-variables)
17. [Project Structure](#project-structure)
18. [Local Development](#local-development)
19. [Deployment](#deployment)

---

## Overview

Berdinvest is a private investment research portal restricted to invited users. It aggregates live market data, generates AI analysis via large language models, and presents structured buy/sell/hold recommendations across two universes:

- **Equity Screener** — ~500 US stocks, 41 featured with deep analysis
- **Crypto Screener** — ~100+ cryptocurrencies, 10 featured with deep analysis + short-term trading signals

The platform is designed around a long-term, value-oriented approach for equities and a cycle-aware DCA strategy for crypto — while also offering short-term trading setups for cryptos (admin-only).

---

## Objectives

### For Users
- Access curated, AI-generated investment research without needing Bloomberg or expensive subscriptions
- Filter assets by personal risk profile and investment horizon
- Follow live prices updated every 30 seconds
- Save up to 10 favorite assets for focused monitoring
- Read bull/bear cases, key metrics, and structured recommendations per asset

### For Admins
- Manage the user base (invite, edit, remove users)
- Trigger AI analysis runs on demand — for all assets or favorites only
- Control analysis scope: full universe or selected favorites
- Access short-term crypto trading signals (BUY/SELL/WAIT with entry zones, targets, stop-loss, R/R ratio)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| Edge Functions | Supabase Edge Functions (Deno runtime) |
| AI / LLM | Groq API — `llama-3.3-70b-versatile` |
| Stock Data | Finnhub API |
| Crypto Prices | Binance REST API |
| Crypto Market Data | CoinGecko API |
| Crypto News | CryptoCompare API |
| Charts | TradingView Advanced Chart Widget |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend)                   │
│                                                          │
│   React SPA                                              │
│   ├── React Router (SPA, all routes → index.html)        │
│   ├── Auth Context (session management)                  │
│   ├── Pages: Home / Equity / Crypto / Admin / Auth       │
│   └── Components: Tables, Cards, Modals, Charts          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│                   SUPABASE (Backend)                     │
│                                                          │
│   PostgreSQL Database                                    │
│   ├── profiles          — user onboarding data & roles   │
│   ├── stock_analyses    — AI analysis results (stocks)   │
│   ├── crypto_analyses   — AI analysis results (cryptos)  │
│   └── user_favorites    — user saved assets (max 10)     │
│                                                          │
│   Edge Functions (Deno)                                  │
│   ├── analyze-stocks         → Finnhub + Groq            │
│   ├── analyze-cryptos        → Binance + CoinGecko + Groq│
│   ├── analyze-crypto-trading → Binance klines + Groq     │
│   └── manage-users           → admin user CRUD           │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  EXTERNAL APIs                           │
│   Finnhub       — stock quotes & news                    │
│   Binance       — crypto prices & candlestick data       │
│   CoinGecko     — market cap, ATH, historical changes    │
│   CryptoCompare — crypto news feed                       │
│   Groq          — LLM inference (analysis generation)    │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Live Market Data
- Stock prices refresh on-demand via Finnhub (individual fetch per symbol)
- Crypto prices update every **30 seconds** via Binance REST API (individual parallel requests, CORS-safe)
- Status indicator shows last update time and countdown to next refresh

### AI-Powered Analysis
- Long-term analysis generated for 41 stocks and 10 featured cryptos
- Stored in Supabase, displayed across the UI without re-fetching on every load
- Admin-triggered: can run for all assets or favorites only
- Short-term crypto trading analysis available on-demand (admin only)

### AI Performance Tracking
- Every AI analysis (long-term stocks, long-term cryptos, short-term trading) creates an immutable snapshot with the price at the time of generation
- Admin can evaluate any snapshot at any time — before or after its expiry date — to compare the AI signal against the current price
- Win/Loss/Neutral outcome computed with a ±2% threshold
- Full performance dashboard in the admin panel: win rate %, average P&L, stacked bar chart, paginated history

### Profile Matching
- Users complete an onboarding profile: risk level (1–5), investment horizon, capital, status
- Assets are sorted to show profile-matched assets first
- Risk-level filtering: each crypto category has a minimum required risk tolerance

### Favorites System
- Each user can save up to **10 assets total** (stocks + cryptos combined)
- Star button on every row in both screeners
- Optimistic UI updates with rollback on error
- Admin can restrict analysis runs to favorites only

### Role-Based Access
- **Users**: access screeners, view analysis, save favorites
- **Admins**: all user features + user management + analysis triggers + short-term trading analysis

---

## Database Schema

### `profiles`
| Column | Type | Description |
|---|---|---|
| id | uuid | Supabase auth user ID |
| email | text | User email |
| role | text | `'admin'` or `'user'` |
| onboarding_done | boolean | Whether profile setup is complete |
| display_name | text | Display name |
| risk_level | integer | 0–5 (0 = not set) |
| horizon | text | `'court'`, `'moyen'`, `'long'`, `'tres_long'` |
| capital | text | Capital range |
| status | text | Investor status |
| created_by | text | Email of admin who created the account |
| created_at | timestamp | Account creation date |

### `stock_analyses`
| Column | Type | Description |
|---|---|---|
| sym | text | Stock ticker (primary key) |
| recommendation | text | `'BUY'`, `'SELL'`, `'HOLD'` |
| confidence | integer | 1–5 |
| buy_below | numeric | Target entry price |
| sell_above | numeric | Target exit price |
| buy_window_start/end | date | Optimal buy window |
| sell_window_start/end | date | Optimal sell window |
| summary | text | 2–3 sentence summary |
| bull_factors | jsonb | Array of bull case points |
| bear_factors | jsonb | Array of bear case points |
| key_insight | text | Single key takeaway |
| updated_at | timestamp | Last analysis timestamp |

### `crypto_analyses`
Same schema as `stock_analyses`.

### `user_favorites`
| Column | Type | Description |
|---|---|---|
| user_id | uuid | Supabase auth user ID |
| sym | text | Asset ticker |
| asset_type | text | `'stock'` or `'crypto'` |
| created_at | timestamp | When favorited |

Primary key: `(user_id, sym)`

### `analysis_snapshots`
Immutable append-only table. One row is inserted per AI analysis call (never upserted — each run creates a new record).

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| created_at | timestamptz | When the analysis was generated |
| asset_type | text | `'stock'` or `'crypto'` |
| sym | text | Asset ticker |
| signal | text | `'BUY'`, `'SELL'`, `'HOLD'`, `'WAIT'` |
| confidence | integer | 1–5 |
| price_at_analysis | numeric | Price of the asset at generation time |
| buy_below | numeric | AI entry price target (nullable) |
| sell_above | numeric | AI exit price target (nullable) |
| buy_window_end | date | End of recommended buy window (nullable) |
| sell_window_end | date | End of recommended sell window (nullable) |
| evaluation_due_at | timestamptz | When the prediction should be evaluated (derived from sell_window_end or +30 days) |
| evaluated_at | timestamptz | When the snapshot was last evaluated (nullable) |
| price_at_eval | numeric | Price at evaluation time (nullable) |
| outcome | text | `'win'`, `'loss'`, `'neutral'` (nullable until evaluated) |
| pnl_pct | numeric | P&L % — always positive = signal was correct, regardless of direction |
| full_analysis | jsonb | Complete raw JSON from the LLM |

**Win/Loss logic:**
- `BUY`: win if price rose >2%, loss if price fell >2%
- `SELL`: win if price fell >2% (sign-flipped), loss if rose >2%
- `HOLD` / `WAIT`: always neutral
- Within ±2%: neutral

---

## Edge Functions (AI Analysis)

### `analyze-stocks`
**Trigger:** POST request (admin only via dashboard)

**Flow:**
1. Receive list of stock symbols in request body (`{ syms: ['NVDA', 'AAPL', ...] }`)
2. For each symbol, fetch quote + news from **Finnhub API**
3. Build a structured prompt with price, P/E, change %, recent news headlines
4. Call **Groq** (`llama-3.3-70b-versatile`) with `response_format: json_object`
5. Parse the JSON response
6. Upsert result into `stock_analyses` table
7. Return results log

**Rate limiting:** 3.5s delay between stocks (~12 RPM)

---

### `analyze-cryptos`
**Trigger:** POST request (admin only via dashboard)

**Flow:**
1. Receive list of crypto symbols (`{ syms: ['BTC', 'ETH', ...] }`)
2. Fetch 24h ticker from **Binance** (price, change, volume, high, low)
3. Fetch enriched data from **CoinGecko** (market cap, ATH, 7d/30d changes)
4. Build structured prompt combining all data
5. Call **Groq** for analysis JSON
6. Upsert result into `crypto_analyses` table

**Rate limiting:** 5.5s delay between cryptos (respects CoinGecko free tier)

---

### `analyze-crypto-trading`
**Trigger:** POST request from frontend, on-demand (admin users only in UI)

**Flow:**
1. Receive single symbol (`{ sym: 'LINK' }`)
2. Fetch in parallel:
   - Binance 24h ticker
   - Binance 4h klines (last 48 candles)
   - CryptoCompare recent news
3. Compute technical indicators from klines:
   - Trend (bullish/bearish/neutral based on 48-candle % change)
   - Momentum (last 3 vs previous 3 candles average)
   - Volume trend (last 6 vs previous 6 candle volumes)
   - Position in range (% between period high and low)
4. Generate prompt with all data + example values anchored to the **actual current price** (prevents LLM from copying BTC-level prices)
5. Call **Groq** for short-term analysis JSON
6. Return result to client + insert snapshot into `analysis_snapshots` (fire-and-forget)

**Output includes:** signal (BUY/SELL/WAIT), confidence, timeframe, entry zone, target, stop-loss, R/R ratio, support/resistance, catalysts, risks, invalidation condition

**Snapshot evaluation_due_at:** derived by parsing the LLM's `timeframe` field (e.g. "2-3 semaines" → 21 days + 7 day buffer)

---

### `evaluate-snapshots`
**Trigger:** POST from admin panel (`PerformancePanel` component). JWT verification disabled — calls are authenticated via the Supabase service role inside the function.

**Modes:**
- `{ snapshot_id: "uuid" }` — Force-evaluate a single snapshot at any time, regardless of expiry or prior evaluation
- `{ evaluate_all: true }` — Evaluate all snapshots with `evaluated_at IS NULL` (no expiry date constraint)

**Flow:**
1. Fetch target snapshot(s) from `analysis_snapshots`
2. Fetch current price: Finnhub for stocks, Binance `/ticker/price` for cryptos
3. Compute `pnl_pct` and `outcome` based on signal direction and ±2% threshold
4. Update row with `evaluated_at`, `price_at_eval`, `outcome`, `pnl_pct`

**Important:** Snapshots can be re-evaluated at any time. `evaluated_at` reflects the last check, not a final verdict. This allows tracking progress mid-prediction (e.g. check after 10 days on a 20-day trade).

**Dashboard setting required:** Disable "Verify JWT" in Supabase → Edge Functions → evaluate-snapshots → Settings.

---

### `manage-users`
**Trigger:** POST from admin frontend actions

**Actions:**
- `create_user` — Creates Supabase auth user + profile row with given role
- `delete_user` — Deletes auth user and profile
- `update_role` — Changes user role in `profiles`
- `update_password` — Updates password via Supabase admin API

All actions require the calling user to have `role = 'admin'` in `profiles`.

---

## Data Sources & APIs

### Finnhub (Stocks)
- **Used for:** Live stock quotes, recent news headlines
- **Endpoint:** `https://finnhub.io/api/v1/quote?symbol=NVDA&token=...`
- **Key:** `VITE_FINNHUB_KEY` (frontend) / `FINNHUB_KEY` (edge functions)
- **Rate limits:** 60 calls/minute on free plan

### Binance (Crypto Prices)
- **Used for:** Live crypto prices, 24h stats, candlestick data (klines)
- **Endpoints:**
  - `GET /api/v3/ticker/24hr?symbol=BTCUSDT` — single ticker (CORS-safe)
  - `GET /api/v3/klines?symbol=BTCUSDT&interval=4h&limit=48` — candlesticks
- **No API key required** for public endpoints
- **Note:** Batch endpoint (`?symbols=[...]`) blocked by browser CORS — all requests are individual

### CoinGecko (Crypto Market Data)
- **Used for:** Market cap, all-time high, 7-day and 30-day price changes
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price?ids=...&vs_currencies=usd&include_market_cap=true...`
- **No API key required** on free tier (60 calls/minute)

### CryptoCompare (Crypto News)
- **Used for:** Recent news per crypto symbol
- **Endpoint:** `https://min-api.cryptocompare.com/data/v2/news/?categories=BTC&lang=EN`
- **No API key required** for basic news

### Groq (LLM Inference)
- **Used for:** Generating all AI analysis (stocks, cryptos, trading signals)
- **Model:** `llama-3.3-70b-versatile`
- **Config:** `temperature: 0.2`, `response_format: json_object`
- **Key:** `GROQ_KEY` (edge function environment variable)

### TradingView (Charts)
- **Used for:** Interactive price charts in the short-term trading tab
- **Integration:** Script injection via DOM manipulation (not iframe)
- **Symbol format:** `BINANCE:BTCUSDT`
- **Available intervals:** 15m, 1h, 4h, 1 Day

---

## User Roles & Access Control

### Role: `user`
| Feature | Access |
|---|---|
| Home page (live prices) | ✅ |
| Equity screener (all 500 stocks) | ✅ |
| Crypto screener (all 100+ cryptos) | ✅ |
| View AI analysis (stocks & cryptos) | ✅ |
| Favorites (up to 10 assets) | ✅ |
| Profile matching (risk-based sorting) | ✅ |
| Short-term trading analysis | ❌ |
| Trigger AI analysis runs | ❌ |
| Admin panel | ❌ |

### Role: `admin`
| Feature | Access |
|---|---|
| All user features | ✅ |
| Short-term trading analysis (⚡ Analyser button) | ✅ |
| Admin panel | ✅ |
| Trigger stock analysis runs | ✅ |
| Trigger crypto analysis runs | ✅ |
| Choose analysis mode (all / favorites only) | ✅ |
| Add / edit / delete users | ✅ |

### Route Guards
- `/equity`, `/crypto`, `/` — requires session + completed onboarding
- `/admin` — requires session + completed onboarding + `role === 'admin'`
- `/onboarding` — requires session but onboarding NOT yet done
- Unauthenticated users are redirected to `/login`

---

## Pages & Navigation Flow

```
/login ──────────► /onboarding ──────────► /
                   (if not done)           (home dashboard)
                                           │
                         ┌─────────────────┼──────────────────┐
                         ▼                 ▼                  ▼
                     /equity           /crypto             /admin
                   (Equity           (Crypto              (Admin
                   Screener)         Screener)            Panel)
```

### Home (`/`)
- Live price ticker scrolling across the top
- Feature highlights
- Quick-access cards to both screeners

### Equity Screener (`/equity`)
4 tabs:
1. **Résumé** — Paginated table of all stocks (20/page), search, star favorites, AI recommendation badges
2. **Fiches** — Cards for 41 featured stocks with full bull/bear analysis
3. **Stratégie** — Long-term equity strategy overview and allocation approach

### Crypto Screener (`/crypto`)
4 tabs:
1. **Résumé** — Paginated table of all cryptos (20/page), search by ticker/name/category, AI badges
2. **Fiches** — Cards for 10 featured cryptos with full bull/bear/moat analysis
3. **Court Terme** — TradingView chart + AI trading signal (⚡ Analyser, admin only) + news feed
4. **Stratégie** — DCA-oriented crypto strategy and cycle positioning

---

## Screener — Equity

### Universe
~500 US stocks pulled from `stockUniverse.ts`. Covers S&P 500 components and major NASDAQ names across all sectors.

### Featured Stocks (41)
Stocks in `stocks.ts` have rich metadata:
- **Fundamental metrics:** P/E ratio, revenue growth, D/E ratio, dividend yield
- **Moat classification:** Wide / Narrow / None
- **Risk rating:** 1–7 scale
- **Bull case:** Specific growth catalysts
- **Bear case:** Key risks
- **Entry / Stop-loss levels**
- **Overall rating:** ★★★½ style

### Live Prices
Fetched from **Finnhub** on page load and when needed. 24h change shown with color coding (green/red).

### AI Analysis Modal
Click any analyzed stock to open a modal with:
- Recommendation badge (BUY / SELL / HOLD) + confidence stars
- Buy below / Sell above price levels
- Optimal buy/sell windows
- 2–3 paragraph summary
- Bull factors list
- Bear factors list
- Key insight callout

### Profile Matching
Assets marked with `✓ Profil` badge if they match the user's risk level and investment horizon. Matched assets sorted to top of the list.

---

## Screener — Crypto

### Universe
~100+ cryptocurrencies in `cryptoUniverse.ts`, organized by category:
- Layer 1 PoW / PoS
- Layer 2 / Scaling
- DeFi (DEX, Lending, Liquid Staking, Yield)
- Oracles & Data
- AI & Compute
- Gaming & Metaverse
- NFT & Social
- Exchange Tokens
- Payments
- Privacy
- Storage & Compute
- Cross-chain / Bridges
- Real World Assets
- Social / Identity
- Memecoins
- DePIN
- Inscriptions / Ordinals

**Binance pair mapping:** Each entry maps to a Binance USDT trading pair. Some are explicitly marked `null` (no Binance listing) to avoid failed requests:
- `XMR` — delisted from Binance February 2024
- `KAS` — not listed on Binance
- `ZETA`, `TAIKO`, `PYUSD` — 400 errors confirmed

### Featured Cryptos (10)
Cryptos in `cryptos.ts` have full metadata:
| Symbol | Name | Category | Risk |
|---|---|---|---|
| BTC | Bitcoin | Store of Value | 5/10 |
| ETH | Ethereum | Smart Contracts | 5.5/10 |
| SOL | Solana | Layer 1 | 6.5/10 |
| BNB | BNB Chain | Exchange | 6/10 |
| LINK | Chainlink | Oracle/Infra | 7/10 |
| AVAX | Avalanche | Layer 1 | 7/10 |
| UNI | Uniswap | DeFi/DEX | 7.5/10 |
| DOT | Polkadot | Interoperability | 7/10 |
| AAVE | Aave Protocol | DeFi/Lending | 7.5/10 |
| ICP | Internet Computer | Layer 1 | 9/10 |

### Short-Term Trading Tab
Available to admin users only:
- **TradingView chart** — Interactive chart with Binance data, intervals: 15m / 1h / 4h / 1D
- **⚡ Analyser button** — Triggers `analyze-crypto-trading` edge function on demand
- **Analysis card** — Signal (BUY/SELL/WAIT), confidence, R/R ratio, entry zone, target, stop-loss, support/resistance, catalysts, risks, invalidation condition
- **News feed** — 8 latest articles from CryptoCompare, filtered by crypto symbol

---

## Favorites System

Users can favorite up to **10 assets** (stocks + cryptos combined).

### How it works
1. Star button (☆/★) appears on every row in both screeners
2. Clicking toggles the favorite state with **optimistic UI update** (immediate visual feedback)
3. If the Supabase write fails, the change is rolled back automatically
4. A `★ X/10 favoris` counter is shown in the search bar area
5. At 10 favorites, the star buttons for non-favorited assets are disabled

### Technical Implementation
The `useFavorites` custom hook:
- Fetches all user favorites from `user_favorites` table on mount
- Uses `useRef` to avoid stale closure issues with the toggle callback
- Returns `{ favorites, isFavorite, toggle, count, atLimit, loading }`
- Used in both `EquityScreenerPage` and `CryptoScreenerPage` independently

### Admin Use
In the Admin Panel, favorites mode restricts analysis runs to only the favorited assets. The panel fetches all users' favorites from Supabase and shows which stocks/cryptos will be analyzed.

---

## Admin Panel

### User Management
- View all registered users with creation date and role
- **Add user** — Email + password + role (admin/user)
- **Edit user** — Change password or role
- **Delete user** — Permanent deletion
- Stats row showing total users, admins, standard users

### Analysis Triggers

#### Mode toggle: All / Favorites Only
- **All** — Analyze full list (41 stocks, 10 cryptos)
- **Favorites Only** — Analyze only assets favorited by users
  - Shows live preview of which assets will be analyzed
  - Crypto favorites show logos for quick identification

#### Stock Analysis Block
- Runs analysis sequentially with 3.5s delay between stocks
- Live progress bar + per-symbol status (✓ / ✗ / ⟳)
- Stop button to interrupt mid-run
- Shows estimated time remaining

#### Crypto Analysis Block
- Runs analysis sequentially with 5.5s delay between cryptos
- Same progress indicators as stocks
- Shows crypto logos during analysis run

---

## AI Performance Tracking

### Overview
Every AI analysis call — long-term stocks, long-term cryptos, and short-term trading signals — creates an immutable row in `analysis_snapshots`. This allows retrospective evaluation of whether the AI recommendation was correct.

### How snapshots are created
| Source | When | Signal field |
|---|---|---|
| `analyze-stocks` | After each `stock_analyses` upsert | `recommendation` (BUY/SELL/HOLD) |
| `analyze-cryptos` | After each `crypto_analyses` upsert | `recommendation` (BUY/SELL/HOLD) |
| `analyze-crypto-trading` | After LLM response parsed | `signal` (BUY/SELL/WAIT) |

All inserts are **fire-and-forget** (`.then()` not `await`) so a snapshot failure never blocks or fails the main analysis pipeline.

### Evaluation
Snapshots can be evaluated at **any time** — before or after the `evaluation_due_at` date. This enables mid-prediction checks ("the AI said buy BTC on Jan 1st, is it already in profit on Jan 10th?").

- **Individual:** Click "Vérifier" / "Revérifier" on any row in the Performance Panel
- **Bulk:** Click "Vérifier toutes les analyses" to evaluate all pending snapshots in one call

### Performance Panel (Admin Panel → bottom section)
- **Stats row:** Total analyses, Win rate %, Average P&L %, Average confidence
- **Stacked bar chart:** Visual breakdown of WIN / LOSS / NEUTRE / EN ATTENTE proportions
- **Filters:** By asset type (All / Stocks / Cryptos) and signal (All / BUY / SELL / HOLD)
- **Table:** Date, Asset, Signal, Confidence, Price at analysis, Price at eval, P&L %, Outcome badge, Vérifier button
- **Win rate color:** Green ≥55% · Gold 40–55% · Red <40%

### Win/Loss logic
```
BUY signal:
  pnl_pct = (price_now - price_then) / price_then * 100
  > +2%  → WIN
  < -2%  → LOSS
  else   → NEUTRAL

SELL signal:
  pnl_pct = (price_then - price_now) / price_then * 100  (sign-flipped)
  > +2%  → WIN
  < -2%  → LOSS
  else   → NEUTRAL

HOLD / WAIT:
  always NEUTRAL (pnl_pct = raw change, informational only)
```

`pnl_pct` is always **"did following the signal make money?"** — positive = AI was correct, regardless of direction.

### RLS Policy
```sql
-- Allow any authenticated user to read (page is admin-gated at frontend level)
CREATE POLICY "read_authenticated" ON analysis_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role (edge functions) can write
CREATE POLICY "write_service" ON analysis_snapshots
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FINNHUB_KEY=your-finnhub-key
```

### Edge Functions (Supabase Secrets)
```
GROQ_KEY=your-groq-api-key
FINNHUB_KEY=your-finnhub-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (auto-injected by Supabase)
```

Set edge function secrets via the Supabase Dashboard → Edge Functions → Secrets, or via the CLI:
```bash
supabase secrets set GROQ_KEY=...
supabase secrets set FINNHUB_KEY=...
```

---

## Project Structure

```
apex-research/
├── public/                     # Static assets (logos, icons)
├── src/
│   ├── api/
│   │   └── api.ts              # API fetchers + price formatters
│   ├── auth/
│   │   └── AuthContext.tsx     # Auth provider (login, register, session)
│   ├── components/
│   │   ├── admin/              # Admin UI (StatsRow, UserTable, PerformancePanel…)
│   │   ├── home/               # Home page sections
│   │   ├── layout/             # Nav bars
│   │   └── screener/           # Tables, cards, modals, charts
│   ├── data/
│   │   ├── stocks.ts           # 41 featured stocks with metadata
│   │   ├── stockUniverse.ts    # ~500 US stock universe
│   │   ├── cryptos.ts          # 10 featured cryptos with metadata
│   │   └── cryptoUniverse.ts   # ~100+ crypto universe
│   ├── hooks/
│   │   └── useFavorites.ts     # Favorites management hook
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   ├── pages/                  # Route-level page components
│   ├── types/                  # TypeScript interfaces
│   ├── utils/
│   │   └── profileMatch.ts     # Risk profile matching logic
│   ├── App.tsx                 # Router + route guards
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── supabase/
│   └── functions/
│       ├── analyze-stocks/          # Stock AI analysis + snapshot insert
│       ├── analyze-cryptos/         # Crypto AI analysis + snapshot insert
│       ├── analyze-crypto-trading/  # Short-term trading analysis + snapshot insert
│       ├── evaluate-snapshots/      # Evaluate AI predictions vs current price
│       └── manage-users/            # User CRUD edge function
├── vercel.json                 # SPA routing config (all → index.html)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173`.

**Required:** A `.env` file with the environment variables listed above before starting the dev server.

---

## Deployment

### Frontend — Vercel
1. Connect the repository to Vercel
2. Set environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FINNHUB_KEY`
3. `vercel.json` handles SPA routing (all paths rewrite to `index.html`)

### Backend — Supabase Edge Functions
Deploy via the Supabase Dashboard:
1. Go to **Edge Functions** in the sidebar
2. Select the function to update
3. Paste the updated `index.ts` content
4. Click **Deploy**

Or via Supabase CLI (if configured):
```bash
supabase functions deploy analyze-stocks
supabase functions deploy analyze-cryptos
supabase functions deploy analyze-crypto-trading
supabase functions deploy evaluate-snapshots
supabase functions deploy manage-users
```

**JWT verification:** Disabled on `evaluate-snapshots` (called from admin frontend). When deploying manually via the dashboard, set "Verify JWT" to OFF in the function's Settings tab — the `config.toml` setting is only applied when deploying via CLI.

The `manage-users` function enforces admin role internally.

---

## Key Design Decisions

**Why Binance over CoinGecko for live prices?**
CoinGecko's free tier is rate-limited to 60 calls/minute and has higher latency. Binance provides real-time ticker data with no authentication required, ideal for 30-second refresh cycles.

**Why individual Binance requests instead of batch?**
Binance's batch endpoint (`?symbols=[...]`) is blocked by browser CORS policies when the server returns a 400 for any invalid symbol in the batch. Individual `?symbol=BTCUSDT` requests are CORS-safe and use `Promise.allSettled` so one failure doesn't block others.

**Why Groq instead of OpenAI?**
Groq's inference is significantly faster (~10x) and cost-effective for structured JSON output. The `llama-3.3-70b-versatile` model provides high-quality financial analysis suitable for the platform's use case.

**Why store analysis in Supabase instead of generating on-demand?**
Long-term analysis for 41 stocks or 10 cryptos takes several minutes to generate (API rate limits). Storing results means users see instant analysis on page load, and the admin can choose when to refresh it.

**Why use INSERT (not upsert) for snapshots?**
`stock_analyses` and `crypto_analyses` are upserted by `sym` — each run overwrites the previous analysis. `analysis_snapshots` uses `INSERT` to build an append-only audit log: every analysis run creates a new row, preserving the exact price and signal at that moment in time. This is essential for performance tracking — you cannot evaluate what the AI said if you've overwritten it.

**Why allow re-evaluation before expiry?**
A prediction doesn't need to be over to be informative. If the AI said "buy BTC on Jan 1st, sell around Jan 20th", checking on Jan 10th shows whether the trade is already profitable. The `evaluated_at` column acts as "last checked at" rather than a final verdict, so snapshots can be re-evaluated as many times as needed.

**Why `useRef` in `useFavorites`?**
Standard `useCallback` with `favorites` as a dependency recreates the `toggle` and `isFavorite` functions on every favorites change. Using a ref that syncs to the current state on each render gives stable function references while always reading the latest data — preventing stale closure issues and unnecessary re-renders.

---

*© Berdinvest — All rights reserved. Internal use only.*
