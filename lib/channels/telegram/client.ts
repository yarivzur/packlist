import type { Channel, OutgoingMessage } from "../interface";

export const telegramChannel: Channel = {
  name: "telegram",

  async sendMessage(chatId: string, message: OutgoingMessage): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: message.text,
      parse_mode: "Markdown",
    };

    // Convert buttons to Telegram inline keyboard
    if (message.buttons?.length) {
      payload.reply_markup = {
        inline_keyboard: message.buttons.map((row) =>
          row.map((btn) => ({
            text: btn.label,
            callback_data: btn.data,
          }))
        ),
      };
    }

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Telegram sendMessage failed: ${err}`);
    }
  },
};
