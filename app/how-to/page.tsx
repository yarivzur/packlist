import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  Bot,
  Brain,
  CloudSun,
  Globe,
  Luggage,
  MessageCircle,
  Plug,
  Send,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.packlist.be";

export const metadata = {
  title: "Guide — PackList",
  description:
    "Everything you need to know about PackList — creating trips, how your list is generated, weather, visa checks, reminders, and connecting Telegram or WhatsApp.",
};

const NAV_ITEMS = [
  { id: "creating-a-trip",   label: "Creating a trip" },
  { id: "your-list",         label: "Your packing list" },
  { id: "weather",           label: "Weather" },
  { id: "visa-documents",    label: "Visa & documents" },
  { id: "personalising",     label: "Personalising" },
  { id: "power-adapters",    label: "Power adapters" },
  { id: "reminders",         label: "Reminders" },
  { id: "retro",             label: "Post-trip retro" },
  { id: "telegram",          label: "Connecting Telegram" },
  { id: "whatsapp",          label: "Connecting WhatsApp" },
  { id: "mcp",               label: "AI agents & MCP" },
  { id: "faq",               label: "FAQ" },
];

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
        <section className="mx-auto max-w-5xl px-6 py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <h1 className="mt-6 mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            How PackList works
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Everything you need to know — from creating your first trip to
            connecting the bot on your favourite messenger.
          </p>
        </section>

        {/* ── Body: sidebar + content ─────────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-6 pb-24">
          <div className="flex gap-14">

            {/* Sticky sidebar nav — desktop only */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <nav className="sticky top-24 space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  On this page
                </p>
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-16">

              {/* ── Creating a trip ────────────────────────────────────────── */}
              <Section
                id="creating-a-trip"
                icon={<Luggage className="h-5 w-5 text-primary" />}
                title="Creating a trip"
              >
                <p>
                  Hit <strong>New trip</strong> from the dashboard. A short wizard walks you
                  through five steps — the whole thing takes about 30 seconds.
                </p>
                <StepList steps={[
                  { title: "Trip type", body: "Choose from Holiday, Business, City break, Beach, or Adventure. This shapes which items appear on your list." },
                  { title: "Destination", body: "Type a city or country. PackList uses this to fetch the weather forecast and check visa requirements for your passport." },
                  { title: "Passport nationality", body: "Shown only if you haven't set a nationality in Settings yet. You can skip it, but setting it unlocks the visa check. You can always add it later in Settings." },
                  { title: "Travel dates", body: "Start and end date. The number of nights drives quantities — how many t-shirts, pairs of socks, etc." },
                  { title: "Baggage mode", body: "Choose Checked baggage or Carry-on only. Carry-on mode removes bulky items (like a full-size hairdryer) and adds a reminder for the 100 ml liquids rule." },
                ]} />
                <p>
                  Once you confirm, PackList fetches the forecast, runs the rules engine,
                  and drops you straight into your personalised checklist.
                </p>
              </Section>

              {/* ── Your packing list ──────────────────────────────────────── */}
              <Section
                id="your-list"
                icon={<Sparkles className="h-5 w-5 text-primary" />}
                title="Your packing list"
              >
                <p>
                  Your list is grouped by category — <em>Clothing</em>, <em>Toiletries</em>,{" "}
                  <em>Documents</em>, <em>Tech</em>, <em>Health</em>, and more — so you can
                  pack one bag compartment at a time.
                </p>
                <FeatureList items={[
                  { title: "Tap to tick", body: "Tap any item to mark it packed. Ticked items move to the bottom so you always see what's left." },
                  { title: "Quantities pre-calculated", body: "Clothing items show a quantity badge: underwear = days + 1, t-shirts = roughly 80% of days, etc. Carry-on mode keeps quantities conservative." },
                  { title: "Delete items you don't need", body: "Swipe or hover to reveal the trash icon. Deleted items don't come back when you refresh." },
                  { title: "Priority items at the top", body: "Visa documents and adapter reminders are injected at the top of their categories so you can't miss them." },
                ]} />
              </Section>

              {/* ── Weather ────────────────────────────────────────────────── */}
              <Section
                id="weather"
                icon={<CloudSun className="h-5 w-5 text-primary" />}
                title="Weather"
              >
                <p>
                  PackList uses <strong>Open-Meteo</strong> — a free, no-API-key weather
                  service — to fetch the forecast for your destination during your trip dates.
                  No account or payment needed on your end; it just works.
                </p>
                <FeatureList items={[
                  { title: "Live forecast (trips up to 16 days out)", body: "The standard 16-day forecast is fetched at trip creation time. If the average high exceeds 20 °C, warm-weather items are added automatically — sunscreen, sunglasses, a hat, swimwear." },
                  { title: "Historical climate (trips further than 16 days)", body: "For trips further in the future, PackList falls back to the same date range from the previous year\u2019s archive data. Your checklist page shows a small note: \u201cBased on last year\u2019s climate.\u201d Accuracy is good for typical seasonal weather; it won\u2019t predict a freak heatwave." },
                  { title: "No weather data", body: "If the fetch fails entirely (rare network issue), your list is generated without weather adjustments. You can always add items manually." },
                ]} />
              </Section>

              {/* ── Visa & documents ───────────────────────────────────────── */}
              <Section
                id="visa-documents"
                icon={<Globe className="h-5 w-5 text-primary" />}
                title="Visa & documents"
              >
                <p>
                  If you've set your nationality in Settings, PackList checks whether you
                  need a visa for your destination and shows the result as a badge on your
                  trip page.
                </p>
                <FeatureList items={[
                  { title: "Visa-free 🟢", body: "No visa needed. Your passport alone is sufficient." },
                  { title: "ETA / ESTA required 🟡", body: "Entry is easy but you need to apply online before travel — for example, ESTA for US-bound trips from VWP countries, or an eTA for Canada." },
                  { title: "Visa required 🔴", body: "You'll need to apply for a visa in advance. A high-priority checklist item is injected as a reminder." },
                  { title: "Visa on arrival 🟡", body: "Available at the border, but the checklist item reminds you to check current conditions." },
                ]} />
                <p className="text-sm text-muted-foreground">
                  <strong>Coverage:</strong> 13 nationalities × 50+ destinations, with full
                  Visa Waiver Program (ESTA) logic built in. If your corridor isn&apos;t covered,
                  the badge is hidden and no visa item is injected — the list is still fully
                  usable. Always verify requirements with the official embassy before travel.
                </p>
              </Section>

              {/* ── Personalising ──────────────────────────────────────────── */}
              <Section
                id="personalising"
                icon={<Brain className="h-5 w-5 text-primary" />}
                title="Personalising your list"
              >
                <p>
                  The more PackList knows about you, the more tailored your lists become.
                  Open <strong>Settings</strong> to configure:
                </p>
                <FeatureList items={[
                  { title: "Nationality", body: "Drives the visa check. Without this, no visa badge is shown and no visa items are injected." },
                  { title: "Home country", body: "Used to determine your native plug type for the power adapter check (see below)." },
                  { title: "Currency awareness", body: "The \"Local currency\" checklist item is personalised automatically — e.g. \"Local currency — Japanese Yen (JPY) or Revolut/Wise\" — based on your destination country. 80+ countries covered." },
                  { title: "Trip type", body: "Business trips add work-specific items (laptop, adapters, business cards). Beach trips add swimwear and suncare items on top of the weather check." },
                ]} />
              </Section>

              {/* ── Power adapters ─────────────────────────────────────────── */}
              <Section
                id="power-adapters"
                icon={<Plug className="h-5 w-5 text-primary" />}
                title="Power adapters"
              >
                <p>
                  PackList cross-references your home country&apos;s plug type against
                  the plug types used at your destination. If they differ, it injects
                  a specific adapter item — for example <em>&quot;Power adapter — Type G (UK/Ireland)&quot;</em> — into
                  your Tech category so you know exactly what to buy.
                </p>
                <FeatureList items={[
                  { title: "80+ destination countries covered", body: "Includes all common travel destinations with their plug types and voltages." },
                  { title: "Voltage warning", body: "If the destination voltage differs from your home country (e.g. 110 V vs 230 V), an additional item reminds you to check device compatibility." },
                  { title: "No duplicate items", body: "If your home plug is compatible with the destination (e.g. both use Type C), no adapter item is added." },
                ]} />
                <p className="text-sm text-muted-foreground">
                  Make sure your <strong>Home country</strong> is set in Settings for this to work.
                  Without it, no adapter item is injected.
                </p>
              </Section>

              {/* ── Reminders ──────────────────────────────────────────────── */}
              <Section
                id="reminders"
                icon={<Bell className="h-5 w-5 text-primary" />}
                title="Reminders"
              >
                <p>
                  PackList sends packing reminders so you&apos;re not scrambling the night
                  before departure. They&apos;re sent via whichever bot channel you&apos;ve connected
                  (Telegram and/or WhatsApp).
                </p>
                <FeatureList items={[
                  { title: "When reminders fire", body: "A reminder is sent a few days before your trip and again the evening before departure — calculated from your trip start date and your timezone." },
                  { title: "Timezone setting", body: "Set your timezone in Settings so reminders arrive at a sensible local time, not 3 am." },
                  { title: "No bot connected?", body: "Reminders require a connected bot channel. If neither Telegram nor WhatsApp is connected, no reminder is sent." },
                ]} />
              </Section>

              {/* ── Post-trip retro ────────────────────────────────────────── */}
              <Section
                id="retro"
                icon={<Star className="h-5 w-5 text-primary" />}
                title="Post-trip retro"
              >
                <p>
                  The day after your trip ends, PackList asks how packing went. Your
                  answers make future lists smarter.
                </p>
                <FeatureList items={[
                  { title: "Three ratings", body: "\"Too much stuff\", \"Just right\", or \"I forgot things\". Takes two taps — in the bot or on the trip page in the app." },
                  { title: "Optional note", body: "After rating, you can add a free-text note — useful for remembering what you actually forgot." },
                  { title: "\"Often skipped\" intelligence", body: "If you consistently leave an item unchecked across two or more similar trips, it gets a 💤 label in future lists so you can decide whether to ditch it entirely." },
                  { title: "Tip banners", body: "If your last few retros show a pattern (always over-packing, or always forgetting something), a 🧠 banner appears at the top of your next list with a nudge." },
                ]} />
              </Section>

              {/* ── Telegram ───────────────────────────────────────────────── */}
              <Section
                id="telegram"
                icon={<Send className="h-5 w-5 text-primary" />}
                title="Connecting Telegram"
                subtitle="@PackListBeBot"
              >
                <StepList steps={[
                  { title: "Sign in to PackList", body: <>Go to <a href={`${APP_URL}/login`} className="underline underline-offset-4 hover:text-foreground">app.packlist.be</a> and sign in.</> },
                  { title: "Open Settings", body: "Tap your avatar or navigate to Settings. Scroll to the \"Connected channels\" section." },
                  { title: "Click \"Connect Telegram\"", body: "A button opens Telegram with @PackListBeBot pre-selected." },
                  { title: "Press Start in the bot chat", body: "Telegram opens a chat with @PackListBeBot. Hit Start (or send /start) — the bot confirms your account is linked. ✅" },
                  { title: "You're set", body: "Type /newtrip to create a trip, or /checklist to view an existing one." },
                ]} />
                <Callout>
                  The link is single-use and expires after <strong>15 minutes</strong>. If
                  nothing happens, go back to Settings and generate a fresh link.
                </Callout>
              </Section>

              {/* ── WhatsApp ───────────────────────────────────────────────── */}
              <Section
                id="whatsapp"
                icon={<MessageCircle className="h-5 w-5 text-primary" />}
                title="Connecting WhatsApp"
              >
                <StepList steps={[
                  { title: "Sign in to PackList", body: <>Go to <a href={`${APP_URL}/login`} className="underline underline-offset-4 hover:text-foreground">app.packlist.be</a> and sign in.</> },
                  { title: "Open Settings", body: "Tap your avatar or navigate to Settings. Scroll to the \"Connected channels\" section." },
                  { title: "Click \"Connect WhatsApp\"", body: "This opens WhatsApp (or wa.me on desktop) with a pre-filled message containing your personal link code. Don't change the message." },
                  { title: "Send the pre-filled message", body: "Just tap Send — PackList reads your link code and ties the WhatsApp number to your account. ✅" },
                  { title: "You're set", body: "The bot confirms the connection. Type newtrip to create a trip from WhatsApp." },
                ]} />
                <Callout>
                  Make sure you send the message exactly as pre-filled — editing it will
                  break the link code. If it doesn&apos;t work, disconnect and try again from Settings.
                </Callout>
              </Section>

              {/* ── AI agents & MCP ────────────────────────────────────────── */}
              <Section
                id="mcp"
                icon={<Bot className="h-5 w-5 text-primary" />}
                title="AI agents & MCP"
                subtitle="Let an AI agent manage your trips"
              >
                <p>
                  PackList exposes a <strong>Model Context Protocol (MCP) server</strong> that
                  lets any MCP-compatible AI agent — like{" "}
                  <a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">OpenClaw</a>{" "}
                  or{" "}
                  <a href="https://claude.ai/claude-code" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Claude Code</a>{" "}
                  — create trips, read checklists, and tick items on your behalf, without
                  ever opening the app.
                </p>

                <h3 className="font-semibold text-foreground pt-2">Step 1 — Generate an API key</h3>
                <StepList steps={[
                  { title: "Sign in", body: <>Go to <a href={`${APP_URL}/settings`} className="underline underline-offset-4 hover:text-foreground">Settings</a> in the app.</> },
                  { title: "API Keys section", body: "Scroll to the API Keys card at the bottom of Settings." },
                  { title: "Name and generate", body: "Give your key a name (e.g. \"travel agent\") and click Generate." },
                  { title: "Copy the key", body: "The key starts with pk_... and is shown exactly once. Copy it somewhere safe — it can't be retrieved later. You can revoke and create a new one at any time." },
                ]} />

                <h3 className="font-semibold text-foreground pt-2">Step 2 — Run the MCP server</h3>
                <p>
                  The MCP server lives in the PackList repository. Clone it to the machine
                  where your agent runs:
                </p>
                <CodeBlock>{`git clone https://github.com/yarivzur/packlist
cd packlist
npm install`}</CodeBlock>
                <p>Then start the server, passing your API key:</p>
                <CodeBlock>{`PACKLIST_API_URL=https://app.packlist.be \\
PACKLIST_API_KEY=pk_... \\
npx tsx mcp/server.ts`}</CodeBlock>
                <p>
                  The server communicates over <strong>stdio</strong> — your agent framework
                  spawns it as a child process. You don&apos;t need to keep it running manually.
                </p>

                <h3 className="font-semibold text-foreground pt-2">Step 3 — Register with your agent</h3>
                <p><strong>OpenClaw:</strong></p>
                <CodeBlock>{`openclaw mcp set packlist '{
  "type": "stdio",
  "command": "npx",
  "args": ["tsx", "/absolute/path/to/packlist/mcp/server.ts"],
  "env": {
    "PACKLIST_API_URL": "https://app.packlist.be",
    "PACKLIST_API_KEY": "pk_..."
  }
}'`}</CodeBlock>
                <p><strong>Claude Code</strong> — add to <code className="rounded bg-secondary px-1 py-0.5 text-xs">~/.claude/settings.json</code>:</p>
                <CodeBlock>{`{
  "mcpServers": {
    "packlist": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/packlist/mcp/server.ts"],
      "env": {
        "PACKLIST_API_URL": "https://app.packlist.be",
        "PACKLIST_API_KEY": "pk_..."
      }
    }
  }
}`}</CodeBlock>

                <h3 className="font-semibold text-foreground pt-2">Available tools</h3>
                <FeatureList items={[
                  { title: "list_trips", body: <>Lists your trips. Supports a <code className="rounded bg-secondary px-1 py-0.5 text-xs">filter</code> parameter: <code className="rounded bg-secondary px-1 py-0.5 text-xs">upcoming</code> (current &amp; future), <code className="rounded bg-secondary px-1 py-0.5 text-xs">past</code>, or <code className="rounded bg-secondary px-1 py-0.5 text-xs">all</code> (default).</> },
                  { title: "create_trip", body: "Creates a new trip — triggers weather fetch, visa check, and checklist generation automatically." },
                  { title: "get_trip", body: "Returns full trip details including cached weather and visa data." },
                  { title: "get_checklist", body: "Returns all checklist items for a trip, with category, done status, quantity, and rationale." },
                  { title: "toggle_item", body: "Marks a checklist item as packed or unpacked." },
                  { title: "add_item", body: "Adds a custom item to a trip's checklist." },
                  { title: "delete_item", body: "Removes an item from a checklist." },
                  { title: "delete_trip", body: "Permanently deletes a trip and all its items." },
                  { title: "regenerate_checklist", body: "Re-runs the rules engine for a trip — useful after updating your profile settings." },
                  { title: "update_profile", body: "Updates your nationality, home country, or timezone." },
                ]} />

                <Callout>
                  API keys are scoped to your account — they give access only to your own
                  trips. You can generate multiple keys (one per agent or device) and revoke
                  any of them individually from Settings at any time.
                </Callout>
              </Section>

              {/* ── FAQ ────────────────────────────────────────────────────── */}
              <Section
                id="faq"
                icon={<Smartphone className="h-5 w-5 text-primary" />}
                title="FAQ"
              >
                <div className="space-y-6">
                  <FaqItem
                    question="Can I use both Telegram and WhatsApp at the same time?"
                    answer="Yes. Connect both from Settings. Your trips and lists are shared — create a trip on the web and it'll show up in both bots."
                  />
                  <FaqItem
                    question="Can I add my own items to the list?"
                    answer="Not yet — item deletion is supported but custom item addition is on the roadmap. In the meantime, quantities and categories auto-adapt to your trip so the list should cover most needs."
                  />
                  <FaqItem
                    question="Is the visa check accurate?"
                    answer="It's a good starting point but not a legal source. Coverage is 13 nationalities × 50+ destinations. Always verify entry requirements with the official embassy or consulate before you travel."
                  />
                  <FaqItem
                    question="Why does my list show &quot;based on last year&apos;s climate&quot;?"
                    answer="Weather forecasts only go 16 days out. For trips further ahead, PackList uses the same date range from the previous year's archive as a proxy for typical seasonal weather."
                  />
                  <FaqItem
                    question="I deleted an item by accident. Can I get it back?"
                    answer="Not directly — but if you recreate the trip, the item will reappear. Undo for deleted items is on the roadmap."
                  />
                  <FaqItem
                    question="Do I need the app to use the bot?"
                    answer="For the initial connection, yes — sign in at app.packlist.be and connect from Settings. Once linked, you can create and manage trips entirely through the bot."
                  />
                </div>
              </Section>

              {/* ── Support CTA ────────────────────────────────────────────── */}
              <div className="rounded-xl border border-border bg-secondary/40 p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">Still stuck?</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  We&apos;re a small team and we actually read support emails.
                </p>
                <Button asChild variant="outline">
                  <a href="mailto:support@packlist.be">Email support →</a>
                </Button>
              </div>

            </div>
          </div>
        </div>

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

function Section({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-[52px]">
        {children}
      </div>
    </section>
  );
}

function StepList({ steps }: { steps: { title: string; body: React.ReactNode }[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
            {i + 1}
          </div>
          <div>
            <span className="font-semibold text-foreground">{step.title} — </span>
            <span>{step.body}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureList({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i}>
          <span className="font-semibold text-foreground">{item.title} — </span>
          <span>{item.body}</span>
        </li>
      ))}
    </ul>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="mb-1 font-semibold text-foreground">{question}</h3>
      <p>{answer}</p>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm">
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/60 px-4 py-3 text-xs font-mono leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}
