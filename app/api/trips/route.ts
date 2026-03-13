import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createTrip, type CreateTripInput } from "@/lib/domain/trips/create";
import { z } from "zod";

const createTripSchema = z.object({
  type: z.enum(["business", "leisure", "mixed"]),
  destinationText: z.string().min(2).max(200),
  destinationCountry: z.string().optional(),
  destinationCity: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  baggageMode: z.enum(["carry-on", "checked", "unknown"]).default("unknown"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, session.user.id))
    .orderBy(desc(trips.createdAt));

  return NextResponse.json(userTrips);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTripSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Validate end >= start
  if (parsed.data.endDate < parsed.data.startDate) {
    return NextResponse.json(
      { error: "End date must be same or after start date" },
      { status: 400 }
    );
  }

  // Fetch user's nationality + homeCountry for visa / power-adapter checks
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

  const input: CreateTripInput = {
    userId: session.user.id,
    ...parsed.data,
    userNationality: user?.nationality ?? null,
    userHomeCountry: user?.homeCountry ?? null,
  };

  const trip = await createTrip(input);
  return NextResponse.json(trip, { status: 201 });
}
