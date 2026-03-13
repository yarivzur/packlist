/**
 * Static visa requirements lookup table.
 * Source: publicly available passport index / IATA data.
 *
 * Key: ISO 3166-1 alpha-2 nationality code (passport)
 * Value: Map of destination country code → entry type
 *
 * Entry types:
 *   visa_free      – No visa needed at all, no online application required
 *   eta            – Electronic Travel Authorization needed before departure (quick online)
 *                    Includes ESTA (US), eVisitor (AU), NZeTA (NZ), eTA (CA), etc.
 *   visa_on_arrival – Visa obtainable at the border / airport
 *   visa_required  – Must apply in advance at embassy
 *
 * IMPORTANT: "Visa-free" ≠ "no paperwork required".
 *   Many countries require an eTA/ESTA even for visa-waiver travellers.
 *   Always use `eta` for those corridors, not `visa_free`.
 */

export type EntryType = "visa_free" | "eta" | "visa_on_arrival" | "visa_required";

export interface VisaRequirement {
  type: EntryType;
  notes?: string; // e.g. "ESTA required — apply at esta.cbp.dhs.gov"
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
    IN: { type: "eta", notes: "e-Visa required, apply at indianvisaonline.gov.in", maxStay: 60 },
    CN: { type: "visa_required", notes: "Apply at Chinese embassy/consulate" },
    RU: { type: "visa_required", notes: "Apply at Russian embassy" },
    UA: { type: "visa_free", maxStay: 90 },
    TR: { type: "visa_free", maxStay: 90 },
    AE: { type: "visa_free", maxStay: 30 },
    MA: { type: "visa_free", maxStay: 90 },
    EG: { type: "visa_on_arrival", notes: "Visa on arrival available at airports" },
    TZ: { type: "visa_on_arrival", notes: "Visa on arrival, ~$50" },
    ZA: { type: "visa_free", maxStay: 90 },
    KE: { type: "eta", notes: "eTA required, apply at etakenya.go.ke" },
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
    // UK is in the US Visa Waiver Program — ESTA required before departure
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
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
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in", maxStay: 60 },
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
    // Israel joined the US Visa Waiver Program in September 2023 — ESTA required
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
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
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in", maxStay: 60 },
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
    // Germany is in the US Visa Waiver Program — ESTA required
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    MX: { type: "visa_free", maxStay: 180 },
    BR: { type: "visa_free", maxStay: 90 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in" },
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
    // France is in the US Visa Waiver Program — ESTA required
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    AU: { type: "eta", notes: "eVisitor required", maxStay: 90 },
    NZ: { type: "eta", notes: "NZeTA required", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in" },
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
    // Canadian citizens are NOT in the VWP — they can enter the US visa-free without ESTA
    // (special bilateral arrangement; applies to air, land, and sea crossings)
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
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in" },
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
    // Australia is in the US Visa Waiver Program — ESTA required
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
    GB: { type: "visa_free", maxStay: 90 },
    FR: { type: "visa_free", maxStay: 90 },
    DE: { type: "visa_free", maxStay: 90 },
    JP: { type: "visa_free", maxStay: 90 },
    KR: { type: "visa_free", maxStay: 90 },
    SG: { type: "visa_free", maxStay: 30 },
    NZ: { type: "visa_free", maxStay: 90 },
    CA: { type: "eta", notes: "eTA required" },
    TH: { type: "visa_free", maxStay: 30 },
    IN: { type: "eta", notes: "e-Visa available at indianvisaonline.gov.in" },
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
    TR: { type: "eta", notes: "e-Visa available at evisa.gov.tr" },
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
    // Note: Brazil is NOT in the US Visa Waiver Program. A B1/B2 visa is required.
    US: { type: "visa_required", notes: "B1/B2 tourist visa required — apply at travel.state.gov" },
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
    // Japan is in the US Visa Waiver Program — ESTA required
    US: { type: "eta", notes: "ESTA required — apply at esta.cbp.dhs.gov", maxStay: 90 },
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
    // Turkey is NOT in the US Visa Waiver Program — B1/B2 visa required
    US: { type: "visa_required", notes: "B1/B2 visa required — apply at travel.state.gov" },
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

/**
 * Countries in the US Visa Waiver Program (VWP).
 *
 * Citizens of these countries can enter the US for up to 90 days without a
 * traditional visa, but MUST obtain ESTA (Electronic System for Travel
 * Authorization) BEFORE departure. ESTA ≠ visa-free.
 *
 * Note: Canada and Bermuda are NOT in the VWP but also don't require a visa or
 * ESTA — they have separate bilateral arrangements.
 *
 * Source: https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html
 */
export const VWP_COUNTRIES: Set<string> = new Set([
  "AD", // Andorra
  "AU", // Australia
  "AT", // Austria
  "BE", // Belgium
  "BN", // Brunei
  "CL", // Chile
  "HR", // Croatia
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IS", // Iceland
  "IE", // Ireland
  "IT", // Italy
  "JP", // Japan
  "LV", // Latvia
  "LI", // Liechtenstein
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "MC", // Monaco
  "NL", // Netherlands
  "NZ", // New Zealand
  "NO", // Norway
  "PL", // Poland
  "PT", // Portugal
  "SM", // San Marino
  "SG", // Singapore
  "SK", // Slovakia
  "SI", // Slovenia
  "KR", // South Korea
  "ES", // Spain
  "SE", // Sweden
  "CH", // Switzerland
  "TW", // Taiwan
  "GB", // United Kingdom
  "IL", // Israel (added September 2023)
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

  // Visa Waiver Program: these nationalities can enter the US without a visa,
  // but ESTA is required BEFORE departure. This is NOT truly "visa-free".
  if (destinationCountry === "US" && VWP_COUNTRIES.has(nationality)) {
    return {
      type: "eta",
      notes: "ESTA required — apply at esta.cbp.dhs.gov before departure",
      maxStay: 90,
    };
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
