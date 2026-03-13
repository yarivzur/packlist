import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reminders, trips } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const REMINDER_LABELS: Record<string, string> = {
  "72h": "72 hours before",
  "48h": "48 hours before",
  "24h": "24 hours before",
  "12h": "12 hours before",
  leave: "Time to leave",
};

export default async function RemindersPage() {
  const session = await auth();
  const now = new Date();

  const rows = await db
    .select({ reminder: reminders, trip: trips })
    .from(reminders)
    .innerJoin(trips, eq(trips.id, reminders.tripId))
    .where(eq(trips.userId, session!.user!.id!))
    .orderBy(reminders.sendAt);

  const upcoming = rows.filter((r) => r.reminder.sendAt > now && r.reminder.status === "pending");
  const past = rows.filter((r) => r.reminder.sendAt <= now || r.reminder.status !== "pending");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          So you never leave without the essentials.
        </p>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reminders yet — plan a trip and we'll keep you on track!</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h2>
          {upcoming.map(({ reminder, trip }) => (
            <ReminderRow key={reminder.id} reminder={reminder} trip={trip} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h2>
          {past.slice(0, 10).map(({ reminder, trip }) => (
            <ReminderRow key={reminder.id} reminder={reminder} trip={trip} isPast />
          ))}
        </section>
      )}
    </div>
  );
}

function ReminderRow({
  reminder,
  trip,
  isPast,
}: {
  reminder: typeof reminders.$inferSelect;
  trip: typeof trips.$inferSelect;
  isPast?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border p-4 ${isPast ? "opacity-60" : ""}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-lg">
        ⏰
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{trip.destinationText}</p>
        <p className="text-xs text-muted-foreground">{REMINDER_LABELS[reminder.type]}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium">{formatDate(reminder.sendAt)}</p>
        <Badge
          variant={reminder.status === "sent" ? "secondary" : reminder.status === "failed" ? "destructive" : "outline"}
          className="text-xs"
        >
          {reminder.status}
        </Badge>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
