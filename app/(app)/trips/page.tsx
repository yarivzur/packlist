import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { Plus } from "lucide-react";

export default async function TripsPage() {
  const session = await auth();
  const userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, session!.user!.id!))
    .orderBy(desc(trips.createdAt));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your adventures</h1>
          <p className="text-sm text-muted-foreground">
            {userTrips.length === 0
              ? "The world is waiting — where to first?"
              : `${userTrips.length} trip${userTrips.length !== 1 ? "s" : ""} planned`}
          </p>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <Plus className="mr-1 h-4 w-4" />
            Plan a trip
          </Link>
        </Button>
      </div>

      {userTrips.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <div className="text-4xl mb-4">🎒</div>
          <h2 className="font-semibold text-lg mb-2">Nowhere to be… yet</h2>
          <p className="text-muted-foreground mb-6">
            Tell us where you&apos;re headed and we&apos;ll build a packing list tailored to the weather, the trip length, and how you&apos;re flying.
          </p>
          <Button asChild>
            <Link href="/trips/new">Plan my first trip</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {userTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
