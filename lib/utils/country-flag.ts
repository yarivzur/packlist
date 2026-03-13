/**
 * Converts an ISO 3166-1 alpha-2 country code to its flag emoji.
 * Works by mapping each letter to a Unicode Regional Indicator Symbol.
 * e.g. "ES" → "🇪🇸", "JP" → "🇯🇵", "US" → "🇺🇸"
 */
export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "";
  return Array.from(code.toUpperCase())
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join("");
}
