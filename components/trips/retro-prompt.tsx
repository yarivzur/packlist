"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type RetroRating = "too_much" | "just_right" | "forgot_things";

const RATINGS: { value: RetroRating; label: string; emoji: string }[] = [
  { value: "too_much", label: "Overpacked", emoji: "📦" },
  { value: "just_right", label: "Just right", emoji: "✅" },
  { value: "forgot_things", label: "Forgot things", emoji: "😅" },
];

export function RetroPrompt({ tripId }: { tripId: string }) {
  const [rating, setRating] = useState<RetroRating | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"rating" | "note" | "done">("rating");
  const [saving, setSaving] = useState(false);

  async function saveRating(r: RetroRating) {
    setRating(r);
    setStep("note");
  }

  async function saveNote(skipNote = false) {
    if (!rating) return;
    setSaving(true);
    try {
      await fetch(`/api/trips/${tripId}/retro`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          ...(note.trim() && !skipNote ? { note: note.trim() } : {}),
        }),
      });
      setStep("done");
    } finally {
      setSaving(false);
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-xl border bg-muted/30 px-4 py-4 flex items-center gap-3">
        <span className="text-2xl">🙌</span>
        <p className="text-sm text-muted-foreground">
          Thanks for the feedback — I&apos;ll use it to personalise your next list.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">✈️</span>
        <p className="text-sm font-medium">
          {step === "rating"
            ? "You're back! How did packing go?"
            : "Anything you want to remember for next time?"}
        </p>
      </div>

      {step === "rating" && (
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <Button
              key={r.value}
              variant="outline"
              size="sm"
              onClick={() => saveRating(r.value)}
              className="gap-1.5"
            >
              <span>{r.emoji}</span>
              {r.label}
            </Button>
          ))}
        </div>
      )}

      {step === "note" && (
        <div className="space-y-2">
          <textarea
            placeholder='e.g. "always forget charger" or "packed too many shoes"'
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => saveNote(false)}
              disabled={saving || !note.trim()}
            >
              Save note
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => saveNote(true)}
              disabled={saving}
            >
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
