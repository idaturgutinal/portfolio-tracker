# Portfolio Tracker

A full-stack investment portfolio tracker built with Next.js 15, Prisma, and shadcn/ui. Track stocks, crypto, ETFs, and more — with live prices, P&L calculations, price alerts, and data export.

---

## Features

- **Multi-asset tracking** — Stocks, Crypto, ETFs, Mutual Funds, Bonds
- **Live market prices** — Yahoo Finance (primary) with Alpha Vantage fallback; 5-minute cache
- **P&L calculations** — Per-asset and portfolio-level gain/loss with FX conversion
- **Performance charts** — Daily, weekly, and monthly portfolio value history (Recharts)
- **Allocation charts** — Breakdown by asset type or individual asset
- **Top movers** — Top 5 gainers and losers at a glance
- **Price alerts** — Notify when an asset crosses a target price (above/below)
- **Transaction log** — Record buys, sells, and dividends; CSV export
- **Data export** — Export holdings and transactions as CSV or full JSON snapshot
- **Responsive UI** — Sidebar (desktop) + hamburger drawer (mobile); mobile-optimised tables
- **Authentication** — Email/password auth via NextAuth.js (JWT sessions)
- **Settings** — Profile, password change, currency preference, danger zone (account deletion)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database ORM | Prisma 5 |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL (recommended: Neon) |
| Auth | NextAuth.js v5 |
| Charts | Recharts |
| Market Data | Yahoo Finance API + Alpha Vantage |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/portfolio-tracker.git
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
| `DATABASE_URL` | Yes | Prisma connection string. `file:./dev.db` for SQLite, PostgreSQL URL for production |
| `AUTH_SECRET` | Yes | Random secret for signing JWT tokens. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Prod only | Your app's public URL (e.g. `https://myapp.vercel.app`). Not needed locally. |
| `ALPHA_VANTAGE_API_KEY` | No | Optional Alpha Vantage API key as fallback data source. Free tier: 25 req/day |

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
    (auth)/               # Login & signup pages
    dashboard/            # Protected dashboard routes
      layout.tsx          # Auth guard + sidebar layout
      page.tsx            # Overview page
      assets/             # Holdings management
      transactions/       # Transaction log
      alerts/             # Price alerts
      analytics/          # Coming soon
      watchlist/          # Coming soon
      settings/           # User preferences
    api/                  # API route handlers
      auth/               # NextAuth + signup
      assets/             # Asset CRUD
      transactions/       # Transaction creation
      alerts/             # Alert CRUD
      market/             # Price quotes, history, search
      user/               # Profile, password, export, delete
  components/
    ui/                   # shadcn/ui primitives
    dashboard/            # Dashboard-specific components
    assets/               # Asset table + form dialog
    transactions/         # Transaction table + dialog
    alerts/               # Alert table + dialog
    settings/             # Settings tabs
    sidebar-nav.tsx       # Responsive sidebar/drawer nav
    empty-state.tsx       # Reusable empty state component
  lib/
    auth.ts               # NextAuth configuration
    prisma.ts             # Prisma client singleton
    rate-limit.ts         # In-memory rate limiter
    utils.ts              # cn() utility
  services/               # Server-side data access layer
    portfolio.service.ts
    transaction.service.ts
    dashboard.service.ts
    alert.service.ts
    user.service.ts
    marketData.ts
  types/                  # Shared TypeScript types
  utils/
    format.ts             # Currency, percent, date formatters
prisma/
  schema.prisma           # Database schema
```

---

## Deployment on Vercel

### Important: SQLite → PostgreSQL

SQLite is a local file-based database and **does not persist** across Vercel serverless function invocations. For production, switch to a hosted PostgreSQL database.

**Recommended: [Neon](https://neon.tech)** (free tier, serverless PostgreSQL)

1. Create a Neon project and copy the connection string.
2. Update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

### Deploy steps

1. **Push to GitHub** (make sure `.env` is in `.gitignore`)

2. **Import project in Vercel**
   - Connect your GitHub repository
   - Framework preset: Next.js (auto-detected)

3. **Set environment variables** in Vercel dashboard:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon/PostgreSQL connection string |
   | `AUTH_SECRET` | A new random secret (`openssl rand -base64 32`) |
   | `NEXTAUTH_URL` | Your Vercel app URL (e.g. `https://myapp.vercel.app`) |
   | `ALPHA_VANTAGE_API_KEY` | Optional — leave blank to use Yahoo Finance only |

4. **Deploy** — Vercel will run `prisma generate && next build` automatically (see `vercel.json`).

### Vercel project settings

The `vercel.json` in this repo sets:
- Build command: `prisma generate && next build` (ensures Prisma client is generated before build)
- All required environment variable references

---

## API Overview

All API routes require authentication (JWT session cookie) except `/api/auth/*` and `/api/auth/signup`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account (rate-limited: 10/15min per IP) |
| GET | `/api/alerts` | List price alerts |
| POST | `/api/alerts` | Create price alert |
| DELETE | `/api/alerts/[id]` | Delete alert |
| PATCH | `/api/alerts/[id]` | Reactivate triggered alert |
| POST | `/api/assets` | Add asset to portfolio |
| PATCH | `/api/assets/[id]` | Update asset |
| DELETE | `/api/assets/[id]` | Delete asset + transactions |
| POST | `/api/transactions` | Record transaction |
| GET | `/api/market/quote?symbol=` | Get live price quote |
| GET | `/api/market/history?symbol=&range=` | Get historical prices |
| GET | `/api/market/search?q=` | Search ticker symbols |
| PATCH | `/api/user/profile` | Update name/email/currency |
| PATCH | `/api/user/password` | Change password (rate-limited: 5/hr) |
| GET | `/api/user/export?format=` | Export data (csv-assets, csv-transactions, json) |
| DELETE | `/api/user/delete` | Delete account (rate-limited: 5/hr) |

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- All API routes validate authentication and resource ownership
- Rate limiting on auth-sensitive endpoints (signup, password change, account deletion)
- Input validation on all routes (type, range, length, enum checks)
- Email addresses normalized to lowercase at signup and login
- Sell transactions validated against held quantity
- Sensitive API responses include `Cache-Control: no-store`

---

## License

MIT
