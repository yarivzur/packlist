import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, botSessions, apiKeys } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [[user], [telegramSession], [whatsappSession], userApiKeys] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)),
    db
      .select({ id: botSessions.id })
      .from(botSessions)
      .where(and(eq(botSessions.channel, "telegram"), eq(botSessions.userId, userId)))
      .limit(1),
    db
      .select({ id: botSessions.id })
      .from(botSessions)
      .where(and(eq(botSessions.channel, "whatsapp"), eq(botSessions.userId, userId)))
      .limit(1),
    db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt)),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>
      <SettingsForm
        user={user}
        telegramConnected={!!telegramSession}
        whatsappConnected={!!whatsappSession}
        apiKeys={userApiKeys}
      />
    </div>
  );
}
