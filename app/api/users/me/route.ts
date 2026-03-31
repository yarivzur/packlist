import { NextRequest, NextResponse } from "next/server";
import { resolveUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  timezone: z.string().optional(),
  locale: z.string().optional(),
  phone: z.string().optional().nullable(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  nationality: z.string().length(2).toUpperCase().optional().nullable(),
  homeCountry: z.string().length(2).toUpperCase().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const resolved = await resolveUser(req);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const [user] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, resolved.userId))
    .returning();

  return NextResponse.json(user);
}
