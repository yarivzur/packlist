import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// drizzle-kit CLI doesn't auto-load .env.local the way Next.js does
dotenv.config({ path: ".env.local" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
