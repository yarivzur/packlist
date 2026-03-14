# packlist — Project Context for Claude

## What this is
A Next.js 15 travel packing list app. Users create trips, get auto-generated smart checklists tailored to weather, trip type, and baggage mode. Auth via NextAuth (Google). DB via Neon (Postgres) + Drizzle ORM (push workflow, no migrations).

## Key tech
- Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
- NextAuth v5 (`lib/auth.ts`)
- Drizzle ORM — schema in `lib/db/schema.ts`, apply with `npx drizzle-kit push --force`
- next-themes for dark/light/system theme
- Open-Meteo for weather (no API key needed)
- Neon serverless Postgres (production)

## Important conventions
- DB schema changes: always use `npx drizzle-kit push --force` (interactive prompt doesn't work in CI)
- No migration files — push workflow only
- API routes live under `app/api/`; use Zod for request validation
- Client components in `components/`; server components/pages in `app/`
- **Vercel env vars**: always add with `printf 'value' | npx vercel env add KEY production` — never `echo`, which adds a trailing `\n` that breaks secret matching

## Domain structure
```
lib/domain/
  checklists/
    templates.ts       — static item banks (BASE_ITEMS, BUSINESS_ITEMS, etc.)
    rules-engine.ts    — generateChecklist(RulesInput) → GeneratedItem[]
  trips/
    create.ts          — createTrip() orchestrator (weather → visa → checklist)
  visa/
    visa-data.ts       — static visa DB + VWP_COUNTRIES set + getVisaRequirement()
    visa-check.ts      — checkVisa() + visaChecklistItems()
  currency/
    currency-lookup.ts — getCurrencyForCountry(code) → { name, code } | null
  weather/
    open-meteo.ts      — fetchWeather()
  reminders/
    schedule.ts / dispatch.ts
lib/channels/
  conversation-fsm.ts  — shared Telegram/WhatsApp FSM (persisted in bot_sessions)
  telegram/client.ts   — Telegram sendMessage wrapper
  whatsapp/client.ts   — WhatsApp sendMessage wrapper
  interface.ts         — Channel, ConversationState, ConversationData types
```

---

## Milestones & Status

### Completed ✅

**M1 — Foundation**
- Next.js 15 + Tailwind + shadcn/ui scaffolding
- Neon Postgres + Drizzle ORM
- Auth.js v5 with Google OAuth
- App shell: navbar, protected layout

**M2 — Core Web App**
- Trip creation wizard (4–5 steps: type → destination → [passport] → dates → baggage)
- Open-Meteo weather fetch on trip creation
- Checklist rules engine + template seeds
- Checklist page (grouped by category, tap-to-toggle)

**M3 — Reminders**
- Reminder schedule logic (calculate from trip dates + timezone)
- Vercel Cron endpoint + dispatch
- Settings page (timezone)

**A1 — Packing Multiples Engine**
- `quantity` column on `checklist_items`
- Auto-calculated quantities per item type (underwear = days+1, t-shirts = days×0.8, etc.)
- Hot weather and carry-on modifiers
- Rationale text stored in DB and shown in UI

**A2 — Light / Dark / System Theme**
- `next-themes` installed, `ThemeProvider` in layout
- `users.theme` column (default: 'system')
- Theme toggle in Settings auto-persists to DB on click (fire-and-forget)
- Cross-device sync via `useEffect` on settings mount

**A4 — Visa Requirements Module**
- Static visa DB (`lib/domain/visa/visa-data.ts`): 13 nationalities × 50+ destinations
- `VWP_COUNTRIES` set — all 40 VWP members correctly classified as `eta` (ESTA required)
- `checkVisa()` + `visaChecklistItems()` inject priority-1 items into checklist
- Visa status badge on trip detail page (neutral pill + coloured dot: green/yellow/red)
- `users.nationality`, `users.homeCountry` columns; `trips.visa_data_json` column
- Nationality/homeCountry dropdowns in Settings
- Conditional "Passport" step in trip creation wizard (shown only when nationality not set; skippable)

**Visa data accuracy fixes**
- Reclassified all VWP corridors: IL/GB/DE/FR/AU/JP → US now `eta` (ESTA required), not `visa_free`
- Fixed BR → US: `visa_required`; Fixed TR → US: `visa_required`
- VWP fallback rule in `getVisaRequirement()` covers all 40 VWP nationalities automatically

**Checklist quality fixes**
- Removed duplicate "Check visa requirements" generic item from `INTERNATIONAL_ITEMS`
- Removed duplicate "Laptop in accessible part of bag" and "100ml liquids" items (emptied `CARRY_ON_ITEMS`)
- Removed always-appended "Check entry requirements & passport validity" from `visaChecklistItems()`

**A3 — UX Review (applied fixes)**
- Full UX review run against all core flows (report in gitignored `docs/`)
- Delete button on checklist items: always visible on mobile, hover-only on desktop
- Review mode banner: updated copy to "Your list is ready!" + "Start packing! 🎒"

**Currency lookup**
- `lib/domain/currency/currency-lookup.ts`: 80+ countries mapped to currency name + code
- Rules engine personalises "Local currency" item: e.g. "Local currency — US Dollars (USD) or Revolut/Wise"
- Falls back to generic text when destination country is unknown

**M4 — Telegram Bot** *(bot: @RashmatzBot)*
- `telegramLinkTokens` table in schema (token, userId, expiresAt, usedAt) — pushed to Neon
- Account linking: `POST /api/users/telegram/link-token` (15-min one-time token + deep link)
- Account status: `GET /api/users/telegram/status`
- Settings page: "Connect Telegram" button → opens deep link → shows @RashmatzBot + fallback link
- Full conversation FSM (`lib/channels/conversation-fsm.ts`):
  - `/start link_TOKEN` → links account, confirms with ✅
  - `/start` → welcome message
  - `/newtrip` → 4-step guided flow (type → destination → dates → baggage)
  - After trip creation → shows checklist immediately (no intermediate IDLE state)
  - `/checklist:TRIPID` / `refresh:TRIPID` → formatted checklist with quick-check buttons
  - `check:ITEMID` → toggles item done, refreshes view
- Webhook registered at `https://packlist-beta.vercel.app/api/webhooks/telegram`
- **Known infra gotcha**: `packlist-yariv-zurs-projects.vercel.app` has Vercel SSO protection; use `packlist-beta.vercel.app` as the public production URL

---

### Backlog 📋

**A5 — Power Adapter Intelligence**
- Static plug-type lookup by destination country (`lib/domain/power/plug-lookup.ts`)
- `users.homeCountry` (already added) determines native plug type
- Rules engine: if home plug ≠ destination plug → inject "Power adapter (Type G)" into `tech` category
- Voltage difference check → add "Check device voltage compatibility" item
- New files: `lib/domain/power/plug-lookup.ts` + `lib/domain/power/plug-data.json`

**M5 — WhatsApp Channel**
- Meta WhatsApp Cloud API setup + webhook at `/api/webhooks/whatsapp`
- Reuse same conversation state machine (channel-agnostic)
- Reminder dispatch via WhatsApp

**M6 — PWA + Polish**
- `manifest.json`, service worker, install prompt
- Error states + loading skeletons
- Edit trip + regenerate checklist
- README complete with setup instructions

**M7 — TripIt Integration** *(post-MVP)*
- TripIt OAuth flow from Settings
- Import upcoming trips → auto-generate PackList trips + checklists
- Deduplication against manually-entered trips
- New files: `lib/domain/tripit/client.ts`, `lib/domain/tripit/import.ts`
- New env vars: `TRIPIT_CLIENT_ID`, `TRIPIT_CLIENT_SECRET`

---

## Key files
| File | Purpose |
|---|---|
| `lib/db/schema.ts` | Full DB schema (incl. telegramLinkTokens) |
| `lib/domain/checklists/templates.ts` | All static checklist item banks |
| `lib/domain/checklists/rules-engine.ts` | Checklist generation logic + currency personalisation |
| `lib/domain/currency/currency-lookup.ts` | Country → currency mapping (80+ countries) |
| `lib/domain/trips/create.ts` | Trip creation orchestrator |
| `lib/domain/visa/visa-data.ts` | Visa DB + VWP logic |
| `lib/domain/visa/visa-check.ts` | checkVisa() + checklist injection |
| `lib/channels/conversation-fsm.ts` | Telegram/WhatsApp conversation state machine |
| `lib/channels/telegram/client.ts` | Telegram sendMessage API wrapper |
| `components/settings/settings-form.tsx` | Theme + nationality + homeCountry + Telegram connect UI |
| `components/trips/trip-form.tsx` | Multi-step trip creation wizard |
| `app/(app)/trips/[id]/page.tsx` | Trip detail + visa badge |
| `app/api/trips/route.ts` | POST /api/trips |
| `app/api/users/me/route.ts` | PATCH /api/users/me |
| `app/api/users/telegram/link-token/route.ts` | POST — generate Telegram link token |
| `app/api/users/telegram/status/route.ts` | GET — check if Telegram is connected |
| `app/api/webhooks/telegram/route.ts` | Telegram webhook handler |
| `scripts/register-telegram-webhook.ts` | One-time script to register bot webhook |

## Environment variables
```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=RashmatzBot
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
CRON_SECRET=
# Post-MVP:
TRIPIT_CLIENT_ID=
TRIPIT_CLIENT_SECRET=
```
