import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

const isDev = process.env.NODE_ENV === "development";
const devBypass = process.env.AUTH_DEV_BYPASS === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Use JWT in dev-bypass mode so Credentials provider works alongside the DB adapter.
  // In production this is always "database".
  session: {
    strategy: isDev && devBypass ? "jwt" : "database",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    // ─── Dev-only bypass ─────────────────────────────────────────────────────
    // Enabled only when AUTH_DEV_BYPASS=true in .env.local.
    // NEVER active in production (NODE_ENV check is a safety net).
    ...(isDev && devBypass
      ? [
          Credentials({
            id: "dev-bypass",
            name: "Dev Bypass",
            credentials: {},
            async authorize() {
              const DEV_ID = "00000000-0000-0000-0000-000000000001";
              // Upsert the dev user so FK constraints on trips/checklist_items pass.
              const db = getDb();
              await db
                .insert(users)
                .values({
                  id: DEV_ID,
                  email: "dev@localhost",
                  name: "Dev User",
                  image: null,
                })
                .onConflictDoNothing();
              return { id: DEV_ID, email: "dev@localhost", name: "Dev User", image: null };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user, token }) {
      // database strategy: `user` is populated from DB
      if (user) {
        session.user.id = user.id;
      }
      // jwt strategy (dev-bypass): `token.sub` holds the id from authorize()
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
