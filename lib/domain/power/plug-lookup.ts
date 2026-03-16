/**
 * Power plug and voltage lookup by country.
 * Used to determine whether a traveler needs a power adapter and/or voltage converter.
 *
 * Plug type codes follow IEC standard naming (A–N).
 * Key types:
 *   A/B  — North America, Japan (110–127 V)
 *   C    — Europlug (fits E and F sockets)
 *   D    — India (old large round pins)
 *   E    — France, Belgium, Poland
 *   F    — Germany/Schuko (most of continental Europe)
 *   G    — UK, Ireland, Hong Kong, Singapore, Malaysia
 *   H    — Israel (Y-shape, but modern sockets also accept C)
 *   I    — Australia, New Zealand, Argentina
 *   J    — Switzerland
 *   K    — Denmark
 *   L    — Italy (inline pins)
 *   M    — South Africa, India (large round)
 *   N    — Brazil (IEC standard)
 */

export interface PlugInfo {
  /** Plug types whose sockets exist in this country */
  plugs: string[];
  /** Nominal mains voltage (V) */
  voltage: number;
}

// ---------------------------------------------------------------------------
// Data table  (ISO 3166-1 alpha-2 → PlugInfo)
// ---------------------------------------------------------------------------
const PLUG_DATA: Record<string, PlugInfo> = {
  // ── North America / Japan ──────────────────────────────────────────────
  US: { plugs: ["A", "B"], voltage: 120 },
  CA: { plugs: ["A", "B"], voltage: 120 },
  MX: { plugs: ["A", "B"], voltage: 127 },
  JP: { plugs: ["A", "B"], voltage: 100 },
  // Central America & Caribbean
  GT: { plugs: ["A", "B"], voltage: 120 },
  HN: { plugs: ["A", "B"], voltage: 120 },
  SV: { plugs: ["A", "B"], voltage: 120 },
  NI: { plugs: ["A", "B"], voltage: 120 },
  CR: { plugs: ["A", "B"], voltage: 120 },
  PA: { plugs: ["A", "B"], voltage: 120 },
  CU: { plugs: ["A", "B"], voltage: 110 },
  DO: { plugs: ["A", "B"], voltage: 110 },
  JM: { plugs: ["A", "B"], voltage: 110 },
  HT: { plugs: ["A", "B"], voltage: 110 },
  TT: { plugs: ["A", "B"], voltage: 115 },
  CO: { plugs: ["A", "B"], voltage: 110 },
  VE: { plugs: ["A", "B"], voltage: 120 },

  // ── Continental Europe (C/E/F Europlug / Schuko, 230 V) ───────────────
  DE: { plugs: ["C", "F"], voltage: 230 },
  ES: { plugs: ["C", "F"], voltage: 230 },
  PT: { plugs: ["C", "F"], voltage: 230 },
  NL: { plugs: ["C", "F"], voltage: 230 },
  AT: { plugs: ["C", "F"], voltage: 230 },
  SE: { plugs: ["C", "F"], voltage: 230 },
  NO: { plugs: ["C", "F"], voltage: 230 },
  FI: { plugs: ["C", "F"], voltage: 230 },
  PL: { plugs: ["C", "E"], voltage: 230 },
  CZ: { plugs: ["C", "E"], voltage: 230 },
  SK: { plugs: ["C", "E"], voltage: 230 },
  HU: { plugs: ["C", "F"], voltage: 230 },
  RO: { plugs: ["C", "F"], voltage: 230 },
  BG: { plugs: ["C", "F"], voltage: 230 },
  HR: { plugs: ["C", "F"], voltage: 230 },
  SI: { plugs: ["C", "F"], voltage: 230 },
  RS: { plugs: ["C", "F"], voltage: 230 },
  BA: { plugs: ["C", "F"], voltage: 230 },
  ME: { plugs: ["C", "F"], voltage: 230 },
  MK: { plugs: ["C", "F"], voltage: 230 },
  AL: { plugs: ["C", "F"], voltage: 230 },
  GR: { plugs: ["C", "F"], voltage: 230 },
  LU: { plugs: ["C", "F"], voltage: 230 },
  BE: { plugs: ["C", "E"], voltage: 230 },
  LT: { plugs: ["C", "F"], voltage: 230 },
  LV: { plugs: ["C", "F"], voltage: 230 },
  EE: { plugs: ["C", "F"], voltage: 230 },
  TR: { plugs: ["C", "F"], voltage: 230 },
  RU: { plugs: ["C", "F"], voltage: 230 },
  UA: { plugs: ["C", "F"], voltage: 230 },
  BY: { plugs: ["C", "F"], voltage: 230 },
  MD: { plugs: ["C", "F"], voltage: 230 },
  GE: { plugs: ["C", "F"], voltage: 220 },
  AM: { plugs: ["C", "F"], voltage: 220 },
  AZ: { plugs: ["C", "F"], voltage: 220 },
  // France uses Type E
  FR: { plugs: ["C", "E"], voltage: 230 },
  // Italy also has Type L in older buildings
  IT: { plugs: ["C", "F", "L"], voltage: 230 },
  // Switzerland uses Type J (but C/F also common)
  CH: { plugs: ["C", "J"], voltage: 230 },
  // Denmark uses Type K (but C/F also accepted)
  DK: { plugs: ["C", "F", "K"], voltage: 230 },
  // Liechtenstein, Andorra, Monaco, San Marino follow their neighbours
  LI: { plugs: ["C", "J"], voltage: 230 },
  MC: { plugs: ["C", "E"], voltage: 230 },
  SM: { plugs: ["C", "F", "L"], voltage: 230 },

  // ── UK-style Type G (230 V) ────────────────────────────────────────────
  GB: { plugs: ["G"], voltage: 230 },
  IE: { plugs: ["G"], voltage: 230 },
  MT: { plugs: ["G"], voltage: 230 },
  CY: { plugs: ["G"], voltage: 240 },
  HK: { plugs: ["G"], voltage: 220 },
  SG: { plugs: ["G"], voltage: 230 },
  MY: { plugs: ["G"], voltage: 240 },
  BN: { plugs: ["G"], voltage: 240 },
  KE: { plugs: ["G"], voltage: 240 },
  TZ: { plugs: ["G"], voltage: 230 },
  UG: { plugs: ["G"], voltage: 240 },
  ZM: { plugs: ["G"], voltage: 230 },
  ZW: { plugs: ["G"], voltage: 240 },
  GH: { plugs: ["D", "G"], voltage: 230 },
  NG: { plugs: ["D", "G"], voltage: 240 },
  MM: { plugs: ["C", "D", "G"], voltage: 230 },

  // ── Israel (Type H + accepts C) ───────────────────────────────────────
  IL: { plugs: ["C", "H"], voltage: 230 },

  // ── Middle East ───────────────────────────────────────────────────────
  // Many GCC countries have both G and C/F sockets
  AE: { plugs: ["C", "G"], voltage: 230 },
  QA: { plugs: ["C", "D", "G"], voltage: 240 },
  BH: { plugs: ["C", "G"], voltage: 230 },
  KW: { plugs: ["C", "G"], voltage: 240 },
  OM: { plugs: ["C", "G"], voltage: 240 },
  SA: { plugs: ["A", "B", "C", "F", "G"], voltage: 230 },
  JO: { plugs: ["B", "C", "D", "F", "G", "J"], voltage: 230 },
  LB: { plugs: ["A", "B", "C", "D"], voltage: 220 },
  EG: { plugs: ["C", "F"], voltage: 220 },
  MA: { plugs: ["C", "E"], voltage: 220 },
  TN: { plugs: ["C", "E"], voltage: 230 },
  DZ: { plugs: ["C", "F"], voltage: 230 },

  // ── South / Southeast Asia ────────────────────────────────────────────
  IN: { plugs: ["D", "M"], voltage: 230 },   // C fits physically but D/M are the actual standard
  PK: { plugs: ["D"], voltage: 230 },         // Type D is the actual standard; C sometimes present
  BD: { plugs: ["D", "G"], voltage: 220 },
  LK: { plugs: ["D", "G", "M"], voltage: 230 },
  NP: { plugs: ["D", "M"], voltage: 230 },    // C sometimes present, D/M are standard
  TH: { plugs: ["A", "B", "C"], voltage: 220 },
  VN: { plugs: ["A", "C", "F"], voltage: 220 },
  ID: { plugs: ["C", "F"], voltage: 230 },
  PH: { plugs: ["A", "B", "C"], voltage: 220 },
  KR: { plugs: ["C", "F"], voltage: 220 },
  CN: { plugs: ["A", "C", "I"], voltage: 220 },
  TW: { plugs: ["A", "B"], voltage: 110 },
  // Southeast Asia
  KH: { plugs: ["A", "C"], voltage: 230 },
  LA: { plugs: ["A", "B", "C"], voltage: 230 },
  MN: { plugs: ["C", "E"], voltage: 230 },

  // ── Oceania ───────────────────────────────────────────────────────────
  AU: { plugs: ["I"], voltage: 230 },
  NZ: { plugs: ["I"], voltage: 230 },

  // ── South America ─────────────────────────────────────────────────────
  BR: { plugs: ["C", "N"], voltage: 127 }, // some regions 220V; 127V is nominal
  AR: { plugs: ["C", "I"], voltage: 220 },
  CL: { plugs: ["C", "L"], voltage: 220 },
  PE: { plugs: ["A", "C"], voltage: 220 },
  EC: { plugs: ["A", "B"], voltage: 120 },
  BO: { plugs: ["A", "C"], voltage: 220 },
  UY: { plugs: ["C", "F", "L"], voltage: 220 },
  PY: { plugs: ["C"], voltage: 220 },

  // ── Africa ────────────────────────────────────────────────────────────
  ZA: { plugs: ["C", "M", "N"], voltage: 230 },
  ET: { plugs: ["C", "E", "L"], voltage: 220 },
  SN: { plugs: ["C", "D", "E", "K"], voltage: 230 },
  CI: { plugs: ["C", "E"], voltage: 220 },
  CM: { plugs: ["C", "E"], voltage: 220 },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getPlugInfo(countryCode: string): PlugInfo | null {
  return PLUG_DATA[countryCode.toUpperCase()] ?? null;
}

/**
 * Determines whether a traveler from `homeCountry` needs a power adapter at `destCountry`.
 *
 * Returns an object with:
 *   - `neededPlugTypes`: destination plug types the traveler needs to adapt to (empty if no adapter needed)
 *   - `voltageWarning`: true if destination voltage differs significantly from home (>50 V)
 *
 * Returns null if either country is not in our database.
 */
export function getAdapterInfo(
  homeCountry: string,
  destCountry: string
): { neededPlugTypes: string[]; voltageWarning: boolean } | null {
  const home = getPlugInfo(homeCountry);
  const dest = getPlugInfo(destCountry);
  if (!home || !dest) return null;

  const adapterNeeded = !hasCompatiblePlug(home.plugs, dest.plugs);
  const voltageWarning = Math.abs(home.voltage - dest.voltage) > 50;

  if (!adapterNeeded && !voltageWarning) return null;

  const neededPlugTypes = adapterNeeded ? selectPrimaryPlugTypes(dest.plugs) : [];
  return { neededPlugTypes, voltageWarning };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if at least one home plug type is accepted at the destination.
 *
 * Compatibility rules applied:
 *   - Type C (Europlug) fits in E and F sockets
 *   - Type B sockets accept Type A plugs
 */
function hasCompatiblePlug(homePlugs: string[], destPlugs: string[]): boolean {
  const accepted = new Set(destPlugs);
  // E and F sockets accept the smaller C (Europlug)
  if (destPlugs.includes("E") || destPlugs.includes("F")) accepted.add("C");
  // B sockets also accept A-style plugs
  if (destPlugs.includes("B")) accepted.add("A");

  for (const p of homePlugs) {
    if (accepted.has(p)) return true;
  }
  return false;
}

/**
 * From a list of destination plug types, returns the 1–2 most distinctive ones
 * to display in the adapter item text.
 * Unusual/specialised types (G, H, I, J, K, L, M) are shown first.
 */
function selectPrimaryPlugTypes(plugs: string[]): string[] {
  const priority = ["G", "H", "I", "J", "K", "L", "M", "D", "N", "A", "B", "C", "E", "F"];
  return [...plugs]
    .sort((a, b) => priority.indexOf(a) - priority.indexOf(b))
    .slice(0, 2);
}
