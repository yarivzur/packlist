import type { WeatherData } from "@/lib/domain/weather/open-meteo";
import { visaChecklistItems, type VisaCheckResult } from "@/lib/domain/visa/visa-check";
import { getCurrencyForCountry } from "@/lib/domain/currency/currency-lookup";
import { getAdapterInfo } from "@/lib/domain/power/plug-lookup";
import type { UserPackingHistory } from "@/lib/domain/retro/retro";
import {
  BASE_ITEMS,
  INTERNATIONAL_ITEMS,
  BUSINESS_ITEMS,
  RAIN_ITEMS,
  COLD_ITEMS,
  HOT_ITEMS,
  CARRY_ON_ITEMS,
  HEALTH_ITEMS,
  type TemplateItem,
  type ChecklistCategory,
} from "./templates";

export interface RulesInput {
  tripType: "business" | "leisure" | "mixed";
  durationDays: number;
  isInternational: boolean;
  baggage: "carry-on" | "checked" | "unknown";
  weather: WeatherData | null;
  destination?: string;
  /** ISO 3166-1 alpha-2 country code for the destination (used for currency lookup, etc.) */
  destinationCountry?: string | null;
  /** Pre-computed visa check result to inject items (optional) */
  visaResult?: VisaCheckResult | null;
  /** User's home country (ISO 3166-1 alpha-2). Used for power adapter check. */
  userHomeCountry?: string | null;
  /** Packing history for personalisation — flags often-skipped items. */
  userHistory?: UserPackingHistory | null;
}

export interface GeneratedItem {
  text: string;
  category: ChecklistCategory;
  priority: number;
  sourceRule: string;
  quantity: number;
  rationale: string | null;
  /** True when this item has been consistently skipped on past trips of the same type. */
  oftenSkipped?: boolean;
}

const RAIN_THRESHOLD = 0.35; // 35% max daily precipitation probability

export function generateChecklist(input: RulesInput): GeneratedItem[] {
  const items: TemplateItem[] = [...BASE_ITEMS, ...HEALTH_ITEMS];

  if (input.isInternational) {
    items.push(...INTERNATIONAL_ITEMS);
  }

  if (input.tripType === "business" || input.tripType === "mixed") {
    items.push(...BUSINESS_ITEMS);
  }

  if (input.weather) {
    if (input.weather.rainProbability > RAIN_THRESHOLD) {
      items.push(...RAIN_ITEMS);
    }

    if (input.weather.bucket === "cold") {
      items.push(...COLD_ITEMS);
    } else if (input.weather.bucket === "hot") {
      items.push(...HOT_ITEMS);
    }
  }

  let deduplicated: TemplateItem[];
  if (input.baggage === "carry-on") {
    items.push(...CARRY_ON_ITEMS);
    // Remove bulky clothing suggestions for carry-on
    const bulkyIds = new Set(["warm-coat"]);
    deduplicated = deduplicateItems(items.filter((i) => !bulkyIds.has(i.id)));
  } else {
    deduplicated = deduplicateItems(items);
  }

  const oftenSkippedRules = new Set(input.userHistory?.neverUsedItemRules ?? []);

  const templateResults = deduplicated
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      const { quantity, rationale } = calculateQuantity(item.id, input);

      // Personalise the currency item when we know the destination country
      let text = item.text;
      if (item.id === "currency" && input.destinationCountry) {
        const currency = getCurrencyForCountry(input.destinationCountry);
        if (currency) {
          text = `Local currency — ${currency.name} (${currency.code}) or Revolut/Wise`;
        }
      }

      return {
        text,
        category: item.category,
        priority: item.priority,
        sourceRule: item.id,
        quantity,
        rationale,
        ...(oftenSkippedRules.has(item.id) ? { oftenSkipped: true } : {}),
      };
    });

  // Inject power adapter items for international trips
  if (input.isInternational) {
    const powerItems = buildPowerAdapterItems(
      input.userHomeCountry,
      input.destinationCountry,
      input.destination,
    );
    templateResults.push(...powerItems);
  }

  // Inject visa checklist items (crucial category, highest priority)
  if (input.isInternational && input.visaResult) {
    const visaItems = visaChecklistItems(input.visaResult).map((v) => ({
      text: v.text,
      category: "crucial" as ChecklistCategory,
      priority: v.priority,
      sourceRule: v.sourceRule,
      quantity: 1,
      rationale: v.rationale,
    }));
    // Prepend visa items; they have priority 1-5 which sorts before template items
    return [...visaItems, ...templateResults];
  }

  return templateResults;
}

