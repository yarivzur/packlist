import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";

/**
 * Resolves the authenticated user ID from either:
 *  1. Authorization: Bearer <api-key>  (used by MCP / external agents)
 *  2. The existing NextAuth session cookie  (used by the web app)
 *
 * Returns { userId: string } or null (caller should return 401).
 */
export async function resolveUser(
  req: NextRequest
): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const raw = authHeader.slice(7).trim();
    const hash = createHash("sha256").update(raw).digest("hex");

    const [row] = await db
      .select({ id: apiKeys.id, userId: apiKeys.userId })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, hash));

    if (!row) return null;

    // Fire-and-forget: update lastUsedAt without blocking the response
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .catch(() => {});

    return { userId: row.userId };
  }

  const session = await auth();
  if (!session?.user?.id) return null;
  return { userId: session.user.id };
}
