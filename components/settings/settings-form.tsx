"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/db/schema";
import { Loader2, Sun, Moon, Monitor } from "lucide-react";

// Common IANA timezone list
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Asia/Jerusalem",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// Common countries for passport / home country selection
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

const THEME_OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

interface SettingsFormProps {
  user: User;
  telegramConnected: boolean;
}

export function SettingsForm({ user, telegramConnected }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [timezone, setTimezone] = useState(user.timezone ?? "UTC");
  const [nationality, setNationality] = useState(user.nationality ?? "");
  const [homeCountry, setHomeCountry] = useState(user.homeCountry ?? "");
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync DB theme preference on first mount (handles cross-device persistence)
    if (user.theme && user.theme !== "system") {
      setTheme(user.theme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    // Persist to DB in the background (fire-and-forget for instant UI response)
    fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    });
  };

  const handleSave = async () => {
    await fetch(`/api/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timezone,
        nationality: nationality || null,
        homeCountry: homeCountry || null,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="flex items-center gap-4">
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? ""} className="h-12 w-12 rounded-full" />
          )}
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-sm transition-colors",
                  mounted && theme === value
                    ? "border-primary bg-primary/10 dark:bg-primary/15 text-primary"
                    : "border-input hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            System follows your device&apos;s dark/light mode setting.
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Preferences</h2>

        {/* Timezone */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Used to calculate reminder times for your trips.
          </p>
        </div>

        {/* Passport country */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="nationality">
            Passport country
          </label>
          <select
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">— Select your passport country —</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Used to check visa requirements when creating a trip.
          </p>
        </div>

        {/* Home country */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="homeCountry">
            Home country
          </label>
          <select
            id="homeCountry"
            value={homeCountry}
            onChange={(e) => setHomeCountry(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">— Select your home country —</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Used to detect power adapter differences at your destination.
          </p>
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </div>

      {/* Connected channels */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Connected channels</h2>
        <p className="text-sm text-muted-foreground">
          Connect a messaging channel to receive reminders and manage checklists via chat.
        </p>
        <div className="space-y-3">
          <TelegramConnectRow connected={telegramConnected} />
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Chat-based checklist + reminders</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Telegram connect row ─────────────────────────────────────────────────────

function TelegramConnectRow({ connected }: { connected: boolean }) {
  const [linking, setLinking] = useState(false);
  const [instruction, setInstruction] = useState<string | null>(null);

  const handleConnect = async () => {
    setLinking(true);
    setInstruction(null);
    try {
      const res = await fetch("/api/users/telegram/link-token", { method: "POST" });
      const { deepLink } = await res.json();
      if (deepLink) {
        window.open(deepLink, "_blank");
        setInstruction("Tap 'Start' in Telegram to link your account. Then come back here and refresh.");
      } else {
        setInstruction("Set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME in your environment to enable deep linking.");
      }
    } catch {
      setInstruction("Something went wrong. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📱</span>
          <div>
            <p className="text-sm font-medium">Telegram</p>
            <p className="text-xs text-muted-foreground">Create trips and manage checklists via chat</p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-600">Connected</span>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={linking}>
            {linking && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Connect
          </Button>
        )}
      </div>
      {instruction && (
        <p className="text-xs text-muted-foreground pl-1">{instruction}</p>
      )}
    </div>
  );
}
