"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";

type TripType = "business" | "leisure" | "mixed";
type BaggageMode = "carry-on" | "checked" | "unknown";

// Common countries for passport / home country selection (matches settings-form.tsx)
const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "South Korea" },
  { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "UAE" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UA", name: "Ukraine" },
  { code: "VN", name: "Vietnam" },
];

interface FormData {
  type: TripType | "";
  destinationText: string;
  startDate: string;
  endDate: string;
  baggageMode: BaggageMode | "";
}

interface TripFormProps {
  /** User's saved passport country — if null, show the passport step in the wizard */
  nationality: string | null;
  /** User's saved home country */
  homeCountry: string | null;
}

export function TripForm({ nationality }: TripFormProps) {
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

  // Passport step state (only used when nationality is not set)
  const [passportNationality, setPassportNationality] = useState("");
  const [savingPassport, setSavingPassport] = useState(false);

  // Show the passport step only if the user hasn't set their nationality yet
  const showPassportStep = nationality === null;

  // Build step labels dynamically
  const STEPS = showPassportStep
    ? (["Trip type", "Destination", "Passport", "Dates", "Baggage"] as const)
    : (["Trip type", "Destination", "Dates", "Baggage"] as const);

  // Map logical steps to content indices
  const dateStepIndex = showPassportStep ? 3 : 2;
  const baggageStepIndex = showPassportStep ? 4 : 3;

  const canAdvance = () => {
    switch (step) {
      case 0: return !!data.type;
      case 1: return data.destinationText.length >= 2;
      case 2:
        if (showPassportStep) return true; // passport step is always skippable
        return !!data.startDate && !!data.endDate && data.endDate >= data.startDate;
      case 3:
        if (showPassportStep) return !!data.startDate && !!data.endDate && data.endDate >= data.startDate;
        return !!data.baggageMode;
      case 4:
        return !!data.baggageMode;
      default: return false;
    }
  };

  const handlePassportNext = async () => {
    // Save nationality to DB if provided, then advance
    if (passportNationality) {
      setSavingPassport(true);
      try {
        await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationality: passportNationality }),
        });
      } catch {
        // Non-blocking — best effort; visa info may be missing for this trip
      } finally {
        setSavingPassport(false);
      }
    }
    setStep((s) => s + 1);
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

  const isLastStep = step === STEPS.length - 1;

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
        {/* Step 0: Trip type */}
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
                    "relative flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    data.type === opt.value
                      ? "border-primary bg-primary/10 dark:bg-primary/15"
                      : "border-input hover:bg-accent"
                  )}
                >
                  {data.type === opt.value && (
                    <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
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

        {/* Step 1: Destination */}
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

        {/* Step 2 (conditional): Passport country — only shown when nationality not set */}
        {showPassportStep && step === 2 && (
          <>
            <div className="space-y-1">
              <h2 className="font-semibold text-lg">What passport do you travel on? 🛂</h2>
              <p className="text-sm text-muted-foreground">
                Used to check visa requirements. You can skip this and add it later in Settings.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="passportNationality">
                Passport country <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select
                id="passportNationality"
                value={passportNationality}
                onChange={(e) => setPassportNationality(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— Select your passport country —</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {passportNationality && (
              <p className="text-xs text-muted-foreground">
                ✓ We&apos;ll check visa requirements for {COUNTRIES.find(c => c.code === passportNationality)?.name ?? passportNationality} passport holders.
              </p>
            )}
          </>
        )}

        {/* Dates step */}
        {step === dateStepIndex && (
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
            {data.startDate && data.endDate && data.endDate < data.startDate && (
              <p className="text-sm text-destructive">Return date must be on or after departure.</p>
            )}
          </>
        )}

        {/* Baggage step */}
        {step === baggageStepIndex && (
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
                    "relative flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    data.baggageMode === opt.value
                      ? "border-primary bg-primary/10 dark:bg-primary/15"
                      : "border-input hover:bg-accent"
                  )}
                >
                  {data.baggageMode === opt.value && (
                    <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
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

        {/* Passport step: custom Next handler that saves nationality */}
        {showPassportStep && step === 2 ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep((s) => s + 1)}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              Skip for now
            </button>
            <Button onClick={handlePassportNext} disabled={savingPassport}>
              {savingPassport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {passportNationality ? "Save & continue" : "Continue"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : !isLastStep ? (
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
