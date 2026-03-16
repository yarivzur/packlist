import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, checklistItems } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChecklistView } from "@/components/checklist/checklist-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { DeleteTripRedirectButton } from "@/components/trips/delete-trip-redirect-button";
import { RetroPrompt } from "@/components/trips/retro-prompt";
import { CATEGORY_ORDER } from "@/lib/domain/checklists/templates";
import type { ChecklistCategory } from "@/lib/domain/checklists/templates";
import { countryCodeToFlag } from "@/lib/utils/country-flag";
import type { WeatherData } from "@/lib/domain/weather/open-meteo";
import type { VisaCheckResult } from "@/lib/domain/visa/visa-check";
import { getUserPackingHistory, getRetroTip } from "@/lib/domain/retro/retro";

function getWeatherTip(bucket: string, rainProbability: number): string {
  const highRain = rainProbability > 0.5;
  if (bucket === "cold")
    return highRain ? "Bundle up! Expect cold and wet — waterproof layers are your best friend." : "Chilly one! Pack warm layers and a cosy jacket.";
  if (bucket === "hot")
    return highRain ? "Hot and steamy — light clothes, but tuck in a rain jacket just in case." : "Sun's out! Pack light, breathable clothes and don't forget the SPF.";
  return highRain ? "Weather's playing games — layers and a rain jacket will keep you covered." : "Lovely weather ahead! A few adaptable layers and you're golden.";
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session!.user!.id!)));

  if (!trip) notFound();

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.tripId, id))
    .orderBy(asc(checklistItems.priority));

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat);
      return acc;
    },
    {} as Record<ChecklistCategory, typeof items>
  );

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const weather = trip.weatherDataJson as WeatherData | null;
  const visa = trip.visaDataJson as VisaCheckResult | null;
  const flag = countryCodeToFlag(trip.destinationCountry);

  const today = new Date().toISOString().slice(0, 10);
  const tripEnded = trip.endDate < today;
  const needsRetro = tripEnded && !trip.retroRating;

  // Personalisation tip from past retro ratings
  const history = await getUserPackingHistory(session!.user!.id!, trip.type, trip.id).catch(() => null);
  const retroTip = history ? getRetroTip(history.retroRatings, trip.type) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trips"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {flag && <span className="mr-2">{flag}</span>}
              {trip.destinationText}
            </h1>
            <p className="text-sm text-muted-foreground">
              {trip.startDate} → {trip.endDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/trips/${trip.id}/edit`}><Pencil className="h-4 w-4" /></Link>
          </Button>
          <DeleteTripRedirectButton tripId={trip.id} />
        </div>
      </div>

      {/* Trip meta badges */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="secondary" className="capitalize">{trip.type}</Badge>
        {trip.baggageMode !== "unknown" && (
          <Badge variant="outline" className="capitalize">{trip.baggageMode}</Badge>
        )}
        {/* Visa status badge — neutral pill + colored dot avoids same-hue contrast issues */}
        {visa && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-background text-foreground"
            title={visa.notes}
          >
            <span
              aria-hidden
              className={[
                "h-2 w-2 rounded-full shrink-0",
                visa.status === "green" && "bg-green-500",
                visa.status === "yellow" && "bg-yellow-500",
                visa.status === "red" && "bg-red-500",
              ].filter(Boolean).join(" ")}
            />
            {visa.label}
            {visa.maxStay && ` · up to ${visa.maxStay} days`}
          </span>
        )}
      </div>

      {/* Weather strip */}
      {weather?.bucket && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <span className="text-2xl shrink-0" aria-hidden>
            {weather.bucket === "cold" ? "🥶" : weather.bucket === "hot" ? "☀️" : "🌤️"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-medium">
              <span className="capitalize">{weather.bucket}</span>
              <span className="text-muted-foreground">·</span>
              <span>{weather.avgTempC}°C avg</span>
              {weather.rainProbability > 0.35 && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>🌧 {Math.round(weather.rainProbability * 100)}% rain</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-4">
              {getWeatherTip(weather.bucket, weather.rainProbability)}
              {weather.isHistorical && (
                <span className="ml-1 opacity-70">(based on last year&apos;s climate)</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Packing progress</span>
          <span className="font-medium">{doneCount}/{totalCount} items</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-sm text-center font-medium text-primary">🎉 You&apos;re all packed! Go enjoy every second.</p>
        )}
      </div>

      {/* Personalisation tip from past retro ratings */}
      {retroTip && (
        <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0 mt-0.5" aria-hidden>🧠</span>
          <p className="text-sm text-amber-800 dark:text-amber-300">{retroTip}</p>
        </div>
      )}

      {/* Post-trip retro prompt */}
      {needsRetro && <RetroPrompt tripId={trip.id} />}

      {/* Checklist */}
      <ChecklistView tripId={trip.id} grouped={grouped} reviewed={trip.reviewed} />
    </div>
  );
}
