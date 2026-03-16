import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  CloudSun,
  Globe,
  Luggage,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.packlist.be";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <span className="text-lg font-bold tracking-tight">PackList</span>
          </div>
          <Button asChild size="sm">
            <Link href={`${APP_URL}/login`}>Open app →</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Smart packing for smart travellers
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Pack smarter.{" "}
            <span className="text-primary">Travel happier.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Auto-generated packing lists tailored to your destination, the forecast,
            your trip type, and how you&apos;re travelling. No more forgotten adapters.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="px-8 text-base">
              <Link href={`${APP_URL}/login`}>Get started — it&apos;s free ✈️</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required.
          </p>
        </section>

        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-secondary/40 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              Your list, built for your trip
            </h2>

            <div className="grid gap-8 sm:grid-cols-3">
              <FeatureCard
                icon={<CloudSun className="h-6 w-6 text-primary" />}
                title="Weather-aware"
                description="We check the forecast for your destination and adjust your list automatically. Rain in Amsterdam? Umbrella's already on it."
              />
              <FeatureCard
                icon={<Luggage className="h-6 w-6 text-primary" />}
                title="Trip-smart"
                description="Business trip, beach holiday, or city break — your list adapts to your trip type, duration, and whether you're going carry-on only."
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-primary" />}
                title="Visa & currency"
                description="Know before you go. PackList checks visa requirements for your passport and shows the local currency at your destination."
              />
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              Three steps. Zero forgotten items.
            </h2>

            <div className="grid gap-8 sm:grid-cols-3">
              <Step
                number="1"
                title="Create a trip"
                description="Enter your destination, travel dates, and trip type. Takes about 30 seconds."
              />
              <Step
                number="2"
                title="Get your list"
                description="PackList generates a personalised checklist grouped by category — clothes, toiletries, documents, tech, and more."
              />
              <Step
                number="3"
                title="Pack & tick off"
                description="Work through your list item by item. Quantities are pre-calculated so you know exactly how much to pack."
              />
            </div>
          </div>
        </section>

        {/* ── Bot channels ───────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-secondary/40 py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Also on Telegram &amp; WhatsApp
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Create trips and check your packing list without opening the app — right
              from your favourite messenger.
            </p>

            <div className="mx-auto flex max-w-sm flex-col gap-4 sm:max-w-md sm:flex-row sm:justify-center">
              <div className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-4">
                <Send className="h-5 w-5 text-primary" />
                <span className="font-medium">@PackListBeBot</span>
                <span className="text-sm text-muted-foreground">Telegram</span>
              </div>
              <div className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-4">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">WhatsApp</span>
                <span className="text-sm text-muted-foreground">Connect in settings</span>
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              New to PackList?{" "}
              <Link href="/how-to" className="underline underline-offset-4 hover:text-foreground">
                Read the guide →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────────────── */}
        <section className="py-24 text-center">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight">
              Ready to pack smarter?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
              Join travellers who never forget their adapter, their ESTA, or their
              travel-size shampoo again.
            </p>
            <Button asChild size="lg" className="px-8 text-base">
              <Link href={`${APP_URL}/login`}>Start packing 🎒</Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p>© {new Date().getFullYear()} PackList · <Link href={APP_URL} className="hover:text-foreground underline underline-offset-4">app.packlist.be</Link> · <Link href="/how-to" className="hover:text-foreground underline underline-offset-4">Guide</Link> · <a href="mailto:support@packlist.be" className="hover:text-foreground underline underline-offset-4">support@packlist.be</a> · <a href="https://github.com/yarivzur/packlist" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground underline underline-offset-4"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>GitHub</a></p>
        </div>
      </footer>

    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {number}
      </div>
      <div className="mb-1 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary sm:hidden" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
