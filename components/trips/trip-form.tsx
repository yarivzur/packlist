"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type TripType = "business" | "leisure" | "mixed";
type BaggageMode = "carry-on" | "checked" | "unknown";

interface FormData {
  type: TripType | "";
  destinationText: string;
  startDate: string;
  endDate: string;
  baggageMode: BaggageMode | "";
}

const STEPS = ["Trip type", "Destination", "Dates", "Baggage"] as const;

export function TripForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormData>({
    type: "",
    destinationText: "",
    startDate: "",
    endDate: "",
    baggageMode: "",
  });

  const canAdvance = () => {
    switch (step) {
      case 0: return !!data.type;
      case 1: return data.destinationText.length >= 2;
      case 2: return !!data.startDate && !!data.endDate && data.endDate >= data.startDate;
      case 3: return !!data.baggageMode;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          destinationText: data.destinationText,
          startDate: data.startDate,
          endDate: data.endDate,
          baggageMode: data.baggageMode,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create trip");
      }
      const trip = await res.json();
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "border-2 border-primary text-primary"
                  : "border text-muted-foreground"
              )}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-8", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border p-6 space-y-4">
        {step === 0 && (
          <>
            <h2 className="font-semibold text-lg">What&apos;s the vibe?</h2>
            <div className="grid gap-3">
              {([
                { value: "business", label: "✈️ Business", desc: "Meetings, conferences, impressing clients" },
                { value: "leisure", label: "🏖 Leisure", desc: "Pure holiday — sun, fun, or adventure" },
                { value: "mixed", label: "🔀 Mixed", desc: "A little work, a lot of play" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setData((d) => ({ ...d, type: opt.value }))}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                    data.type === opt.value && "border-primary bg-primary/5"
                  )}
                >
                  <span className="text-2xl">{opt.label.split(" ")[0]}</span>
                  <div>
                    <div className="font-medium">{opt.label.split(" ").slice(1).join(" ")}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-semibold text-lg">Where in the world? 🗺️</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="destination">
                Destination
              </label>
              <input
                id="destination"
                type="text"
                placeholder="e.g. Tokyo, Japan"
                value={data.destinationText}
                onChange={(e) => setData((d) => ({ ...d, destinationText: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canAdvance()) setStep((s) => s + 1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll check the forecast and tailor your list to exactly where you&apos;re going.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-lg">When do you head out? 📅</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="startDate">
                  Flying out
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={data.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="endDate">
                  Flying back
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={data.endDate}
                  min={data.startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setData((d) => ({ ...d, endDate: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            {data.startDate && data.endDate && data.endDate < data.startDate && (
              <p className="text-sm text-destructive">Return date must be on or after departure.</p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-lg">How are you flying?</h2>
            <div className="grid gap-3">
              {([
                { value: "carry-on", label: "🎒 Carry-on only", desc: "Packing light — we'll keep the list lean" },
                { value: "checked", label: "🧳 Checked bag", desc: "Room to breathe — bring everything you need" },
                { value: "unknown", label: "🤷 Not sure yet", desc: "No worries, we'll cover all bases" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setData((d) => ({ ...d, baggageMode: opt.value }))}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                    data.baggageMode === opt.value && "border-primary bg-primary/5"
                  )}
                >
                  <span className="text-2xl">{opt.label.split(" ")[0]}</span>
                  <div>
                    <div className="font-medium">{opt.label.split(" ").slice(1).join(" ")}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canAdvance() || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Building your list…" : "Let's pack! ✈️"}
          </Button>
        )}
      </div>
    </div>
  );
}
