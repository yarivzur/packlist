import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, checklistItems, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { fetchWeatherForTrip, geocodeDestination } from "@/lib/domain/weather/open-meteo";
import { generateChecklist, detectIfInternational } from "@/lib/domain/checklists/rules-engine";
import { checkVisa } from "@/lib/domain/visa/visa-check";
import { getUserPackingHistory } from "@/lib/domain/retro/retro";
import { differenceInCalendarDays, parseISO } from "date-fns";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Load the trip (verify ownership)
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.id)));

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Load user profile (for nationality + homeCountry)
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

  // Refresh weather
  const weather = await fetchWeatherForTrip(
    trip.destinationText,
    trip.startDate,
    trip.endDate
  ).catch(() => null);

  // Re-geocode if destination country is missing
  const geo = trip.destinationCountry
    ? null
    : await geocodeDestination(trip.destinationText).catch(() => null);

  const destinationCountry = trip.destinationCountry ?? geo?.country_code ?? weather?.countryCode ?? null;

  // Visa check
  const isInternational = detectIfInternational(
    user?.nationality ?? undefined,
    destinationCountry
  );

  let visaResult = null;
  if (isInternational && user?.nationality && destinationCountry) {
    visaResult = checkVisa(user.nationality, destinationCountry);
  }

  // Packing history for personalisation
  const userHistory = await getUserPackingHistory(
    session.user.id,
    trip.type,
    trip.id
  ).catch(() => null);

  const durationDays =
    differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  const generatedItems = generateChecklist({
    tripType: trip.type,
    durationDays,
    isInternational,
    baggage: trip.baggageMode,
    weather: weather ?? null,
    destination: trip.destinationText,
    destinationCountry,
    visaResult,
    userHomeCountry: user?.homeCountry ?? null,
    userHistory,
  });

  // Delete existing checklist items and replace
  await db.delete(checklistItems).where(eq(checklistItems.tripId, id));

  if (generatedItems.length > 0) {
    await db.insert(checklistItems).values(
      generatedItems.map((item) => ({
        tripId: id,
        text: item.text,
        category: item.category as "crucial" | "clothing" | "evening" | "sports" | "accessories" | "tech" | "toiletries",
        priority: item.priority,
        sourceRule: item.sourceRule,
        quantity: item.quantity,
        rationale: item.rationale,
        oftenSkipped: item.oftenSkipped ?? false,
        done: false,
      }))
    );
  }

  // Update trip with refreshed weather + visa data
  await db
    .update(trips)
    .set({
      weatherDataJson: weather ?? trip.weatherDataJson,
      visaDataJson: visaResult ?? trip.visaDataJson,
      updatedAt: new Date(),
    })
    .where(eq(trips.id, id));

  return NextResponse.json({ ok: true, itemCount: generatedItems.length });
}
