import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/channels/conversation-fsm";
import { telegramChannel } from "@/lib/channels/telegram/client";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { text?: string };
  };
}

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;

  try {
    if (update.message?.text) {
      await handleMessage(telegramChannel, {
        channelUserId: String(update.message.chat.id),
        text: update.message.text,
      });
    } else if (update.callback_query) {
      const { callback_query: cq } = update;
      // Acknowledge callback query
      if (process.env.TELEGRAM_BOT_TOKEN) {
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: cq.id }),
          }
        );
      }

      await handleMessage(telegramChannel, {
        channelUserId: String(cq.from.id),
        text: cq.data ?? "",
        callbackData: cq.data,
      });
    }
  } catch (err) {
    console.error("[telegram webhook] error:", err);
  }

  return NextResponse.json({ ok: true });
}
