import { NextRequest, NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/domain/reminders/dispatch";
import { dispatchRetroPrompts } from "@/lib/domain/retro/dispatch";

/**
 * Vercel Cron endpoint — called every hour via vercel.json.
 * Protected by CRON_SECRET to prevent unauthorized calls.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const [reminderResults, retroResults] = await Promise.all([
      dispatchDueReminders(),
      dispatchRetroPrompts(),
    ]);

    const sent = reminderResults.filter((r) => r.success).length;
    const failed = reminderResults.filter((r) => !r.success).length;
    const retroNotified = retroResults.filter((r) => r.channelsNotified.length > 0).length;
    const retroSkipped = retroResults.filter((r) => r.skipped).length;

    return NextResponse.json({
      ok: true,
      reminders: { processed: reminderResults.length, sent, failed },
      retro: { processed: retroResults.length, notified: retroNotified, skipped: retroSkipped },
    });
  } catch (err) {
    console.error("[cron] send-reminders failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
