/**
 * Static visa requirements lookup table.
 * Source: publicly available passport index / IATA data.
 *
 * Key: ISO 3166-1 alpha-2 nationality code (passport)
 * Value: Map of destination country code → entry type
 *
 * Entry types:
 *   visa_free      – No visa needed, typically up to 90 days
 *   eta            – Electronic Travel Authorization needed (quick online)
 *   visa_on_arrival – Visa obtainable at the border / airport
 *   visa_required  – Must apply in advance at embassy
 */

export type EntryType = "visa_free" | "eta" | "visa_on_arrival" | "visa_required";

export interface VisaRequirement {
  type: EntryType;
  notes?: string; // e.g. "up to 90 days / 180 days per year", "apply online at gov.uk"
  maxStay?: number; // days
}

// destination → requirement for a given nationality
type DestMap = Record<string, VisaRequirement>;

// nationality → destination map
const visaDb: Record<string, DestMap> = {
  // ── United States (US) ──────────────────────────────────────────────────────
  US: {
    GB: { type: "visa_free", maxStay: 180 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    ES: { type: "visa_free", maxStay: 90 },
    IT: { type: "visa_free", maxStay: 90 },
    NL: { type: "visa_free", maxStay: 90 },
    PT: { type: "visa_free", maxStay: 90 },
    GR: { type: "visa_free", maxStay: 90 },
    CH: { type: "visa_free", maxStay: 90 },
    AT: { type: "visa_free", maxStay: 90 },
    BE: { type: "visa_free", maxStay: 90 },
    SE: { type: "visa_free", maxStay: 90 },
    NO: { type: "visa_free", maxStay: 90 },
    DK: { type: "visa_free", maxStay: 90 },
    FI: { type: "visa_free", maxStay: 90 },
    PL: { type: "visa_free", maxStay: 90 },
    CZ: { type: "visa_free", maxStay: 90 },
    IL: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor (subclass 651) required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "visa_free", maxStay: 180 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    AR: { type: "visa_free", maxStay: 90 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa required, apply online", maxStay: 60 },
    CN: { type: "visa_required", notes: "Apply at Chinese embassy/consulate" },
    RU: { type: "visa_required", notes: "Apply at Russian embassy" },
    UA: { type: "visa_free", maxStay: 90 },
    TR: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival", notes: "Visa on arrival available at airports" },
    TZ: { type: "visa_on_arrival", notes: "Visa on arrival, ~$50" },
    ZA: { type: "visa_free", maxStay: 90 },
    KE: { type: "eta", notes: "eTA required, apply online at etakenya.go.ke" },
    ID: { type: "visa_free", maxStay: 30 },
    VN: { type: "visa_free", notes: "Visa-free for 45 days", maxStay: 45 },
    MY: { type: "visa_free", maxStay: 90 },
    PH: { type: "visa_free", maxStay: 30 },
    IS: { type: "visa_free", maxStay: 90 },
    HR: { type: "visa_free", maxStay: 90 },
    ME: { type: "visa_free", maxStay: 30 },
    RS: { type: "visa_free", maxStay: 30 },
  },

  // ── United Kingdom (GB) ──────────────────────────────────────────────────────
  GB: {
    US: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    ES: { type: "visa_free", maxStay: 90 },
    IT: { type: "visa_free", maxStay: 90 },
    NL: { type: "visa_free", maxStay: 90 },
    PT: { type: "visa_free", maxStay: 90 },
    GR: { type: "visa_free", maxStay: 90 },
    CH: { type: "visa_free", maxStay: 90 },
    AT: { type: "visa_free", maxStay: 90 },
    IL: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    AU: { type: "eta", notes: "eVisitor visa required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required", maxStay: 180 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online", maxStay: 60 },
    CN: { type: "visa_free", notes: "Visa-free for 15 days (2024 arrangement)", maxStay: 15 },
    TR: { type: "eta", notes: "e-Visa available at evisa.gov.tr", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival", notes: "Visa on arrival, ~$25" },
    TZ: { type: "visa_on_arrival", notes: "Visa on arrival, ~$50" },
    ZA: { type: "visa_free", maxStay: 90 },
    KE: { type: "eta", notes: "eTA required" },
    ID: { type: "visa_free", maxStay: 30 },
    VN: { type: "visa_free", maxStay: 45 },
    MY: { type: "visa_free", maxStay: 90 },
    PH: { type: "visa_free", maxStay: 30 },
  },

  // ── Israel (IL) ──────────────────────────────────────────────────────────────
  IL: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    ES: { type: "visa_free", maxStay: 90 },
    IT: { type: "visa_free", maxStay: 90 },
    NL: { type: "visa_free", maxStay: 90 },
    PT: { type: "visa_free", maxStay: 90 },
    GR: { type: "visa_free", maxStay: 90 },
    CH: { type: "visa_free", maxStay: 90 },
    AT: { type: "visa_free", maxStay: 90 },
    SE: { type: "visa_free", maxStay: 90 },
    NO: { type: "visa_free", maxStay: 90 },
    DK: { type: "visa_free", maxStay: 90 },
    FI: { type: "visa_free", maxStay: 90 },
    PL: { type: "visa_free", maxStay: 90 },
    CZ: { type: "visa_free", maxStay: 90 },
    HR: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    AU: { type: "eta", notes: "eVisitor visa required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required", maxStay: 180 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online", maxStay: 60 },
    CN: { type: "visa_required", notes: "Apply at Chinese embassy" },
    TR: { type: "visa_on_arrival", notes: "Visa on arrival available" },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", notes: "Normalization agreement (2020)", maxStay: 90 },
    TZ: { type: "visa_on_arrival", notes: "Visa on arrival" },
    ZA: { type: "visa_free", maxStay: 90 },
    KE: { type: "eta", notes: "eTA required" },
    ID: { type: "visa_on_arrival", notes: "Visa on arrival for 30 days" },
    VN: { type: "visa_free", maxStay: 45 },
    MY: { type: "visa_free", maxStay: 90 },
    PH: { type: "visa_free", maxStay: 30 },
    RS: { type: "visa_free", maxStay: 30 },
    ME: { type: "visa_free", maxStay: 30 },
    AL: { type: "visa_free", maxStay: 30 },
    IS: { type: "visa_free", maxStay: 90 },
    RU: { type: "visa_required", notes: "Currently suspended / not recommended" },
    UA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival", notes: "Sinai only visa-free; full Egypt needs visa" },
    JO: { type: "visa_on_arrival", notes: "Visa on arrival at border crossings" },
    // Arab league countries generally require visa for IL passport holders
    SA: { type: "visa_required" },
    QA: { type: "visa_free", notes: "Normalization (2020)", maxStay: 30 },
    BH: { type: "visa_free", notes: "Normalization (2020)", maxStay: 30 },
    // EU catch-all handled below
  },

  // ── Germany (DE) ─────────────────────────────────────────────────────────────
  DE: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online" },
    CN: { type: "visa_free", notes: "Visa-free 15 days (2024)", maxStay: 15 },
    TR: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    SG: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival" },
    ZA: { type: "visa_free", maxStay: 90 },
    ID: { type: "visa_free", maxStay: 30 },
    VN: { type: "visa_free", maxStay: 45 },
    MY: { type: "visa_free", maxStay: 90 },
    IL: { type: "visa_free", maxStay: 90 },
  },

  // ── France (FR) ──────────────────────────────────────────────────────────────
  FR: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online" },
    CN: { type: "visa_free", notes: "Visa-free 15 days (2024)", maxStay: 15 },
    TR: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival" },
    ZA: { type: "visa_free", maxStay: 90 },
    IL: { type: "visa_free", maxStay: 90 },
    VN: { type: "visa_free", maxStay: 45 },
    ID: { type: "visa_free", maxStay: 30 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
  },

  // ── Canada (CA) ──────────────────────────────────────────────────────────────
  CA: {
    US: { type: "visa_free", maxStay: 180 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    ES: { type: "visa_free", maxStay: 90 },
    IT: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online" },
    CN: { type: "visa_required" },
    TR: { type: "eta", notes: "e-Visa available at evisa.gov.tr" },
    AE: { type: "visa_free", maxStay: 30 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival" },
    ZA: { type: "visa_free", maxStay: 90 },
    IL: { type: "visa_free", maxStay: 90 },
    VN: { type: "visa_free", maxStay: 45 },
    ID: { type: "visa_free", maxStay: 30 },
    MY: { type: "visa_free", maxStay: 90 },
  },

  // ── Australia (AU) ───────────────────────────────────────────────────────────
  AU: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    NZ: { type: "visa_free", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available online" },
    CN: { type: "visa_required" },
    TR: { type: "eta", notes: "e-Visa required" },
    AE: { type: "visa_free", maxStay: 30 },
    IL: { type: "visa_free", maxStay: 90 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival" },
    ZA: { type: "visa_free", maxStay: 90 },
    ID: { type: "visa_free", maxStay: 30 },
    VN: { type: "visa_free", maxStay: 45 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
  },

  // ── India (IN) ───────────────────────────────────────────────────────────────
  IN: {
    TH: { type: "visa_on_arrival", notes: "Visa on arrival, 15 days" },
    SG: { type: "visa_free", notes: "Visa-free 30 days (2024)", maxStay: 30 },
    ID: { type: "visa_free", maxStay: 30 },
    MY: { type: "visa_free", maxStay: 30 },
    VN: { type: "visa_free", maxStay: 45 },
    JP: { type: "visa_required" },
    KR: { type: "visa_on_arrival", notes: "K-ETA or visa on arrival for some ports" },
    AE: { type: "visa_on_arrival", notes: "Visa on arrival at UAE airports" },
    TZ: { type: "visa_on_arrival" },
    KE: { type: "eta", notes: "eTA required" },
    ZA: { type: "visa_required" },
    MA: { type: "visa_required" },
    US: { type: "visa_required", notes: "B1/B2 tourist visa required" },
    GB: { type: "visa_required" },
    CA: { type: "visa_required" },
    AU: { type: "visa_required" },
    FR: { type: "visa_required" },
    DE: { type: "visa_required" },
    IT: { type: "visa_required" },
    TR: { type: "eta", notes: "e-Visa available online" },
    EG: { type: "visa_on_arrival" },
    JO: { type: "visa_on_arrival" },
    QA: { type: "visa_on_arrival" },
    BH: { type: "visa_free", maxStay: 14 },
    OM: { type: "visa_on_arrival" },
  },

  // ── China (CN) ───────────────────────────────────────────────────────────────
  CN: {
    TH: { type: "visa_free", notes: "Mutual visa exemption (2024)", maxStay: 30 },
    SG: { type: "visa_free", notes: "Mutual visa exemption (2024)", maxStay: 30 },
    MY: { type: "visa_free", maxStay: 30 },
    ID: { type: "visa_free", maxStay: 30 },
    JP: { type: "visa_required" },
    KR: { type: "visa_free", notes: "Mutual exemption for short visits", maxStay: 15 },
    AE: { type: "visa_free", maxStay: 30 },
    US: { type: "visa_required", notes: "B1/B2 visa required" },
    GB: { type: "visa_free", notes: "Visa-free 6 months (2024)", maxStay: 180 },
    FR: { type: "visa_free", notes: "Visa-free 15 days (2024)", maxStay: 15 },
    DE: { type: "visa_free", notes: "Visa-free 15 days (2024)", maxStay: 15 },
    AU: { type: "visa_required" },
    CA: { type: "visa_required" },
    TZ: { type: "visa_on_arrival" },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_free", maxStay: 30 },
    ZA: { type: "visa_required" },
  },

  // ── Brazil (BR) ──────────────────────────────────────────────────────────────
  BR: {
    US: { type: "visa_free", notes: "Visa-free since 2024", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    ES: { type: "visa_free", maxStay: 90 },
    IT: { type: "visa_free", maxStay: 90 },
    PT: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    AU: { type: "visa_required" },
    CA: { type: "eta", notes: "eTA required" },
    MX: { type: "visa_free", maxStay: 180 },
    AR: { type: "visa_free" },
    TH: { type: "visa_free", maxStay: 30 },
    AE: { type: "visa_free", maxStay: 30 },
    TR: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    ZA: { type: "visa_free", maxStay: 30 },
    IL: { type: "visa_free", maxStay: 90 },
  },

  // ── Japan (JP) ───────────────────────────────────────────────────────────────
  JP: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    AU: { type: "visa_free", maxStay: 90 },
    CA: { type: "visa_free", maxStay: 90 },
    NZ: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    TH: { type: "visa_free", maxStay: 30 },
    IL: { type: "visa_free", maxStay: 90 },
    CN: { type: "visa_free", notes: "Visa-free since 2024", maxStay: 15 },
    IN: { type: "visa_required" },
    TR: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    ZA: { type: "visa_free", maxStay: 30 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
  },

  // ── South Africa (ZA) ────────────────────────────────────────────────────────
  ZA: {
    US: { type: "visa_required" },
    GB: { type: "visa_required" },
    FR: { type: "visa_required" },
    DE: { type: "visa_required" },
    AU: { type: "visa_required" },
    CA: { type: "visa_required" },
    TH: { type: "visa_free", maxStay: 30 },
    SG: { type: "visa_free", maxStay: 30 },
    MY: { type: "visa_free", maxStay: 30 },
    ID: { type: "visa_free", maxStay: 30 },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 30 },
    TZ: { type: "visa_on_arrival" },
    KE: { type: "eta", notes: "eTA required" },
    AE: { type: "visa_on_arrival" },
    EG: { type: "visa_on_arrival" },
    MA: { type: "visa_required" },
    TR: { type: "visa_free", maxStay: 30 },
  },

  // ── Turkey (TR) ──────────────────────────────────────────────────────────────
  TR: {
    US: { type: "visa_free", maxStay: 90 },
    GB: { type: "eta", notes: "e-Visa required", maxStay: 30 },
    DE: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    NL: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    TH: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "e-Visa required" },
    CA: { type: "eta", notes: "e-Visa required" },
    RU: { type: "visa_free", maxStay: 60 },
  },
};

/**
 * Countries that are part of the Schengen Area.
 * Travel within Schengen counts as a single zone (90 days / 180 days total).
 */
export const SCHENGEN: Set<string> = new Set([
  "AT", "BE", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IT",
  "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "SK", "SI", "ES",
  "SE", "CH",
]);

/**
 * EU nationalities (Schengen + other EU) — all have visa-free access to each other.
 */
export const EU_NATIONALITIES: Set<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

export function getVisaRequirement(
  nationality: string,
  destinationCountry: string
): VisaRequirement {
  // Same country — no visa needed
  if (nationality === destinationCountry) {
    return { type: "visa_free" };
  }

  // EU/Schengen internal travel — all visa-free
  if (EU_NATIONALITIES.has(nationality) && SCHENGEN.has(destinationCountry)) {
    return { type: "visa_free", notes: "EU citizen, no visa needed" };
  }
  if (SCHENGEN.has(nationality) && EU_NATIONALITIES.has(destinationCountry)) {
    return { type: "visa_free", notes: "Schengen area travel" };
  }

  // Look up in database
  const nationalityData = visaDb[nationality];
  if (nationalityData) {
    const req = nationalityData[destinationCountry];
    if (req) return req;
  }

  // Fallback: if destination is Schengen and we don't have data → probably requires Schengen visa
  if (SCHENGEN.has(destinationCountry)) {
    return { type: "visa_required", notes: "Schengen visa likely required — verify at official embassy" };
  }

  // Unknown — recommend checking
  return { type: "visa_required", notes: "Requirements unknown — verify at official embassy or travel.state.gov" };
}
