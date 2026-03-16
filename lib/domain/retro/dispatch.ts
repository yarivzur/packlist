/**
 * Post-trip retro dispatch.
 * Finds trips that ended yesterday, sends retro prompts via connected channels,
 * and transitions the bot session to RETRO_PROMPTED state.
 */

import { db } from "@/lib/db";
import { trips, botSessions } from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { buildRetroPrompt } from "./retro";
import { telegramChannel } from "@/lib/channels/telegram/client";
import { whatsappChannel } from "@/lib/channels/whatsapp/client";

export interface RetroDispatchResult {
  tripId: string;
  userId: string;
  channelsNotified: string[];
  skipped?: string; // reason if skipped
}

/**
 * Dispatches retro prompts for all trips that ended yesterday and haven't been
 * prompted yet. Should be called from the daily cron job.
 */
export async function dispatchRetroPrompts(): Promise<RetroDispatchResult[]> {
  // "Yesterday" in YYYY-MM-DD format (UTC)
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Find trips that ended yesterday with no retro prompt sent yet
  const eligibleTrips = await db
    .select()
    .from(trips)
    .where(
      and(
        eq(trips.endDate, yesterdayStr),
        isNull(trips.retroPromptedAt)
      )
    );

  const results: RetroDispatchResult[] = [];

  for (const trip of eligibleTrips) {
    const result = await dispatchRetroForTrip(trip);
    results.push(result);
  }

  return results;
}

async function dispatchRetroForTrip(
  trip: typeof trips.$inferSelect
): Promise<RetroDispatchResult> {
  const result: RetroDispatchResult = {
    tripId: trip.id,
    userId: trip.userId,
    channelsNotified: [],
  };

  // Find all bot sessions for this user that are in IDLE state
  // (don't interrupt active conversation flows)
  const sessions = await db
    .select()
    .from(botSessions)
    .where(
      and(
        eq(botSessions.userId, trip.userId),
        eq(botSessions.state, "IDLE")
      )
    );

  if (sessions.length === 0) {
    result.skipped = "no idle bot sessions";
    // Still mark as prompted so we don't retry tomorrow
    await db
      .update(trips)
      .set({ retroPromptedAt: new Date(), updatedAt: new Date() })
      .where(eq(trips.id, trip.id));
    return result;
  }

  // Mark the trip as prompted before sending (idempotent: prevents double-send
  // if the cron runs twice or a race condition occurs)
  await db
    .update(trips)
    .set({ retroPromptedAt: new Date(), updatedAt: new Date() })
    .where(eq(trips.id, trip.id));

  for (const session of sessions) {
    try {
      const prompt = buildRetroPrompt(trip.destinationText, session.channel);

      if (session.channel === "telegram") {
        await telegramChannel.sendMessage(session.channelUserId, prompt);
      } else if (session.channel === "whatsapp") {
        await whatsappChannel.sendMessage(session.channelUserId, prompt);
      }

      // Transition session to RETRO_PROMPTED, storing the trip ID
      await db
        .update(botSessions)
        .set({
          state: "RETRO_PROMPTED",
          stateDataJson: { retroTripId: trip.id },
          updatedAt: new Date(),
        })
        .where(eq(botSessions.id, session.id));

      result.channelsNotified.push(session.channel);
    } catch (err) {
      console.error(
        `[retro] Failed to send prompt via ${session.channel} for trip ${trip.id}:`,
        err
      );
    }
  }

  return result;
}
