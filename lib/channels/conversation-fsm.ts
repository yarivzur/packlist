/**
 * Shared conversation finite state machine.
 * Used by both Telegram and WhatsApp handlers.
 * State is persisted in bot_sessions table (DB) — required for serverless.
 */

import { db } from "@/lib/db";
import { botSessions, checklistItems, telegramLinkTokens, whatsappLinkTokens, trips, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTrip } from "@/lib/domain/trips/create";
import type {
  Channel,
  ConversationState,
  ConversationData,
  IncomingMessage,
  OutgoingMessage,
} from "./interface";
import type { WeatherData } from "@/lib/domain/weather/open-meteo";
import type { VisaCheckResult } from "@/lib/domain/visa/visa-check";

const TRIP_TYPE_BUTTONS = [
  [
    { label: "✈️ Business", data: "type:business" },
    { label: "🏖 Leisure", data: "type:leisure" },
    { label: "🔀 Mixed", data: "type:mixed" },
  ],
];

const BAGGAGE_BUTTONS = [
  [
    { label: "🎒 Carry-on only", data: "bag:carry-on" },
    { label: "🧳 Checked bag", data: "bag:checked" },
    { label: "🤷 Not sure yet", data: "bag:unknown" },
  ],
];

export async function handleMessage(
  channel: Channel,
  message: IncomingMessage
): Promise<void> {
  const { channelUserId, text, callbackData } = message;
  const input = (callbackData ?? text).trim();

  // Load or create bot session
  let [session] = await db
    .select()
    .from(botSessions)
    .where(
      and(
        eq(botSessions.channel, channel.name),
        eq(botSessions.channelUserId, channelUserId)
      )
    );

  if (!session) {
    const [newSession] = await db
      .insert(botSessions)
      .values({
        channel: channel.name,
        channelUserId,
        state: "IDLE",
        stateDataJson: {},
      })
      .returning();
    session = newSession;
  }

  const state = session.state as ConversationState;
  const data = (session.stateDataJson ?? {}) as ConversationData;

  const { nextState, nextData, reply, linkUserId, preSend } = await processState(
    state,
    data,
    input,
    session.userId,
    channel.name
  );

  // Persist state update (and optionally link the userId)
  await db
    .update(botSessions)
    .set({
      state: nextState,
      stateDataJson: nextData,
      updatedAt: new Date(),
      ...(linkUserId ? { userId: linkUserId } : {}),
    })
    .where(eq(botSessions.id, session.id));

  // Send context messages (weather, visa) before the main reply
  if (preSend) {
    for (const msg of preSend) {
      await channel.sendMessage(channelUserId, msg);
    }
  }

  await channel.sendMessage(channelUserId, reply);
}

