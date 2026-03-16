import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Send,
  Smartphone,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.packlist.be";

export const metadata = {
  title: "How to connect — PackList",
  description:
    "Step-by-step guide to connecting PackList to Telegram or WhatsApp so you can create trips and check your packing list right from your messenger.",
};

export default function HowToPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🎒</span>
            <span className="text-lg font-bold tracking-tight">PackList</span>
          </Link>
          <Button asChild size="sm">
            <Link href={`${APP_URL}/login`}>Open app →</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <h1 className="mt-4 mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Connect PackList to your messenger
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Once connected, you can create trips, view your packing list, and tick
            off items — without opening the app.
          </p>
        </section>

        {/* ── Telegram ───────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Telegram</h2>
                <p className="text-sm text-muted-foreground">@PackListBeBot</p>
              </div>
            </div>

            <div className="space-y-6">
              <Step
                number="1"
                title="Sign in to PackList"
                description={
                  <>
                    Go to{" "}
                    <a
                      href={`${APP_URL}/login`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      app.packlist.be
                    </a>{" "}
                    and sign in with Google.
                  </>
                }
              />
              <Step
                number="2"
                title="Open Settings"
                description='Tap your avatar or go to Settings from the navigation. Scroll down to the "Connected channels" section.'
              />
              <Step
                number="3"
                title='Click "Connect Telegram"'
                description="A button will appear that opens Telegram with @PackListBeBot pre-selected. Tap it."
              />
              <Step
                number="4"
                title='Press "Start" in the bot chat'
                description="Telegram will open a chat with @PackListBeBot. Hit the Start button (or send /start) — the bot will confirm your account is linked. ✅"
              />
              <Step
                number="5"
                title="You're all set"
                description='Type /newtrip to create your first trip from Telegram, or /checklist to view a list for an existing trip.'
              />
            </div>

            <div className="mt-10">
              <Button asChild>
                <a
                  href={`${APP_URL}/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to Settings to connect →
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── WhatsApp ───────────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-secondary/40 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">WhatsApp</h2>
                <p className="text-sm text-muted-foreground">Via WhatsApp Business</p>
              </div>
            </div>

            <div className="space-y-6">
              <Step
                number="1"
                title="Sign in to PackList"
                description={
                  <>
                    Go to{" "}
                    <a
                      href={`${APP_URL}/login`}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      app.packlist.be
                    </a>{" "}
                    and sign in with Google.
                  </>
                }
              />
              <Step
                number="2"
                title="Open Settings"
                description='Tap your avatar or go to Settings from the navigation. Scroll down to the "Connected channels" section.'
              />
              <Step
                number="3"
                title='Click "Connect WhatsApp"'
                description="This opens WhatsApp (or wa.me on desktop) with a pre-filled message containing your personal link code. Don't change the message."
              />
              <Step
                number="4"
                title="Send the pre-filled message"
                description="Just hit Send — the PackList bot reads your link code and ties the WhatsApp number to your account. ✅"
              />
              <Step
                number="5"
                title="You're all set"
                description="The bot will confirm the connection. From now on you can type newtrip to start a trip, or ask for your checklist anytime."
              />
            </div>

            <div className="mt-10">
              <Button asChild>
                <a
                  href={`${APP_URL}/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to Settings to connect →
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-10 text-2xl font-bold tracking-tight">
              Common questions
            </h2>

            <div className="space-y-8">
              <FaqItem
                question="Can I use both Telegram and WhatsApp?"
                answer="Yes. You can connect both at the same time. Your trips and checklists are shared — create a trip on the web and it'll show up in both bots."
              />
              <FaqItem
                question="What can the bot actually do?"
                answer="Create new trips (guided step-by-step), view and tick off items in your packing list, and send you reminders before departure. Everything else (editing, settings, retro ratings) is done in the web app."
              />
              <FaqItem
                question="I sent the WhatsApp message but nothing happened."
                answer="Make sure you didn't edit the pre-filled message before sending — the link code needs to be intact. If it still doesn't work, disconnect and try connecting again from Settings."
              />
              <FaqItem
                question="I pressed Start in Telegram but the bot didn't respond."
                answer="The link is single-use and expires after 15 minutes. Go back to Settings and generate a fresh link, then try again."
              />
              <FaqItem
                question="Do I need to create an account first?"
                answer="Yes — the bot is an extension of your PackList account. Sign in at app.packlist.be first, then connect from Settings."
              />
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-secondary/40 py-16 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <Smartphone className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-2xl font-bold tracking-tight">
              Still need help?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Drop us a line and we&apos;ll get you sorted.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:support@packlist.be">Email support →</a>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p>
            © {new Date().getFullYear()} PackList ·{" "}
            <Link href="/" className="hover:text-foreground underline underline-offset-4">
              packlist.be
            </Link>{" "}
            ·{" "}
            <a
              href="mailto:support@packlist.be"
              className="hover:text-foreground underline underline-offset-4"
            >
              support@packlist.be
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <h3 className="font-semibold">{question}</h3>
      </div>
      <p className="ml-6 text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}
