import { getVisaRequirement, type EntryType, type VisaRequirement } from "./visa-data";

export type { EntryType, VisaRequirement };

export interface VisaCheckResult {
  nationality: string;
  destination: string;
  entryType: EntryType;
  notes?: string;
  maxStay?: number;
  /** Human-readable label for UI badges etc. */
  label: string;
  /** Colour hint for the UI badge */
  status: "green" | "yellow" | "red";
}

const ENTRY_LABELS: Record<EntryType, string> = {
  visa_free: "Visa-free",
  eta: "eTA / e-Visa",
  visa_on_arrival: "Visa on arrival",
  visa_required: "Visa required",
};

const ENTRY_STATUS: Record<EntryType, VisaCheckResult["status"]> = {
  visa_free: "green",
  eta: "yellow",
  visa_on_arrival: "yellow",
  visa_required: "red",
};

/**
 * Check visa requirements for a traveller.
 *
 * @param nationality  ISO 3166-1 alpha-2 passport country (e.g. "IL", "US")
 * @param destinationCountry  ISO 3166-1 alpha-2 destination (e.g. "FR", "TH")
 */
export function checkVisa(
  nationality: string,
  destinationCountry: string
): VisaCheckResult {
  const req: VisaRequirement = getVisaRequirement(
    nationality.toUpperCase(),
    destinationCountry.toUpperCase()
  );

  return {
    nationality: nationality.toUpperCase(),
    destination: destinationCountry.toUpperCase(),
    entryType: req.type,
    notes: req.notes,
    maxStay: req.maxStay,
    label: ENTRY_LABELS[req.type],
    status: ENTRY_STATUS[req.type],
  };
}

/** Checklist items to inject based on visa result. */
export function visaChecklistItems(
  result: VisaCheckResult
): { text: string; priority: number; sourceRule: string; rationale: string }[] {
  const items = [];

  if (result.entryType === "visa_required") {
    items.push({
      text: `Apply for ${result.destination} visa before travel`,
      priority: 1,
      sourceRule: "visa_required",
      rationale: `${result.nationality} passport requires a visa for ${result.destination}`,
    });
  }

  if (result.entryType === "eta") {
    items.push({
      text: `Get ${result.label} for ${result.destination}${result.notes ? ` — ${result.notes}` : ""}`,
      priority: 2,
      sourceRule: "visa_eta",
      rationale: `${result.nationality} passport requires an eTA/e-Visa for ${result.destination}`,
    });
  }

  if (result.entryType === "visa_on_arrival") {
    items.push({
      text: `Bring cash for visa on arrival in ${result.destination}${result.notes ? ` (${result.notes})` : ""}`,
      priority: 3,
      sourceRule: "visa_on_arrival",
      rationale: `${result.nationality} passport — visa on arrival at ${result.destination}`,
    });
  }

  return items;
}