async function processState(
  state: ConversationState,
  data: ConversationData,
  input: string,
  userId: string | null | undefined,
  channelName: "telegram" | "whatsapp"
): Promise<{
  nextState: ConversationState;
  nextData: ConversationData;
  reply: Parameters<Channel["sendMessage"]>[1];
  linkUserId?: string;
  preSend?: OutgoingMessage[];
}> {
  // ── Account linking: Telegram → /start link_TOKEN | WhatsApp → link_TOKEN ───
  const telegramLinkMatch = channelName === "telegram" && input.startsWith("/start link_");
  const whatsappLinkMatch = channelName === "whatsapp" && input.startsWith("link_");

  if (telegramLinkMatch || whatsappLinkMatch) {
    const token = telegramLinkMatch
      ? input.slice("/start link_".length).trim()
      : input.slice("link_".length).trim();

    let linkToken: typeof telegramLinkTokens.$inferSelect | typeof whatsappLinkTokens.$inferSelect | undefined;

    if (channelName === "telegram") {
      const [row] = await db
        .select()
        .from(telegramLinkTokens)
        .where(eq(telegramLinkTokens.token, token))
        .limit(1);
      linkToken = row;
      if (linkToken && !linkToken.usedAt && linkToken.expiresAt >= new Date()) {
        await db
          .update(telegramLinkTokens)
          .set({ usedAt: new Date() })
          .where(eq(telegramLinkTokens.id, linkToken.id));
      }
    } else {
      const [row] = await db
        .select()
        .from(whatsappLinkTokens)
        .where(eq(whatsappLinkTokens.token, token))
        .limit(1);
      linkToken = row;
      if (linkToken && !linkToken.usedAt && linkToken.expiresAt >= new Date()) {
        await db
          .update(whatsappLinkTokens)
          .set({ usedAt: new Date() })
          .where(eq(whatsappLinkTokens.id, linkToken.id));
      }
    }

    if (!linkToken || linkToken.usedAt || linkToken.expiresAt < new Date()) {
      return {
        nextState: state,
        nextData: data,
        reply: {
          text: "This link has expired or already been used. Generate a new one from Settings in the app.",
        },
      };
    }

    return {
      nextState: "IDLE",
      nextData: {},
      linkUserId: linkToken.userId,
      reply: {
        text: "✅ *Account linked!* You're all set.\n\nType /newtrip to create your first trip.",
        buttons: [[{ label: "✈️ New trip", data: "/newtrip" }]],
      },
    };
  }

  // ── Checklist toggle: check:ITEMID ──────────────────────────────────────────
  if (input.startsWith("check:")) {
    const itemId = input.slice("check:".length);

    if (!userId) {
      return {
        nextState: "IDLE",
        nextData: {},
        reply: { text: "Please link your account first via Settings in the app." },
      };
    }

    const [item] = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.id, itemId))
      .limit(1);

    if (!item) {
      return { nextState: state, nextData: data, reply: { text: "Item not found." } };
    }

    // Verify item belongs to a trip owned by this user
    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, item.tripId), eq(trips.userId, userId)))
      .limit(1);

    if (!trip) {
      return { nextState: state, nextData: data, reply: { text: "Item not found." } };
    }

    await db
      .update(checklistItems)
      .set({ done: true, updatedAt: new Date() })
      .where(eq(checklistItems.id, itemId));

    return buildChecklistReply(trip.id, trip.destinationText, "VIEWING_CHECKLIST", {
      ...data,
      viewingTripId: trip.id,
    });
  }

  // ── Checklist view: /checklist:TRIPID or refresh:TRIPID ─────────────────────
  const checklistMatch = input.match(/^(?:\/checklist:|refresh:)([0-9a-f-]{36})$/i);
  if (checklistMatch) {
    const tripId = checklistMatch[1];

    if (!userId) {
      return {
        nextState: "IDLE",
        nextData: {},
        reply: { text: "Please link your account first via Settings in the app." },
      };
    }

    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (!trip) {
      return { nextState: "IDLE", nextData: {}, reply: { text: "Trip not found." } };
    }

    return buildChecklistReply(tripId, trip.destinationText, "VIEWING_CHECKLIST", {
      ...data,
      viewingTripId: tripId,
    });
  }

  // ── /start (without token) ───────────────────────────────────────────────────
  if (input === "/start") {
    return {
      nextState: "IDLE",
      nextData: {},
      reply: {
        text: "✈️ *PackList* — Travel Checklist Assistant\n\nI'll help you pack the right stuff for every trip.\n\nReady to start?",
        buttons: [[{ label: "✈️ New trip", data: "/newtrip" }]],
      },
    };
  }

  if (input === "/newtrip" || (state === "IDLE" && input.toLowerCase().includes("new trip"))) {
    return {
      nextState: "ASKING_TRIP_TYPE",
      nextData: {},
      reply: {
        text: "What kind of trip is this?",
        buttons: TRIP_TYPE_BUTTONS,
      },
    };
  }

  switch (state) {
    case "IDLE":
      return {
        nextState: "IDLE",
        nextData: {},
        reply: {
          text: "Type /newtrip to create a new trip, or tap the button below.",
          buttons: [[{ label: "✈️ New trip", data: "/newtrip" }]],
        },
      };

    case "ASKING_TRIP_TYPE": {
      const typeMap: Record<string, "business" | "leisure" | "mixed"> = {
        "type:business": "business",
        "type:leisure": "leisure",
        "type:mixed": "mixed",
      };
      const tripType = typeMap[input] ?? typeMap[`type:${input.toLowerCase()}`];
      if (!tripType) {
        return {
          nextState: "ASKING_TRIP_TYPE",
          nextData: data,
          reply: { text: "Please choose a trip type:", buttons: TRIP_TYPE_BUTTONS },
        };
      }
      return {
        nextState: "ASKING_DESTINATION",
        nextData: { ...data, tripType },
        reply: { text: "Where are you flying? (e.g., Berlin, Germany)" },
      };
    }

    case "ASKING_DESTINATION":
      return {
        nextState: "ASKING_START_DATE",
        nextData: { ...data, destination: input },
        reply: {
          text: `Got it — ${input}!\n\nWhat's your departure date? (YYYY-MM-DD)`,
        },
      };

    case "ASKING_START_DATE": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return {
          nextState: "ASKING_START_DATE",
          nextData: data,
          reply: { text: "Please use YYYY-MM-DD format (e.g., 2025-08-14)." },
        };
      }
      return {
        nextState: "ASKING_END_DATE",
        nextData: { ...data, startDate: input },
        reply: { text: "And your return date? (YYYY-MM-DD)" },
      };
    }

    case "ASKING_END_DATE": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || input < (data.startDate ?? "")) {
        return {
          nextState: "ASKING_END_DATE",
          nextData: data,
          reply: {
            text: `Return date must be ${data.startDate} or later. Try again (YYYY-MM-DD).`,
          },
        };
      }
      return {
        nextState: "ASKING_BAGGAGE",
        nextData: { ...data, endDate: input },
        reply: {
          text: "Packing mode?",
          buttons: BAGGAGE_BUTTONS,
        },
      };
    }

    case "ASKING_BAGGAGE": {
      const bagMap: Record<string, "carry-on" | "checked" | "unknown"> = {
        "bag:carry-on": "carry-on",
        "bag:checked": "checked",
        "bag:unknown": "unknown",
      };
      const baggage = bagMap[input] ?? "unknown";
      const newData = { ...data, baggage };

      if (!userId) {
        return {
          nextState: "IDLE",
          nextData: {},
          reply: {
            text: "You need to link your account first. Open the app → Settings → Connect Telegram.",
          },
        };
      }

      try {
        const [userRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const trip = await createTrip({
          userId,
          type: newData.tripType!,
          destinationText: newData.destination!,
          startDate: newData.startDate!,
          endDate: newData.endDate!,
          baggageMode: newData.baggage!,
          userNationality: userRow?.nationality ?? null,
          userHomeCountry: userRow?.homeCountry ?? null,
        });

        const checklistResult = await buildChecklistReply(
          trip.id,
          trip.destinationText,
          "VIEWING_CHECKLIST",
          { viewingTripId: trip.id },
          `✅ *Trip created!*\n📍 ${trip.destinationText} · ${trip.startDate} → ${trip.endDate}`,
          true // send weather + visa context
        );
        return checklistResult;
      } catch {
        return {
          nextState: "IDLE",
          nextData: {},
          reply: { text: "Something went wrong creating your trip. Please try again." },
        };
      }
    }

    case "VIEWING_CHECKLIST": {
      const tripId = data.viewingTripId;
      if (tripId) {
        return buildChecklistReply(tripId, "your trip", "VIEWING_CHECKLIST", data);
      }
      return {
        nextState: "IDLE",
        nextData: {},
        reply: {
          text: "Type /newtrip to create a new trip.",
          buttons: [[{ label: "✈️ New trip", data: "/newtrip" }]],
        },
      };
    }

    default:
      return {
        nextState: "IDLE",
        nextData: {},
        reply: { text: "Type /newtrip to get started." },
      };
  }
}

