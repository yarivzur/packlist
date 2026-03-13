import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Returns the Drizzle DB instance. Creates it lazily on first call.
 * Use this directly when passing to DrizzleAdapter (which checks the instance type).
 */
export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

/**
 * Lazy proxy for use in route handlers and domain logic.
 * Delegates all operations to getDb() on first access.
 * NOTE: Do NOT pass this to DrizzleAdapter — use getDb() instead.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export { schema };
