import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/channels/conversation-fsm";
import { whatsappChannel } from "@/lib/channels/whatsapp/client";

interface WAMessage {
  from: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
  };
}

interface WAValue {
  messages?: WAMessage[];
}

interface WAChange {
  value: WAValue;
}

interface WAEntry {
  changes: WAChange[];
}

interface WAWebhookBody {
  object: string;
  entry: WAEntry[];
}

// GET — webhook verification (Meta challenge)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — incoming messages
export async function POST(req: NextRequest) {
  const body = (await req.json()) as WAWebhookBody;

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true });
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value.messages ?? []) {
        try {
          let text = "";
          let callbackData: string | undefined;

          if (msg.type === "text" && msg.text?.body) {
            text = msg.text.body;
          } else if (msg.type === "interactive") {
            const reply = msg.interactive?.button_reply;
            if (reply) {
              callbackData = reply.id;
              text = reply.title;
            }
          }

          if (text || callbackData) {
            await handleMessage(whatsappChannel, {
              channelUserId: msg.from,
              text,
              callbackData,
            });
          }
        } catch (err) {
          console.error("[whatsapp webhook] error:", err);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
