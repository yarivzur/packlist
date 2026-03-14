/**
 * Maps ISO 3166-1 alpha-2 country codes to their primary currency.
 * Used to personalise the "Local currency" checklist item.
 */

export interface CurrencyInfo {
  name: string;
  code: string;
}

const CURRENCY_BY_COUNTRY: Record<string, CurrencyInfo> = {
  // Americas
  US: { name: "US Dollars",           code: "USD" },
  CA: { name: "Canadian Dollars",      code: "CAD" },
  MX: { name: "Mexican Pesos",         code: "MXN" },
  BR: { name: "Brazilian Reais",       code: "BRL" },
  AR: { name: "Argentine Pesos",       code: "ARS" },
  CO: { name: "Colombian Pesos",       code: "COP" },
  PE: { name: "Peruvian Soles",        code: "PEN" },
  CL: { name: "Chilean Pesos",         code: "CLP" },
  UY: { name: "Uruguayan Pesos",       code: "UYU" },
  VE: { name: "Venezuelan Bolívars",   code: "VES" },
  DO: { name: "Dominican Pesos",       code: "DOP" },
  JM: { name: "Jamaican Dollars",      code: "JMD" },
  GT: { name: "Guatemalan Quetzals",   code: "GTQ" },
  CR: { name: "Costa Rican Colones",   code: "CRC" },
  PA: { name: "Panamanian Balboas",    code: "PAB" },
  CU: { name: "Cuban Pesos",           code: "CUP" },

  // Europe — Eurozone
  DE: { name: "Euros",                 code: "EUR" },
  FR: { name: "Euros",                 code: "EUR" },
  IT: { name: "Euros",                 code: "EUR" },
  ES: { name: "Euros",                 code: "EUR" },
  PT: { name: "Euros",                 code: "EUR" },
  NL: { name: "Euros",                 code: "EUR" },
  BE: { name: "Euros",                 code: "EUR" },
  AT: { name: "Euros",                 code: "EUR" },
  GR: { name: "Euros",                 code: "EUR" },
  FI: { name: "Euros",                 code: "EUR" },
  IE: { name: "Euros",                 code: "EUR" },
  LU: { name: "Euros",                 code: "EUR" },
  SK: { name: "Euros",                 code: "EUR" },
  SI: { name: "Euros",                 code: "EUR" },
  EE: { name: "Euros",                 code: "EUR" },
  LV: { name: "Euros",                 code: "EUR" },
  LT: { name: "Euros",                 code: "EUR" },
  CY: { name: "Euros",                 code: "EUR" },
  MT: { name: "Euros",                 code: "EUR" },
  HR: { name: "Euros",                 code: "EUR" },

  // Europe — non-Euro
  GB: { name: "British Pounds",        code: "GBP" },
  CH: { name: "Swiss Francs",          code: "CHF" },
  SE: { name: "Swedish Kronor",        code: "SEK" },
  NO: { name: "Norwegian Kroner",      code: "NOK" },
  DK: { name: "Danish Kroner",         code: "DKK" },
  PL: { name: "Polish Zlotys",         code: "PLN" },
  CZ: { name: "Czech Korunas",         code: "CZK" },
  HU: { name: "Hungarian Forints",     code: "HUF" },
  RO: { name: "Romanian Lei",          code: "RON" },
  BG: { name: "Bulgarian Leva",        code: "BGN" },
  RS: { name: "Serbian Dinars",        code: "RSD" },
  IS: { name: "Icelandic Kronur",      code: "ISK" },
  UA: { name: "Ukrainian Hryvnias",    code: "UAH" },
  RU: { name: "Russian Rubles",        code: "RUB" },
  TR: { name: "Turkish Liras",         code: "TRY" },

  // Asia Pacific
  JP: { name: "Japanese Yen",          code: "JPY" },
  CN: { name: "Chinese Yuan",          code: "CNY" },
  KR: { name: "South Korean Won",      code: "KRW" },
  IN: { name: "Indian Rupees",         code: "INR" },
  AU: { name: "Australian Dollars",    code: "AUD" },
  NZ: { name: "New Zealand Dollars",   code: "NZD" },
  SG: { name: "Singapore Dollars",     code: "SGD" },
  HK: { name: "Hong Kong Dollars",     code: "HKD" },
  TW: { name: "New Taiwan Dollars",    code: "TWD" },
  TH: { name: "Thai Baht",             code: "THB" },
  ID: { name: "Indonesian Rupiahs",    code: "IDR" },
  MY: { name: "Malaysian Ringgits",    code: "MYR" },
  PH: { name: "Philippine Pesos",      code: "PHP" },
  VN: { name: "Vietnamese Dong",       code: "VND" },
  PK: { name: "Pakistani Rupees",      code: "PKR" },
  BD: { name: "Bangladeshi Takas",     code: "BDT" },
  LK: { name: "Sri Lankan Rupees",     code: "LKR" },
  NP: { name: "Nepalese Rupees",       code: "NPR" },
  KH: { name: "Cambodian Riels",       code: "KHR" },
  MM: { name: "Myanmar Kyats",         code: "MMK" },

  // Middle East
  AE: { name: "UAE Dirhams",           code: "AED" },
  SA: { name: "Saudi Riyals",          code: "SAR" },
  IL: { name: "Israeli Shekels",       code: "ILS" },
  EG: { name: "Egyptian Pounds",       code: "EGP" },
  JO: { name: "Jordanian Dinars",      code: "JOD" },
  QA: { name: "Qatari Riyals",         code: "QAR" },
  KW: { name: "Kuwaiti Dinars",        code: "KWD" },
  BH: { name: "Bahraini Dinars",       code: "BHD" },
  OM: { name: "Omani Rials",           code: "OMR" },
  IR: { name: "Iranian Rials",         code: "IRR" },
  IQ: { name: "Iraqi Dinars",          code: "IQD" },

  // Africa
  ZA: { name: "South African Rand",    code: "ZAR" },
  KE: { name: "Kenyan Shillings",      code: "KES" },
  NG: { name: "Nigerian Nairas",       code: "NGN" },
  GH: { name: "Ghanaian Cedis",        code: "GHS" },
  MA: { name: "Moroccan Dirhams",      code: "MAD" },
  TN: { name: "Tunisian Dinars",       code: "TND" },
  ET: { name: "Ethiopian Birrs",       code: "ETB" },
  TZ: { name: "Tanzanian Shillings",   code: "TZS" },
  UG: { name: "Ugandan Shillings",     code: "UGX" },
  RW: { name: "Rwandan Francs",        code: "RWF" },
  DZ: { name: "Algerian Dinars",       code: "DZD" },
  SN: { name: "West African CFA Francs", code: "XOF" },
  CM: { name: "Central African CFA Francs", code: "XAF" },
};

/**
 * Returns the primary currency for the given ISO country code,
 * or null if the country is not in the lookup.
 */
export function getCurrencyForCountry(countryCode: string): CurrencyInfo | null {
  return CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] ?? null;
}
