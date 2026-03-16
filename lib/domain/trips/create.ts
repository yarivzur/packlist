import { db } from "@/lib/db";
import { trips, checklistItems } from "@/lib/db/schema";
import { fetchWeatherForTrip, geocodeDestination } from "@/lib/domain/weather/open-meteo";
import { generateChecklist, detectIfInternational } from "@/lib/domain/checklists/rules-engine";
import { checkVisa } from "@/lib/domain/visa/visa-check";
import { scheduleRemindersForTrip } from "@/lib/domain/reminders/schedule";
import { differenceInCalendarDays, parseISO } from "date-fns";

export interface CreateTripInput {
  userId: string;
  type: "business" | "leisure" | "mixed";
  destinationText: string;
  destinationCountry?: string;
  destinationCity?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  baggageMode: "carry-on" | "checked" | "unknown";
  /** User's passport country (ISO 3166-1 alpha-2). Used for visa check. */
  userNationality?: string | null;
  /** User's home country (ISO 3166-1 alpha-2). Used for power adapter check. */
  userHomeCountry?: string | null;
}

export async function createTrip(input: CreateTripInput) {
  // 1. Geocode destination to always capture country/city, even when weather is unavailable
  const geo = await geocodeDestination(input.destinationText);

  // 2. Fetch weather (non-blocking — returns null for trips beyond forecast window or on error)
  const weather = await fetchWeatherForTrip(
    input.destinationText,
    input.startDate,
    input.endDate
  );

  // 3. Determine destination country code (from explicit input, geocoder, or weather)
  const destinationCountry =
    input.destinationCountry ?? geo?.country_code ?? weather?.countryCode ?? null;

  // 4. Visa check (only for international trips with known nationality + destination)
  const isInternational = detectIfInternational(
    input.userNationality ?? undefined,
    destinationCountry
  );

  let visaResult = null;
  if (isInternational && input.userNationality && destinationCountry) {
    visaResult = checkVisa(input.userNationality, destinationCountry);
  }

  // 5. Insert trip
  const [trip] = await db
    .insert(trips)
    .values({
      userId: input.userId,
      type: input.type,
      destinationText: input.destinationText,
      destinationCountry,
      destinationCity: input.destinationCity ?? geo?.name ?? weather?.cityName,
      startDate: input.startDate,
      endDate: input.endDate,
      baggageMode: input.baggageMode,
      weatherDataJson: weather ?? undefined,
      visaDataJson: visaResult ?? undefined,
    })
    .returning();

  // 6. Generate checklist (includes visa items when available)
  const durationDays =
    differenceInCalendarDays(parseISO(input.endDate), parseISO(input.startDate)) + 1;

  const generatedItems = generateChecklist({
    tripType: input.type,
    durationDays,
    isInternational,
    baggage: input.baggageMode,
    weather,
    destination: input.destinationText,
    destinationCountry,
    visaResult,
    userHomeCountry: input.userHomeCountry,
  });

  // 7. Insert checklist items
  if (generatedItems.length > 0) {
    await db.insert(checklistItems).values(
      generatedItems.map((item) => ({
        tripId: trip.id,
        text: item.text,
        category: item.category as "crucial" | "clothing" | "evening" | "sports" | "accessories" | "tech" | "toiletries",
        priority: item.priority,
        sourceRule: item.sourceRule,
        quantity: item.quantity,
        rationale: item.rationale,
        done: false,
      }))
    );
  }

  // 8. Schedule reminders
  await scheduleRemindersForTrip(trip.id, input.startDate, "UTC");

  return trip;
}
