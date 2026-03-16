"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TripDetailError({
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
      <Button variant="ghost" size="icon" asChild className="mb-4">
        <Link href="/trips"><ArrowLeft className="h-4 w-4" /></Link>
      </Button>
      <div className="rounded-xl border-2 border-dashed p-12 text-center">
        <div className="text-4xl mb-4">😬</div>
        <h2 className="font-semibold text-lg mb-2">Couldn&apos;t load this trip</h2>
        <p className="text-muted-foreground mb-6">
          Something went sideways loading your packing list. Try again or go back to your trips.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/trips">Back to trips</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
