/**
 * Register (or update) the Telegram webhook for this bot.
 *
 * Usage:
 *   npx tsx scripts/register-telegram-webhook.ts https://yourapp.vercel.app
 *
 * The script reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from the
 * environment (via .env.local / dotenv).
 */

import "dotenv/config";

const [, , webhookBase] = process.argv;

if (!webhookBase) {
  console.error("Usage: npx tsx scripts/register-telegram-webhook.ts <BASE_URL>");
  console.error("  e.g. npx tsx scripts/register-telegram-webhook.ts https://yourapp.vercel.app");
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set in the environment.");
  process.exit(1);
}

const webhookUrl = `${webhookBase.replace(/\/$/, "")}/api/webhooks/telegram`;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl,
    ...(secret ? { secret_token: secret } : {}),
    allowed_updates: ["message", "callback_query"],
  }),
});

const result = await res.json();

if (result.ok) {
  console.log(`✅ Webhook registered: ${webhookUrl}`);
} else {
  console.error("❌ Failed to register webhook:", result.description);
  process.exit(1);
}
