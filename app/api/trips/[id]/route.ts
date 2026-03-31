import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveUser(req);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, resolved.userId)));

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

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

  const [trip] = await db
    .update(trips)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(trips.id, id), eq(trips.userId, resolved.userId)))
    .returning();

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveUser(req);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db
    .delete(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, resolved.userId)));

  return NextResponse.json({ success: true });
}
