import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { subHours } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export interface ReminderSchedule {
  type: "72h" | "48h" | "24h" | "12h" | "leave";
  sendAt: Date;
}

/**
 * Calculate reminder times relative to the trip departure date.
 * All times are calculated in the user's local timezone.
 */
export function calculateReminderTimes(
  startDate: string, // YYYY-MM-DD
  timezone: string
): ReminderSchedule[] {
  // Departure at 00:00 local time (start of travel day)
  const departureMidnight = fromZonedTime(
    new Date(`${startDate}T08:00:00`), // assume 8am departure as baseline
    timezone
  );

  return [
    {
      type: "72h",
      sendAt: subHours(departureMidnight, 72),
    },
    {
      type: "48h",
      sendAt: subHours(departureMidnight, 48),
    },
    {
      type: "24h",
      sendAt: subHours(departureMidnight, 24),
    },
    {
      type: "12h",
      sendAt: subHours(departureMidnight, 12),
    },
    {
      type: "leave",
      sendAt: subHours(departureMidnight, 2), // 2h before assumed departure
    },
  ];
}

export async function scheduleRemindersForTrip(
  tripId: string,
  startDate: string,
  timezone: string
): Promise<void> {
  const schedules = calculateReminderTimes(startDate, timezone);

  const now = new Date();
  const futureSchedules = schedules.filter((s) => s.sendAt > now);

  if (futureSchedules.length === 0) return;

  await db.insert(reminders).values(
    futureSchedules.map((s) => ({
      tripId,
      type: s.type,
      sendAt: s.sendAt,
      status: "pending" as const,
    }))
  );
}

export async function deleteRemindersForTrip(tripId: string): Promise<void> {
  const { eq, and } = await import("drizzle-orm");
  await db
    .delete(reminders)
    .where(
      and(
        eq(reminders.tripId, tripId),
        eq(reminders.status, "pending")
      )
    );
}
