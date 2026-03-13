import { NextRequest, NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/domain/reminders/dispatch";

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
    const results = await dispatchDueReminders();
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      ok: true,
      processed: results.length,
      sent,
      failed,
      results,
    });
  } catch (err) {
    console.error("[cron] send-reminders failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
