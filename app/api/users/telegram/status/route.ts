import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { botSessions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [linked] = await db
    .select({ id: botSessions.id })
    .from(botSessions)
    .where(
      and(
        eq(botSessions.channel, "telegram"),
        eq(botSessions.userId, session.user.id)
      )
    )
    .limit(1);

  return NextResponse.json({ connected: !!linked });
}
