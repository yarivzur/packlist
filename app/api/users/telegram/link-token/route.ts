import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { telegramLinkTokens } from "@/lib/db/schema";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = randomBytes(12).toString("hex"); // 24-char hex token
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(telegramLinkTokens).values({
    userId: session.user.id,
    token,
    expiresAt,
  });

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const deepLink = botUsername
    ? `https://t.me/${botUsername}?start=link_${token}`
    : null;

  return NextResponse.json({ token, deepLink });
}