// ─── Checklist formatting helper ──────────────────────────────────────────────

async function buildChecklistReply(
  tripId: string,
  destinationText: string,
  nextState: ConversationState,
  nextData: ConversationData,
  header?: string,
  sendContext = false
): Promise<{
  nextState: ConversationState;
  nextData: ConversationData;
  reply: Parameters<Channel["sendMessage"]>[1];
  preSend?: OutgoingMessage[];
}> {
  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.tripId, tripId))
    .orderBy(checklistItems.priority);

  const doneCount = items.filter((i) => i.done).length;
  const total = items.length;
  const undone = items.filter((i) => !i.done);

  const lines = items.slice(0, 20).map(
    (i) => `${i.done ? "✅" : "⬜"} ${i.text}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`
  );
  if (items.length > 20) lines.push(`_…and ${items.length - 20} more items_`);

  const checklistBody = `📋 *${destinationText}*\n${doneCount}/${total} packed\n\n${lines.join("\n")}`;
  const text = header ? `${header}\n\n${checklistBody}` : checklistBody;

  // Group up to 5 unchecked items as quick-check buttons (2 per row)
  const checkButtons = undone.slice(0, 5).map((i) => ({
    label: `✓ ${i.text.slice(0, 22)}`,
    data: `check:${i.id}`,
  }));

  const buttons: { label: string; data?: string; url?: string }[][] = [];
  for (let i = 0; i < checkButtons.length; i += 2) {
    buttons.push(checkButtons.slice(i, i + 2));
  }
  const appBase = (process.env.AUTH_URL ?? "https://packlist-beta.vercel.app").replace(/\/$/, "");
  buttons.push([
    { label: "🌐 Open in app", url: `${appBase}/trips/${tripId}` },
    { label: "🔄 Refresh", data: `refresh:${tripId}` },
  ]);

  // Build weather + visa pre-messages (only on trip creation)
  const preSend: OutgoingMessage[] = [];
  if (sendContext) {
    const [tripRow] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
    if (tripRow) {
      const weather = tripRow.weatherDataJson as WeatherData | null;
      const visa = tripRow.visaDataJson as VisaCheckResult | null;

      // Always send a weather message — fallback if forecast isn't available yet
      if (weather) {
        const rainPct = Math.round(weather.rainProbability * 100);
        const rainEmoji = weather.rainProbability > 0.5 ? "🌧" : weather.rainProbability > 0.25 ? "🌦" : "☀️";
        const tempEmoji = weather.bucket === "hot" ? "🌡️" : weather.bucket === "cold" ? "🥶" : "🌤";
        preSend.push({ text: `${tempEmoji} *Weather forecast*\nAvg ${weather.avgTempC}°C (${weather.bucket}) · ${rainEmoji} ${rainPct}% rain chance` });
      } else {
        preSend.push({ text: `🌡️ *Weather forecast*\nToo early for a forecast — check again closer to your departure date.` });
      }

      // Send visa info only when available (requires nationality to be set in Settings)
      if (visa) {
        const visaEmoji = visa.status === "green" ? "✅" : visa.status === "yellow" ? "⚠️" : "🔴";
        const stayText = visa.maxStay ? ` · up to ${visa.maxStay} days` : "";
        const notesText = visa.notes ? `\n${visa.notes}` : "";
        preSend.push({ text: `${visaEmoji} *Entry requirements*\n${visa.label}${stayText}${notesText}` });
      }
    }
  }

  return {
    nextState,
    nextData: { ...nextData, viewingTripId: tripId },
    reply: { text, buttons },
    ...(preSend.length ? { preSend } : {}),
  };
}
