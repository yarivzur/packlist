import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-6xl">✈️</div>
        <h1 className="text-4xl font-bold tracking-tight">PackList</h1>
        <p className="text-lg text-muted-foreground">
          You&apos;re going somewhere — we&apos;ll make sure you don&apos;t forget a thing.
          Smart packing lists built around your destination, the weather, and how you travel.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Let&apos;s go ✈️</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Free to use. No credit card required.
        </p>
      </div>
    </main>
  );
}
