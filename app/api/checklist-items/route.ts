import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistItems, trips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const addItemSchema = z.object({
  tripId: z.string().uuid(),
  text: z.string().min(1).max(300),
  category: z
    .enum(["crucial", "clothing", "evening", "sports", "accessories", "tech", "toiletries"])
    .default("accessories"),
});

// GET /api/checklist-items?tripId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tripId = req.nextUrl.searchParams.get("tripId");
  if (!tripId) {
    return NextResponse.json({ error: "tripId required" }, { status: 400 });
  }

  // Verify user owns the trip
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)));

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.tripId, tripId))
    .orderBy(checklistItems.priority);

  return NextResponse.json(items);
}

// POST /api/checklist-items — add custom item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verify ownership
  const [trip] = await db
    .select()
    .from(trips)
    .where(
      and(eq(trips.id, parsed.data.tripId), eq(trips.userId, session.user.id))
    );

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const [item] = await db
    .insert(checklistItems)
    .values({
      tripId: parsed.data.tripId,
      text: parsed.data.text,
      category: parsed.data.category,
      sourceRule: "custom",
      priority: 99,
      done: false,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
