import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/lib/db/schema";
import { ChevronRight } from "lucide-react";
import { countryCodeToFlag } from "@/lib/utils/country-flag";

const TRIP_TYPE_LABELS: Record<string, string> = {
  business: "Business",
  leisure: "Leisure",
  mixed: "Mixed",
};

const BAGGAGE_LABELS: Record<string, string> = {
  "carry-on": "Carry-on",
  checked: "Checked bag",
  unknown: "",
};

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const daysUntil = getDaysUntil(trip.startDate);
  const flag = countryCodeToFlag(trip.destinationCountry);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {flag || "🌍"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{trip.destinationText}</h3>
              <p className="text-sm text-muted-foreground">
                {trip.startDate} → {trip.endDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <Badge variant="secondary">{TRIP_TYPE_LABELS[trip.type]}</Badge>
              {BAGGAGE_LABELS[trip.baggageMode] && (
                <span className="text-xs text-muted-foreground">
                  {BAGGAGE_LABELS[trip.baggageMode]}
                </span>
              )}
              {daysUntil !== null && (
                <span className={`text-xs font-medium ${daysUntil <= 2 ? "text-destructive" : daysUntil <= 7 ? "text-yellow-600" : "text-muted-foreground"}`}>
                  {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d away`}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/trips/${trip.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getDaysUntil(startDate: string): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departure = new Date(startDate);
  departure.setHours(0, 0, 0, 0);
  const diff = Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null; // past trip
  return diff;
}
