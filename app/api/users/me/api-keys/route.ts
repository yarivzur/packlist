import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
});

// GET /api/users/me/api-keys — list keys (never returns hash or raw key)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json(keys);
}

// POST /api/users/me/api-keys — create a new key
// Returns { id, name, createdAt, key: "pk_..." } — raw key shown ONCE only
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const rawKey = "pk_" + randomBytes(32).toString("base64url");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const [row] = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      keyHash,
      name: parsed.data.name,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
    });

  return NextResponse.json({ ...row, key: rawKey }, { status: 201 });
}
