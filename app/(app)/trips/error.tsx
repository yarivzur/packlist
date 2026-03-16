"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TripsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="rounded-xl border-2 border-dashed p-12 text-center">
        <div className="text-4xl mb-4">😬</div>
        <h2 className="font-semibold text-lg mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load your trips. It&apos;s probably a blip — try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
