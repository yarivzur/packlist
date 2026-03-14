import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { whatsappLinkTokens } from "@/lib/db/schema";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = randomBytes(12).toString("hex"); // 24-char hex token
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(whatsappLinkTokens).values({
    userId: session.user.id,
    token,
    expiresAt,
  });

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  const deepLink = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=link_${token}`
    : null;

  return NextResponse.json({ token, deepLink });
}
