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
  weather/
    open-meteo.ts      — fetchWeather()
  reminders/
    schedule.ts / dispatch.ts
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
- Fixed BR → US: `visa_required` (was incorrectly `visa_free`)
- Fixed TR → US: `visa_required` (was incorrectly `visa_free`)
- VWP fallback rule in `getVisaRequirement()` covers all 40 VWP nationalities automatically

---

### In Progress / Known Issues 🔧

**Checklist quality issues (reported, not yet fixed)**
1. **Duplicate visa items** — three visa-related items appear for international trips:
   - "Get eTA / e-Visa for US — ESTA required..." (`visaChecklistItems`, priority 2)
   - "Check entry requirements & passport validity" (always appended in `visaChecklistItems`, priority 5)
   - A third "Check visa requirements" item — source unknown, investigate
   - Fix: remove the always-appended generic item; the specific action item is sufficient

2. **Duplicate tech items** — "Laptop" and "Laptop in accessible part of bag" both appear
   - "Laptop" comes from `BUSINESS_ITEMS` in `templates.ts`
   - "Laptop in accessible part of bag" — source unknown (carry-on logic?)
   - Fix: merge hint into single item or remove the redundant reminder

3. **Confusing toiletries item** — "100ml liquids in clear zip bag"
   - Source unknown — not in `templates.ts`; likely injected by rules engine or carry-on logic
   - May be reasonable for carry-on trips but poorly worded as a packing item
   - Fix: remove, or scope strictly to carry-on with a better label like "Pack liquids in 100ml containers (carry-on rule)"

---

### Backlog 📋

**A3 — UX Researcher Persona Validation Gate** *(post-M4)*
- Walk through each core user flow using a UX Researcher persona
- Produce `docs/ux-validation-report.md` (UX score per flow, top 3 friction points, fixes)
- Apply copy/interaction fixes from the report

**A5 — Power Adapter Intelligence**
- Static plug-type lookup by destination country (`lib/domain/power/plug-lookup.ts`)
- `users.homeCountry` (already added) determines native plug type
- Rules engine: if home plug ≠ destination plug → inject "Power adapter (Type G)" into `tech` category
- Voltage difference check → add "Check device voltage compatibility" item
- New files: `lib/domain/power/plug-lookup.ts` + `lib/domain/power/plug-data.json`

**M4 — Telegram Bot**
- Telegram Bot setup + webhook at `/api/webhooks/telegram`
- `bot_sessions` table + conversation state machine (already in schema)
- Full `/newtrip` guided flow via bot
- Toggle checklist items and view reminders via bot commands

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
| `lib/db/schema.ts` | Full DB schema |
| `lib/domain/checklists/templates.ts` | All static checklist item banks |
| `lib/domain/checklists/rules-engine.ts` | Checklist generation logic |
| `lib/domain/trips/create.ts` | Trip creation orchestrator |
| `lib/domain/visa/visa-data.ts` | Visa DB + VWP logic |
| `lib/domain/visa/visa-check.ts` | checkVisa() + checklist injection |
| `components/settings/settings-form.tsx` | Theme + nationality + homeCountry UI |
| `components/trips/trip-form.tsx` | Multi-step trip creation wizard |
| `app/(app)/trips/[id]/page.tsx` | Trip detail + visa badge |
| `app/api/trips/route.ts` | POST /api/trips |
| `app/api/users/me/route.ts` | PATCH /api/users/me |

## Environment variables
```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
CRON_SECRET=
# Post-MVP:
TRIPIT_CLIENT_ID=
TRIPIT_CLIENT_SECRET=
```
