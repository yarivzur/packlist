# Contributing to PackList

Thanks for your interest in contributing! Here's how to get started.

## Local setup

### Prerequisites
- Node.js 20+
- npm
- A [Neon](https://neon.tech) Postgres database (free tier)
- Google or GitHub OAuth app credentials

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-org/packlist.git
cd packlist

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Push DB schema to your Neon database
npm run db:push

# 5. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project structure

```
app/              Next.js App Router pages and API routes
lib/
  db/             Drizzle schema + Neon connection
  domain/         Core business logic (trips, checklists, reminders, weather)
  channels/       Telegram + WhatsApp channel integrations
  auth.ts         Auth.js configuration
components/       React UI components
```

## Code conventions

- **TypeScript** everywhere — no `any` unless unavoidable
- **Shared domain logic** — bot and web app both use `lib/domain/`, never duplicate logic
- **Env vars only** — no hardcoded secrets or credentials
- **Tests** for domain logic — `lib/domain/**/*.test.ts`

## Running tests

```bash
npm test           # run once
npm run test:watch # watch mode
```

## DB schema changes

```bash
# After editing lib/db/schema.ts:
npm run db:generate   # generate migration files
npm run db:migrate    # apply to your DB
```

## Submitting a PR

1. Fork the repo and create a branch
2. Make your changes
3. Run `npm test` and `npx tsc --noEmit` — both must pass
4. Open a PR with a clear description

## Adding a new auth provider

Auth.js v5 supports dozens of providers. To add one:

1. Add the provider to `lib/auth.ts`
2. Add the required env vars to `.env.example`
3. That's it — no other changes needed

## Adding a new messaging channel

1. Implement `Channel` interface from `lib/channels/interface.ts`
2. Create a webhook handler in `app/api/webhooks/<channel>/route.ts`
3. The shared `conversation-fsm.ts` handles all state logic automatically
