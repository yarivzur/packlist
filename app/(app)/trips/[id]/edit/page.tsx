import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripEditForm } from "@/components/trips/trip-edit-form";
import { countryCodeToFlag } from "@/lib/utils/country-flag";

export default async function TripEditPage({
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

  const flag = countryCodeToFlag(trip.destinationCountry);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/trips/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {flag && <span className="mr-2">{flag}</span>}
          Edit trip
        </h1>
      </div>

      <TripEditForm
        tripId={trip.id}
        initialType={trip.type}
        initialDestination={trip.destinationText}
        initialStartDate={trip.startDate}
        initialEndDate={trip.endDate}
        initialBaggageMode={trip.baggageMode}
      />
    </div>
  );
}
