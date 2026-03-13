import { db } from "@/lib/db";
import { reminders, trips, users, botSessions } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import type { Reminder, Trip, User } from "@/lib/db/schema";

export interface DispatchResult {
  reminderId: string;
  success: boolean;
  error?: string;
}

/**
 * Fetches all pending reminders that are due and dispatches them.
 * Called by the Vercel Cron endpoint.
 */
export async function dispatchDueReminders(): Promise<DispatchResult[]> {
  const now = new Date();

  const dueReminders = await db
    .select({
      reminder: reminders,
      trip: trips,
      user: users,
    })
    .from(reminders)
    .innerJoin(trips, eq(trips.id, reminders.tripId))
    .innerJoin(users, eq(users.id, trips.userId))
    .where(
      and(
        eq(reminders.status, "pending"),
        lte(reminders.sendAt, now)
      )
    );

  const results: DispatchResult[] = [];

  for (const { reminder, trip, user } of dueReminders) {
    try {
      await sendReminderToUser(reminder, trip, user);
      await db
        .update(reminders)
        .set({ status: "sent", sentAt: now })
        .where(eq(reminders.id, reminder.id));
      results.push({ reminderId: reminder.id, success: true });
    } catch (err) {
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      results.push({
        reminderId: reminder.id,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}

async function sendReminderToUser(
  reminder: Reminder,
  trip: Trip,
  user: User
): Promise<void> {
  const message = buildReminderMessage(reminder.type, trip);

  // Find user's bot sessions to deliver via channels
  const sessions = await db
    .select()
    .from(botSessions)
    .where(eq(botSessions.userId, user.id));

  let sent = false;

  for (const session of sessions) {
    if (session.channel === "telegram") {
      await sendTelegramMessage(session.channelUserId, message);
      sent = true;
    } else if (session.channel === "whatsapp") {
      await sendWhatsAppMessage(session.channelUserId, message);
      sent = true;
    }
  }

  if (!sent) {
    // Web-only user — reminder stored, frontend polls/shows notification
    console.info(`[reminders] No channel for user ${user.id}, skipping dispatch`);
  }
}

function buildReminderMessage(
  type: Reminder["type"],
  trip: Trip
): string {
  const dest = trip.destinationText;
  switch (type) {
    case "72h":
      return `⏰ 72h until your trip to ${dest}. Start packing! Open PackList to check your list.`;
    case "48h":
      return `⏰ 48h reminder: Your trip to ${dest} is in 2 days. How's the packing going?`;
    case "24h":
      return `⏰ 24h to go! Trip to ${dest} tomorrow. Check passport, online check-in, and print/download boarding pass.`;
    case "12h":
      return `⏰ 12h reminder: Trip to ${dest} is almost here! Final checklist review time.`;
    case "leave":
      return `🚗 Time to head to the airport for your trip to ${dest}! Have you packed everything?`;
    default:
      return `Reminder for your trip to ${dest}.`;
  }
}

async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram sendMessage failed: ${err}`);
  }
}

async function sendWhatsAppMessage(phone: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return;

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp sendMessage failed: ${err}`);
  }
}
