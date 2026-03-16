# PackList

Smart travel packing lists, auto-generated for your destination, the weather, and how you travel.

**Production**: [app.packlist.be](https://app.packlist.be) · **Landing**: [www.packlist.be](https://www.packlist.be)

---

## Tech stack

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Auth.js v5** — Google OAuth
- **Drizzle ORM** + **Neon** (serverless Postgres) — push workflow, no migration files
- **Open-Meteo** — weather forecasts (no API key required)
- **Telegram Bot API** + **WhatsApp Cloud API** — bot channels

---

## Local development

### 1. Prerequisites

- Node.js ≥ 20
- A Neon project (free tier works): [neon.tech](https://neon.tech)
- A Google OAuth app: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

### 2. Clone & install

```bash
git clone https://github.com/your-org/packlist.git
cd packlist
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon connection string (pooled) |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | Full app URL, e.g. `http://localhost:3000` |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) — optional for local |
| `TELEGRAM_WEBHOOK_SECRET` | Any random string — optional for local |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Your bot's username, e.g. `PackListBeBot` |
| `WHATSAPP_ACCESS_TOKEN` | Meta Cloud API token — optional for local |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID — optional for local |
| `WHATSAPP_VERIFY_TOKEN` | Any random string — optional for local |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | WA number in intl format, e.g. `15551420930` |
| `CRON_SECRET` | Secret to protect the cron endpoint |

**Google OAuth redirect URI** — add to your Google Cloud credential:
```
http://localhost:3000/api/auth/callback/google
```

### 4. Push DB schema

```bash
npx drizzle-kit push --force
```

This creates all tables in your Neon database. No migration files are used.

### 5. Run dev server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Bot setup (optional)

### Telegram

1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the token to `TELEGRAM_BOT_TOKEN`.
2. For local testing, use [ngrok](https://ngrok.com) to expose `localhost:3000`.
3. Register the webhook:

```bash
npx tsx scripts/register-telegram-webhook.ts
```

### WhatsApp

1. Create a Meta app at [developers.facebook.com](https://developers.facebook.com), add WhatsApp.
2. Set up a test phone number, copy the access token and phone number ID.
3. Register the webhook URL in the Meta dashboard: `https://your-domain/api/webhooks/whatsapp`.

---

## Deploying to Vercel

1. Push to GitHub and import into [Vercel](https://vercel.com).
2. Add all env vars — **use `printf` not `echo`** to avoid trailing newlines:
   ```bash
   printf 'value' | npx vercel env add KEY production
   ```
3. Set `AUTH_URL` to your production app URL.
4. Add the production URL to Google OAuth's allowed redirect URIs.

---

## Key files

| File | Purpose |
|---|---|
| `lib/db/schema.ts` | Full DB schema |
| `lib/domain/checklists/rules-engine.ts` | Checklist generation logic |
| `lib/domain/checklists/templates.ts` | Static item banks |
| `lib/domain/trips/create.ts` | Trip creation orchestrator |
| `lib/domain/visa/visa-data.ts` | Visa DB + VWP logic |
| `lib/channels/conversation-fsm.ts` | Shared Telegram/WhatsApp FSM |
| `app/api/trips/route.ts` | POST /api/trips |
| `app/api/webhooks/telegram/route.ts` | Telegram webhook handler |
| `app/api/webhooks/whatsapp/route.ts` | WhatsApp webhook handler |
| `app/api/cron/send-reminders/route.ts` | Cron job — reminders + retro prompts |

---

## DB schema changes

Always use:

```bash
npx drizzle-kit push --force
```

Never create migration files — this project uses the push workflow only.
