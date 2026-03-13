"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";

type TripType = "business" | "leisure" | "mixed";
type BaggageMode = "carry-on" | "checked" | "unknown";

interface TripEditFormProps {
  tripId: string;
  initialType: TripType;
  initialDestination: string;
  initialStartDate: string;
  initialEndDate: string;
  initialBaggageMode: BaggageMode;
}

export function TripEditForm({
  tripId,
  initialType,
  initialDestination,
  initialStartDate,
  initialEndDate,
  initialBaggageMode,
}: TripEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<TripType>(initialType);
  const [destinationText, setDestinationText] = useState(initialDestination);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [baggageMode, setBaggageMode] = useState<BaggageMode>(initialBaggageMode);

  const isValid =
    !!type &&
    destinationText.length >= 2 &&
    !!startDate &&
    !!endDate &&
    endDate >= startDate &&
    !!baggageMode;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, destinationText, startDate, endDate, baggageMode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      router.push(`/trips/${tripId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      router.push("/trips");
      router.refresh();
    } catch {
      setError("Failed to delete trip");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip type */}
      <div className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Trip type</h2>
        <div className="grid gap-2">
          {(
            [
              { value: "business", label: "✈️ Business", desc: "Meetings, conferences, impressing clients" },
              { value: "leisure", label: "🏖 Leisure", desc: "Pure holiday — sun, fun, or adventure" },
              { value: "mixed", label: "🔀 Mixed", desc: "A little work, a lot of play" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                type === opt.value && "border-primary bg-primary/5"
              )}
            >
              <span className="text-xl">{opt.label.split(" ")[0]}</span>
              <div>
                <div className="font-medium text-sm">{opt.label.split(" ").slice(1).join(" ")}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Destination */}
      <div className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Destination</h2>
        <input
          type="text"
          placeholder="e.g. Berlin, Germany"
          value={destinationText}
          onChange={(e) => setDestinationText(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Dates */}
      <div className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Dates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Departure</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Return</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        {startDate && endDate && endDate < startDate && (
          <p className="text-sm text-destructive">Return date must be on or after departure.</p>
        )}
      </div>

      {/* Baggage */}
      <div className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Packing mode</h2>
        <div className="grid gap-2">
          {(
            [
              { value: "carry-on", label: "🎒 Carry-on only", desc: "Packing light — we'll keep the list lean" },
              { value: "checked", label: "🧳 Checked bag", desc: "Room to breathe — bring everything you need" },
              { value: "unknown", label: "🤷 Not sure yet", desc: "No worries, we'll cover all bases" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBaggageMode(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                baggageMode === opt.value && "border-primary bg-primary/5"
              )}
            >
              <span className="text-xl">{opt.label.split(" ")[0]}</span>
              <div>
                <div className="font-medium text-sm">{opt.label.split(" ").slice(1).join(" ")}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Save button */}
      <Button onClick={handleSave} disabled={!isValid || loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Saving…" : "Save changes"}
      </Button>

      {/* Delete section */}
      <div className="rounded-xl border border-destructive/30 p-5 space-y-3">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          This will permanently remove the trip and everything packed with it. No going back.
        </p>
        {!confirmDelete ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/5"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete trip
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Really? This trip is gone forever.</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {deleting ? "Deleting…" : "Yes, delete"}
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
