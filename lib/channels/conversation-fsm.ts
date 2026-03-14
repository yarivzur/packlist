/**
 * Shared conversation finite state machine.
 * Used by both Telegram and WhatsApp handlers.
 * State is persisted in bot_sessions table (DB) — required for serverless.
 */

import { db } from "@/lib/db";
import { botSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTrip } from "@/lib/domain/trips/create";
import type {
  Channel,
  ConversationState,
  ConversationData,
  IncomingMessage,
} from "./interface";

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

  const { nextState, nextData, reply } = await processState(
    state,
    data,
    input,
    session.userId
  );

  // Persist state update
  await db
    .update(botSessions)
    .set({ state: nextState, stateDataJson: nextData, updatedAt: new Date() })
    .where(eq(botSessions.id, session.id));

  await channel.sendMessage(channelUserId, reply);
}

async function processState(
  state: ConversationState,
  data: ConversationData,
  input: string,
  userId: string | null | undefined
): Promise<{
  nextState: ConversationState;
  nextData: ConversationData;
  reply: Parameters<Channel["sendMessage"]>[1];
}> {
  // Handle /start and /newtrip from any state
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
          reply: {
            text: "Please use YYYY-MM-DD format (e.g., 2025-08-14).",
          },
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

      // Create the trip
      if (!userId) {
        return {
          nextState: "IDLE",
          nextData: {},
          reply: {
            text: "You need to link your account first. Visit the web app to sign in.",
          },
        };
      }

      try {
        const trip = await createTrip({
          userId,
          type: newData.tripType!,
          destinationText: newData.destination!,
          startDate: newData.startDate!,
          endDate: newData.endDate!,
          baggageMode: newData.baggage!,
        });

        return {
          nextState: "IDLE",
          nextData: {},
          reply: {
            text: `✅ Trip created!\n\n📍 ${trip.destinationText}\n📅 ${trip.startDate} → ${trip.endDate}\n\nYour checklist is ready! Open the app to view and complete it.`,
            buttons: [[{ label: "📋 View checklist", data: `/checklist:${trip.id}` }]],
          },
        };
      } catch {
        return {
          nextState: "IDLE",
          nextData: {},
          reply: {
            text: "Something went wrong creating your trip. Please try again.",
          },
        };
      }
    }

    default:
      return {
        nextState: "IDLE",
        nextData: {},
        reply: { text: "Type /newtrip to get started." },
      };
  }
}
