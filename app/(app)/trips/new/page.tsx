import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TripForm } from "@/components/trips/trip-form";

export default async function NewTripPage() {
  const session = await auth();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session!.user!.id!));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Where are you headed? 🌍</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your trip and we&apos;ll build a smart packing list — tailored to the weather, how long you&apos;re going, and how you&apos;re flying.
        </p>
      </div>
      <TripForm
        nationality={user?.nationality ?? null}
        homeCountry={user?.homeCountry ?? null}
      />
    </div>
  );
}
