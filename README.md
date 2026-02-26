# FolioVault — Portfolio Tracker

A full-stack investment portfolio tracker built with Next.js 15, Prisma, and shadcn/ui. Track stocks, crypto, ETFs, bonds, and mutual funds with real-time market data, analytics, price alerts, and a built-in Binance trading terminal.

**Live:** [foliovault.app](https://foliovault.app)

---

## Features

- **Multi-asset tracking** — Stocks, Crypto, ETFs, Mutual Funds, Bonds
- **Multi-currency support** — Each asset tracked in its native currency (USD, TRY, EUR, GBP, JPY, etc.) with automatic currency detection from exchange; all values converted to your display currency via live FX rates
- **Binance Trading Terminal** — Connect your Binance API keys to view real-time balances, place market/limit orders, and view order & trade history directly from FolioVault
- **Live market prices** — Yahoo Finance (primary) with Alpha Vantage fallback; 5-minute cache
- **P&L calculations** — Per-asset and portfolio-level gain/loss with proper cross-currency conversion
- **Analytics dashboard** — Performance charts, allocation breakdown, P&L bar charts, top movers
- **TradingView charts** — Interactive price charts per asset
- **Price alerts** — Get notified when an asset crosses a target price (above/below); works for both portfolio assets and Binance trading pairs
- **Watchlist** — Track symbols you're interested in with live price updates
- **Transaction log** — Record buys, sells, and dividends with full history
- **Dividend tracking** — Track dividend income with charts and per-asset breakdown
- **Data export** — Export holdings and transactions as CSV or full JSON snapshot
- **Onboarding guide** — Step-by-step walkthrough for new users
- **Legal consent system** — Versioned legal document approval; users must re-accept when terms update
- **Support form** — In-app feedback and support contact
- **Responsive UI** — Sidebar (desktop) + hamburger drawer (mobile); paginated tables
- **Authentication** — Email/password + Google OAuth via NextAuth.js (JWT sessions)
- **Forgot password** — Email-based password reset flow via Resend
- **Email verification** — Verify email address on signup
- **Security** — Rate limiting, security headers, XSS protection, bcrypt password hashing, encrypted API key storage
- **Settings** — Profile, password, currency preference, Binance API keys, data export, account deletion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database ORM | Prisma 5 (LibSQL adapter) |
| Database (prod) | Turso (LibSQL) |
| Database (dev) | SQLite |
| Auth | NextAuth.js v5 (Credentials + Google OAuth) |
| Charts | Recharts + TradingView widget |
| Market Data | Yahoo Finance API + Alpha Vantage |
| Trading | Binance API (via Hetzner proxy for static IP) |
| FX Rates | Yahoo Finance currency pairs |
| Email | Resend |
| Deployment | Vercel |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/idaturgutinal/portfolio-tracker.git
cd portfolio-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-here"          # openssl rand -base64 32
```

### 4. Create the database

```bash
npm run db:push
```

This creates `prisma/dev.db` and applies the schema.

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Create an account via `/signup`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string. `file:./dev.db` for SQLite |
| `AUTH_SECRET` | Yes | Random secret for signing JWT tokens. Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Yes | 32-byte hex key for encrypting Binance API keys at rest |
| `NEXTAUTH_URL` | Prod only | Your app's public URL (e.g. `https://foliovault.app`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `RESEND_API_KEY` | No | Resend API key for transactional emails (verification, password reset) |
| `EMAIL_FROM` | No | Sender address for emails (default: `Portfolio Tracker <onboarding@resend.dev>`) |
| `ALPHA_VANTAGE_API_KEY` | No | Optional Alpha Vantage API key as fallback data source |
| `BINANCE_PROXY_URL` | No | URL of the Hetzner proxy for Binance API requests (static IP whitelisting) |

---

## Database Scripts

```bash
npm run db:push       # Apply schema to database (dev — no migration history)
npm run db:migrate    # Create and apply a named migration (prod-safe)
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:studio     # Open Prisma Studio (browser-based DB GUI)
```

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    (auth)/               # Login, signup, forgot/reset password
    (legal)/              # Terms of Service, Privacy Policy, Disclaimer
    dashboard/            # Protected dashboard routes
      page.tsx            # Overview — summary cards, top movers, charts
      assets/             # Holdings management + asset detail view
      transactions/       # Transaction log (paginated)
      alerts/             # Price alerts
      analytics/          # Performance & allocation analytics
      watchlist/          # Watchlist management
      dividends/          # Dividend tracking and charts
      terminal/           # Binance trading terminal
      settings/           # Profile, security, preferences, API keys, export, danger zone
      support/            # Support/feedback form
      chart/[symbol]      # TradingView chart widget
    api/                  # API route handlers
      auth/               # NextAuth + signup, verification, password reset
      assets/             # Asset CRUD
      transactions/       # Transaction creation
      alerts/             # Alert CRUD
      portfolios/         # Portfolio CRUD
      market/             # Price quotes, history, symbol search
      binance/            # Binance API proxy (account, orders, trades, market data)
      user/               # Profile, password, API keys, export, delete
      watchlist/          # Watchlist CRUD
      legal-consent/      # Legal document consent tracking
      support/            # Support form submission
  components/
    ui/                   # shadcn/ui primitives
    dashboard/            # Summary cards, top movers, charts
    assets/               # Asset table, form dialog, detail view, TradingView chart
    transactions/         # Transaction table + dialog
    alerts/               # Alert table + dialog + notifier
    analytics/            # Asset breakdown, P&L charts
    watchlist/            # Watchlist table + dialog
    dividends/            # Dividend tables and charts
    terminal/             # Binance terminal (order form, order book, trade history)
    settings/             # Settings tabs (profile, security, preferences, API keys, export, danger zone)
    onboarding/           # Onboarding dialog + user guide
    support/              # Support form
    legal-consent-modal.tsx  # Mandatory legal consent overlay
    sidebar-nav.tsx       # Responsive sidebar/drawer nav
    symbol-search.tsx     # Ticker symbol search with autocomplete
    empty-state.tsx       # Reusable empty state component
  lib/
    auth.ts               # NextAuth configuration (Credentials + Google)
    auth.config.ts        # Auth route protection settings
    prisma.ts             # Prisma client singleton
    env.ts                # Runtime environment variable validation
    email.ts              # Email delivery via Resend
    crypto.ts             # AES-256-GCM encryption for API keys
    rate-limit.ts         # In-memory rate limiter
    legal-version.ts      # Current legal document version string
    utils.ts              # cn() utility
  services/               # Server-side data access layer
    portfolio.service.ts
    transaction.service.ts
    dashboard.service.ts
    alert.service.ts
    watchlist.service.ts
    user.service.ts
    marketData.ts         # Yahoo Finance + Alpha Vantage + FX rates
  hooks/                  # Client-side React hooks
    use-portfolio.ts
    use-theme.ts
    use-toast.ts
  types/                  # Shared TypeScript types
  utils/
    format.ts             # Currency, percent, date formatters
middleware.ts             # Security headers middleware
prisma/
  schema.prisma           # Database schema
```

---

## Database Models

| Model | Description |
|---|---|
| `User` | User account with name, email, password, currency preference, encrypted Binance API keys, legal consent tracking |
| `Portfolio` | Named portfolio belonging to a user |
| `Asset` | Individual holding (symbol, quantity, avg buy price, type, currency) |
| `Transaction` | Buy/sell/dividend record linked to an asset |
| `PriceAlert` | Price threshold alert (above/below) |
| `WatchlistItem` | Tracked symbol not in any portfolio |
| `EmailVerification` | Signup email verification codes |
| `PasswordReset` | Password reset tokens |

---

## API Overview

All API routes require authentication (JWT session cookie) except auth endpoints.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account (rate-limited) |
| POST | `/api/auth/send-verification` | Send email verification code |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/reset-password` | Complete password reset |
| GET | `/api/portfolios` | List portfolios |
| POST | `/api/portfolios` | Create portfolio |
| PATCH | `/api/portfolios/[id]` | Update portfolio |
| DELETE | `/api/portfolios/[id]` | Delete portfolio |
| POST | `/api/assets` | Add asset to portfolio |
| PATCH | `/api/assets/[id]` | Update asset |
| DELETE | `/api/assets/[id]` | Delete asset + transactions |
| POST | `/api/transactions` | Record transaction |
| GET | `/api/alerts` | List price alerts |
| POST | `/api/alerts` | Create price alert |
| PATCH | `/api/alerts/[id]` | Reactivate triggered alert |
| DELETE | `/api/alerts/[id]` | Delete alert |
| GET | `/api/watchlist` | List watchlist items |
| POST | `/api/watchlist` | Add to watchlist |
| PATCH | `/api/watchlist/[id]` | Update watchlist item |
| DELETE | `/api/watchlist/[id]` | Remove from watchlist |
| GET | `/api/market/quote?symbol=` | Get live price quote |
| GET | `/api/market/history?symbol=&range=` | Get historical prices |
| GET | `/api/market/search?q=` | Search ticker symbols |
| GET | `/api/binance/account` | Binance account balances |
| GET | `/api/binance/orders` | Open and recent orders |
| POST | `/api/binance/order` | Place a new order |
| DELETE | `/api/binance/order` | Cancel an order |
| GET | `/api/binance/trades` | Recent trade history |
| GET | `/api/binance/market/exchange-info` | Trading pair info |
| PATCH | `/api/user/profile` | Update name/email/currency |
| PATCH | `/api/user/password` | Change password (rate-limited) |
| POST | `/api/user/api-keys` | Save encrypted Binance API keys |
| DELETE | `/api/user/api-keys` | Delete Binance API keys |
| GET | `/api/user/export?format=` | Export data (csv-assets, csv-transactions, json) |
| DELETE | `/api/user/delete` | Delete account (rate-limited) |
| POST | `/api/legal-consent` | Accept updated legal documents |
| POST | `/api/support` | Send support message |

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- Binance API keys encrypted at rest with AES-256-GCM
- Security headers middleware (X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Login rate limiting (5 attempts per email per 15 minutes)
- Rate limiting on signup, password change, and account deletion
- HTML injection protection on support form
- All API routes validate authentication and resource ownership
- Input validation on all routes (type, range, length checks)
- Email addresses normalized to lowercase
- Sell transactions validated against held quantity
- Runtime environment variable validation
- Binance API requests routed through static-IP proxy (Hetzner VPS)

---

## Architecture

```
User Browser
    ↓
Vercel (Next.js)
    ├── Dashboard / Assets / Analytics → Yahoo Finance API (market data)
    ├── Binance Terminal → Hetzner VPS Proxy → Binance API (trading)
    └── Database → Turso (LibSQL, eu-west-1)
```

---

## Deployment on Vercel

1. **Import project in Vercel** — connect your GitHub repository
2. **Set environment variables** in Vercel dashboard:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Your database connection string |
   | `TURSO_DATABASE_URL` | Turso LibSQL URL |
   | `TURSO_AUTH_TOKEN` | Turso auth token |
   | `AUTH_SECRET` | A random secret (`openssl rand -base64 32`) |
   | `ENCRYPTION_KEY` | 32-byte hex key for API key encryption |
   | `NEXTAUTH_URL` | Your app URL (e.g. `https://foliovault.app`) |
   | `BINANCE_PROXY_URL` | Hetzner proxy URL for Binance API |
   | `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
   | `RESEND_API_KEY` | Resend API key for emails (optional) |

3. **Deploy** — Vercel runs `prisma generate && next build` automatically.
4. **Custom domain** — Add your domain in Vercel project settings and update DNS records.

---

## License

MIT
