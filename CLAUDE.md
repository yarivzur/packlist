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

## Roadmap & Status

### Completed ✅

**A1 — Core trip + checklist MVP**
- Trip creation wizard (4–5 steps), weather-aware checklist generation
- Drizzle schema: users, trips, checklist_items, reminders

**A2 — Theme persistence**
- Dark/light/system toggle in Settings auto-persists to DB on click
- Cross-device sync via `useEffect` on settings mount
- `users.theme` column (default: 'system')

**A3 — Timezone-aware reminders** *(status unknown — check git log)*

**A4 — Visa requirements**
- Static visa DB (`lib/domain/visa/visa-data.ts`): 13 nationalities × 50+ destinations
- VWP_COUNTRIES set — all 40 VWP members correctly classified as `eta` (ESTA required)
- `checkVisa()` + `visaChecklistItems()` inject priority-1 items into checklist
- Visa status badge on trip detail page (neutral pill + coloured dot: green/yellow/red)
- `users.nationality`, `users.homeCountry` columns
- `trips.visa_data_json` column
- Nationality/homeCountry dropdowns in Settings
- Conditional "Passport" step (step 3 of 5) in trip creation wizard — shown only when nationality not set; skippable

**Visa data accuracy fixes (latest)**
- Reclassified VWP corridors: IL/GB/DE/FR/AU/JP → US now `eta` (ESTA required)
- Fixed BR → US: was incorrectly `visa_free`, now `visa_required`
- Fixed TR → US: was incorrectly `visa_free`, now `visa_required`
- Added VWP fallback rule in `getVisaRequirement()` for all VWP nationalities

---

### In progress / Known issues 🔧

**Checklist quality issues (reported, not yet fixed)**
1. **Duplicate visa items** — three visa-related items appear for international trips with a known nationality:
   - "Get eTA / e-Visa for US — ESTA required..." (from `visaChecklistItems`, priority 2)
   - "Check entry requirements & passport validity" (from `visaChecklistItems`, always appended, priority 5)
   - A third "Check visa requirements" item — source unknown, needs investigation
   - Fix: remove the always-appended generic item; the specific item is sufficient

2. **Duplicate tech items** — "Laptop" and "Laptop in accessible part of bag" both appear
   - "Laptop" comes from `BUSINESS_ITEMS` in `templates.ts`
   - "Laptop in accessible part of bag" — source unknown (rules engine or carry-on logic?)
   - Fix: deduplicate; keep only one item (either merge the hint into the single item or remove the reminder)

3. **Confusing toiletries item** — "100ml liquids in clear zip bag"
   - Source unknown — not visible in templates.ts; likely injected by rules engine or carry-on logic
   - May be reasonable for carry-on trips but confusing as a packing *item*
   - Fix: either remove, or scope strictly to carry-on trips with a better label

---

### Backlog 📋

**B1 — Reminders / notifications**
- No work started yet
- Design discussion needed: push notifications vs email, timing logic, opt-in UX

**B2 — Trip edit / checklist customisation**
- Users can check off items but cannot add/remove/reorder

**B3 — Sharing / collaboration**
- No design yet

---

## Key files to know
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
