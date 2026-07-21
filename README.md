# QuizNest

SaaS platform for creating, managing and sharing quizzes. AI-powered quiz generation, real-time participation, advanced analytics, and a full billing/wallet system.

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) + Prisma 7.8 ORM
- **Auth**: better-auth (email/password + Google OAuth)
- **Payments**: FedaPay
- **UI**: shadcn/ui (base-nova) + Tailwind CSS v4
- **Package Manager**: pnpm

## Features

- **Quiz Builder** — Create quizzes with multiple question types (MCQ, true/false, open-ended, fill-in-the-blank)
- **AI Generation** — Generate questions from topics via AI (all users, quota-gated)
- **AI Import** — Import questions from documents (PDF, DOCX, TXT, Markdown)
- **Real-time Participation** — Live quiz sessions with participant tracking
- **Analytics** — Detailed analytics per quiz and per question
- **Export** — PDF, Excel, CSV exports (credit-gated per export)
- **Certificates** — Auto-generated participation certificates
- **Question Bank** — Reusable question pool across quizzes
- **Multi-organization** — Team/org workspaces with roles
- **Custom Domain** — Organization-branded subdomains

### Monetization System

- **Plans** — Free, Starter, Professional (admin-configurable)
- **Subscription Billing** — FedaPay-powered recurring payments
- **Wallet System** — Credit packs + bonus credits from add-ons
- **Pass System** — Time-limited access passes (e.g. 24h, 72h)
- **Add-on Products** — One-time or metered feature boosts
- **Coupons** — Percentage or fixed-amount promo codes
- **Feature Gating** — Server-side + client-side gating (quota, plan, pass, add-on)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or Neon)

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost"

# Payments (FedaPay)
NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY="..."
NEXT_PUBLIC_FEDAPAY_ENVIRONMENT="test"
FEDAPAY_SECRET_KEY="..."

# Super Admin
SUPER_ADMIN_EMAIL="your-email@gmail.com"
```

### Database Setup

```bash
# Push schema to database
pnpm db:sync

# Or run migrations
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (marketing)/          # Public landing pages
    admin/                # Super Admin panel
    api/                  # API routes
    auth/                 # Auth pages (login, register, forgot)
    dashboard/            # Authenticated dashboard
      ai/                 # AI quiz generator
      analytics/          # Analytics dashboard
      billing/            # Billing & subscriptions
      certificates/       # Certificate management
      marketplace/        # Marketplace (add-ons, passes, credit packs)
      organizations/      # Organization management
      participants/       # Participant management
      questions/          # Question bank
      quizzes/            # Quiz CRUD
      settings/           # Profile & org settings
      team/               # Team management
  components/             # Shared UI components
    charts/               # Chart wrappers (Recharts)
    shared/               # Reusable components
    ui/                   # shadcn/ui components
  constants/              # Feature flags, credit costs, marketing
  features/               # Feature modules
    admin/                # Admin CRUD forms
    billing/              # Billing UI + server actions
    notifications/        # Notification system
    organizations/        # Org management
    quiz/                 # Quiz engine, analytics, export
    settings/             # Settings forms
  lib/
    auth/                 # better-auth config
    db.ts                 # Prisma client
    fedapay.ts            # FedaPay config
    payments/             # Payment provider
    services/             # Business logic (feature-gate, wallet, billing, etc.)
    utils/                # Shared utilities
prisma/
  schema.prisma           # Database schema
scripts/                  # Seed and migration scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm db:sync` | Push schema to DB |
| `pnpm db:migrate` | Run dev migrations |
| `pnpm db:migrate:deploy` | Run prod migrations |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:reset` | Reset database |

## CI/CD

- **GitHub Actions** — Lint, type-check, and build on every push (`.github/workflows/ci.yml`)
- **Vercel** — Auto-deploy from `main` branch (`vercel.json` with region cdg1)

## License

Private — All rights reserved.
