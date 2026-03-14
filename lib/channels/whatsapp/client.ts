import type { Channel, OutgoingMessage } from "../interface";

const GRAPH_API_VERSION = "v19.0";

export const whatsappChannel: Channel = {
  name: "whatsapp",

  async sendMessage(phone: string, message: OutgoingMessage): Promise<void> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      throw new Error("WhatsApp credentials not configured");
    }

    // Build text + quick reply buttons (WhatsApp interactive message)
    let body: Record<string, unknown>;

    // WhatsApp quick-reply buttons only support callback (data) buttons — skip URL-only buttons
    const callbackButtons = message.buttons?.flat().filter((btn) => btn.data) ?? [];

    if (callbackButtons.length) {
      const flatButtons = callbackButtons.slice(0, 3); // WA max 3 quick reply buttons
      body = {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message.text },
          action: {
            buttons: flatButtons.map((btn) => ({
              type: "reply",
              reply: {
                id: btn.data!,
                title: btn.label.slice(0, 20), // WA button label max 20 chars
              },
            })),
          },
        },
      };
    } else {
      body = {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message.text },
      };
    }

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp sendMessage failed: ${err}`);
    }
  },
};
