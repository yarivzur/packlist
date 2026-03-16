/**
 * Post-trip retro domain module.
 *
 * Responsibilities:
 * - Query a user's packing history for personalisation
 * - Build retro prompt messages for bots
 * - Parse retro rating replies from bot users
 */

import { db } from "@/lib/db";
import { trips, checklistItems } from "@/lib/db/schema";
import { eq, and, ne, lt, desc, isNotNull } from "drizzle-orm";
import type { OutgoingMessage } from "@/lib/channels/interface";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RetroRating = "too_much" | "just_right" | "forgot_things";

export interface UserPackingHistory {
  /** Retro ratings from the last 5 trips of the same type (oldest first) */
  retroRatings: RetroRating[];
  /**
   * Item sourceRule IDs that were never checked in ≥ 2 of the last 3
   * same-type trips. These are flagged as "often skipped" in the next list.
   */
  neverUsedItemRules: string[];
}

// ─── History query ────────────────────────────────────────────────────────────

/**
 * Returns packing history for a user, scoped to a specific trip type.
 * Excludes the current trip being created (by ID) so we don't count it.
 */
export async function getUserPackingHistory(
  userId: string,
  tripType: "business" | "leisure" | "mixed",
  excludeTripId?: string
): Promise<UserPackingHistory> {
  // Fetch last 5 completed trips of same type with a retro rating
  const ratedTrips = await db
    .select({ id: trips.id, retroRating: trips.retroRating })
    .from(trips)
    .where(
      and(
        eq(trips.userId, userId),
        eq(trips.type, tripType),
        isNotNull(trips.retroRating),
        ...(excludeTripId ? [ne(trips.id, excludeTripId)] : [])
      )
    )
    .orderBy(desc(trips.createdAt))
    .limit(5);

  const retroRatings = ratedTrips
    .map((t) => t.retroRating as RetroRating)
    .reverse(); // oldest first for pattern analysis

  // Fetch last 3 trips of same type (with or without retro rating) to analyse
  // which items were never checked
  const recentTrips = await db
    .select({ id: trips.id })
    .from(trips)
    .where(
      and(
        eq(trips.userId, userId),
        eq(trips.type, tripType),
        // Only trips that have ended (endDate < today) so checklist is "final"
        lt(trips.endDate, new Date().toISOString().slice(0, 10)),
        ...(excludeTripId ? [ne(trips.id, excludeTripId)] : [])
      )
    )
    .orderBy(desc(trips.createdAt))
    .limit(3);

  if (recentTrips.length < 2) {
    // Not enough history to flag items reliably
    return { retroRatings, neverUsedItemRules: [] };
  }

  // For each past trip, find items that were never checked (done = false)
  const uncheckedPerTrip = await Promise.all(
    recentTrips.map(async (t) => {
      const rows = await db
        .select({ sourceRule: checklistItems.sourceRule })
        .from(checklistItems)
        .where(
          and(
            eq(checklistItems.tripId, t.id),
            eq(checklistItems.done, false)
          )
        );
      return new Set(rows.map((r) => r.sourceRule));
    })
  );

  // Find sourceRules that appear as unchecked in ≥ 2 out of the last 3 trips
  const ruleCount = new Map<string, number>();
  for (const unchecked of uncheckedPerTrip) {
    for (const rule of unchecked) {
      // Skip custom items — they're one-offs
      if (rule === "custom") continue;
      ruleCount.set(rule, (ruleCount.get(rule) ?? 0) + 1);
    }
  }

  const threshold = Math.min(2, recentTrips.length);
  const neverUsedItemRules = [...ruleCount.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([rule]) => rule);

  return { retroRatings, neverUsedItemRules };
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds the retro prompt message for a given channel.
 * Telegram gets inline keyboard buttons; WhatsApp gets a numbered list.
 */
export function buildRetroPrompt(
  destinationText: string,
  channel: "telegram" | "whatsapp"
): OutgoingMessage {
  // Both Telegram and WhatsApp support up to 3 quick-reply buttons.
  // The WA client converts these to interactive button messages automatically.
  const text =
    channel === "telegram"
      ? `✈️ You're back from *${destinationText}*!\n\nHow did packing go?`
      : `✈️ You're back from ${destinationText}!\n\nHow did packing go?`;

  return {
    text,
    buttons: [
      [
        { label: "📦 Overpacked", data: "retro:too_much" },
        { label: "✅ Just right", data: "retro:just_right" },
        { label: "😅 Forgot things", data: "retro:forgot_things" },
      ],
    ],
  };
}

/** The follow-up note prompt sent after a rating is received. */
export const RETRO_NOTE_PROMPT: OutgoingMessage = {
  text: `Thanks for the feedback! 🙌\n\nAnything specific you want to remember for next time? (e.g. "always forget charger") — or reply *skip* to finish.`,
};

// ─── Reply parser ─────────────────────────────────────────────────────────────

/**
 * Parses a user's retro rating reply.
 * Handles: callback data ("retro:too_much"), numbers ("1"/"2"/"3"), and
 * natural-language variants ("overpacked", "just right", "forgot").
 *
 * Returns null if the reply is not recognisable as a rating.
 */
export function parseRetroRating(input: string): RetroRating | null {
  const s = input.trim().toLowerCase();

  // Callback data from Telegram buttons
  if (s === "retro:too_much") return "too_much";
  if (s === "retro:just_right") return "just_right";
  if (s === "retro:forgot_things") return "forgot_things";

  // Numbered WhatsApp replies
  if (s === "1") return "too_much";
  if (s === "2") return "just_right";
  if (s === "3") return "forgot_things";

  // Natural language fallbacks
  if (s.includes("overpack") || s.includes("too much")) return "too_much";
  if (s.includes("just right") || s.includes("perfect")) return "just_right";
  if (s.includes("forgot") || s.includes("missing") || s.includes("left behind")) return "forgot_things";

  return null;
}

// ─── Personalisation tips ─────────────────────────────────────────────────────

/**
 * Returns a human-readable tip based on recent retro ratings, or null if
 * there's no clear pattern worth surfacing.
 */
export function getRetroTip(
  ratings: RetroRating[],
  tripType: string
): string | null {
  if (ratings.length < 2) return null;

  const counts = { too_much: 0, just_right: 0, forgot_things: 0 };
  for (const r of ratings) counts[r]++;

  const majority = Math.ceil(ratings.length * 0.6); // 60% threshold

  if (counts.too_much >= majority) {
    return `💡 You tend to overpack on ${tripType} trips — consider being more selective this time.`;
  }
  if (counts.forgot_things >= majority) {
    return `⚠️ You often forget things on ${tripType} trips — double-check your list before you leave!`;
  }
  return null;
}
