import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { botSessions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .delete(botSessions)
    .where(
      and(
        eq(botSessions.userId, session.user.id),
        eq(botSessions.channel, "telegram")
      )
    );

  return NextResponse.json({ ok: true });
}
