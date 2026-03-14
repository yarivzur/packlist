/**
 * Channel abstraction — defines the interface that all messaging channels implement.
 * Both Telegram and WhatsApp handlers conform to this interface, allowing the
 * conversation state machine to be shared across channels.
 */

export interface IncomingMessage {
  channelUserId: string; // telegram: chat_id, whatsapp: phone number
  text: string;
  callbackData?: string; // button press data
}

export interface OutgoingMessage {
  text: string;
  buttons?: Button[][];
}

export interface Button {
  label: string;
  data?: string; // callback data or quick reply payload (FSM actions)
  url?: string;  // external URL (e.g. "Open in app" deep link)
}

export interface Channel {
  name: "telegram" | "whatsapp";
  sendMessage(channelUserId: string, message: OutgoingMessage): Promise<void>;
}

// ─── Shared conversation state machine ───────────────────────────────────────

export type ConversationState =
  | "IDLE"
  | "ASKING_TRIP_TYPE"
  | "ASKING_DESTINATION"
  | "ASKING_START_DATE"
  | "ASKING_END_DATE"
  | "ASKING_BAGGAGE"
  | "VIEWING_CHECKLIST";

export interface ConversationData {
  tripType?: "business" | "leisure" | "mixed";
  destination?: string;
  startDate?: string;
  endDate?: string;
  baggage?: "carry-on" | "checked" | "unknown";
  viewingTripId?: string;
}
