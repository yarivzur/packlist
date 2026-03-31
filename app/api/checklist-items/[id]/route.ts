import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { checklistItems, trips } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/checklist-items/:id — toggle done or update text
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveUser(req);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Verify ownership via join
  const [existing] = await db
    .select({ item: checklistItems, trip: trips })
    .from(checklistItems)
    .innerJoin(trips, eq(trips.id, checklistItems.tripId))
    .where(eq(checklistItems.id, id));

  if (!existing || existing.trip.userId !== resolved.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(checklistItems)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(checklistItems.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/checklist-items/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveUser(req);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ item: checklistItems, trip: trips })
    .from(checklistItems)
    .innerJoin(trips, eq(trips.id, checklistItems.tripId))
    .where(eq(checklistItems.id, id));

  if (!existing || existing.trip.userId !== resolved.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  return NextResponse.json({ success: true });
}
