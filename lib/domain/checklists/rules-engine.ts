import type { WeatherData } from "@/lib/domain/weather/open-meteo";
import { visaChecklistItems, type VisaCheckResult } from "@/lib/domain/visa/visa-check";
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
  /** Pre-computed visa check result to inject items (optional) */
  visaResult?: VisaCheckResult | null;
}

export interface GeneratedItem {
  text: string;
  category: ChecklistCategory;
  priority: number;
  sourceRule: string;
  quantity: number;
  rationale: string | null;
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
    const bulkyIds = new Set(["warm-coat", "swimwear"]);
    deduplicated = deduplicateItems(items.filter((i) => !bulkyIds.has(i.id)));
  } else {
    deduplicated = deduplicateItems(items);
  }

  const templateResults = deduplicated
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      const { quantity, rationale } = calculateQuantity(item.id, input);
      return {
        text: item.text,
        category: item.category,
        priority: item.priority,
        sourceRule: item.id,
        quantity,
        rationale,
      };
    });

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

export function detectIfInternational(
  originCountry: string = "IL",
  destinationCountry?: string | null
): boolean {
  if (!destinationCountry) return true; // assume international if unknown
  return destinationCountry.toLowerCase() !== originCountry.toLowerCase();
}