// ─── Quantity engine ──────────────────────────────────────────────────────────

function calculateQuantity(
  itemId: string,
  input: RulesInput
): { quantity: number; rationale: string | null } {
  const days = input.durationDays;
  const isHot = input.weather?.bucket === "hot";
  const isCarryOn = input.baggage === "carry-on";

  let qty: number;
  let rationale: string;

  switch (itemId) {
    case "underwear":
    case "socks": {
      qty = days + 1;
      rationale = `${days}-day trip → ${qty} pairs`;
      break;
    }
    case "t-shirts": {
      const base =
        input.tripType === "business"
          ? Math.ceil(days * 0.6)
          : input.tripType === "mixed"
          ? Math.ceil(days * 0.7)
          : Math.ceil(days * 0.8);
      qty = isHot ? Math.ceil(base * 1.2) : base;
      rationale = `${days}-day ${input.tripType} trip${isHot ? " (hot)" : ""} → ${qty}`;
      break;
    }
    case "light-clothing": {
      qty = Math.ceil(days * 0.8 * 1.2);
      rationale = `${days}-day hot trip → ${qty}`;
      break;
    }
    case "sleepwear": {
      qty = Math.max(1, Math.ceil(days / 3));
      rationale = `${days}-day trip → ${qty} set${qty !== 1 ? "s" : ""}`;
      break;
    }
    default:
      return { quantity: 1, rationale: null };
  }

  // Cap for carry-on to keep luggage light
  if (isCarryOn && qty > 3) {
    qty = 3;
    rationale += " (capped for carry-on)";
  }

  return { quantity: Math.max(1, qty), rationale };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deduplicateItems(items: TemplateItem[]): TemplateItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ─── Power adapter helpers ────────────────────────────────────────────────────

function buildPowerAdapterItems(
  homeCountry: string | null | undefined,
  destCountry: string | null | undefined,
  destName?: string,
): GeneratedItem[] {
  // No home or destination data → fall back to generic reminder
  if (!homeCountry || !destCountry) {
    return [
      {
        text: "Power adapter (check plug type for destination)",
        category: "tech",
        priority: 30,
        sourceRule: "power-adapter-generic",
        quantity: 1,
        rationale: null,
      },
    ];
  }

  const info = getAdapterInfo(homeCountry, destCountry);

  // Same plug family, same voltage → nothing needed
  if (!info) return [];

  const result: GeneratedItem[] = [];

  if (info.neededPlugTypes.length > 0) {
    const typeLabel = info.neededPlugTypes.map((t) => `Type ${t}`).join(" / ");
    const locationLabel = destName ?? destCountry;
    result.push({
      text: `Power adapter (${typeLabel})`,
      category: "tech",
      priority: 30,
      sourceRule: "power-adapter",
      quantity: 1,
      rationale: `In ${locationLabel}`,
    });
  }

  if (info.voltageWarning) {
    result.push({
      text: "Check device voltage compatibility (destination voltage differs)",
      category: "tech",
      priority: 31,
      sourceRule: "voltage-check",
      quantity: 1,
      rationale: "Significant voltage difference between home and destination",
    });
  }

  return result;
}

export function detectIfInternational(
  originCountry: string = "IL",
  destinationCountry?: string | null
): boolean {
  if (!destinationCountry) return true; // assume international if unknown
  return destinationCountry.toLowerCase() !== originCountry.toLowerCase();
}
