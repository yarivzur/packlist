import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  rating: z.enum(["too_much", "just_right", "forgot_things"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { rating, note } = parsed.data;

  // Verify trip ownership
  const [trip] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.id)));

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(trips)
    .set({
      retroRating: rating,
      ...(note ? { retroNote: note } : {}),
      updatedAt: new Date(),
    })
    .where(eq(trips.id, id));

  return NextResponse.json({ ok: true });
}
