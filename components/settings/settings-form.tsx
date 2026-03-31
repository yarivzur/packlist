"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User, ApiKey } from "@/lib/db/schema";
import { Loader2, Sun, Moon, Monitor, Copy, Check, Trash2, Key } from "lucide-react";

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
  whatsappConnected: boolean;
  apiKeys: Pick<ApiKey, "id" | "name" | "createdAt" | "lastUsedAt">[];
}

export function SettingsForm({ user, telegramConnected, whatsappConnected, apiKeys: initialApiKeys }: SettingsFormProps) {
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

      {/* Support */}
      <div className="rounded-xl border p-5 space-y-2">
        <h2 className="font-semibold">Support</h2>
        <p className="text-sm text-muted-foreground">
          Have a question or found a bug?{" "}
          <a
            href="mailto:support@packlist.be"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            support@packlist.be
          </a>
        </p>
      </div>

      {/* Connected channels */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Connected channels</h2>
        <p className="text-sm text-muted-foreground">
          Connect a messaging channel to receive reminders and manage checklists via chat.
        </p>
        <div className="space-y-3">
          <TelegramConnectRow connected={telegramConnected} />
          <WhatsAppConnectRow connected={whatsappConnected} />
        </div>
      </div>

      {/* API Keys */}
      <ApiKeysSection initialKeys={initialApiKeys} />
    </div>
  );
}

// ─── WhatsApp connect row ─────────────────────────────────────────────────────

function WhatsAppConnectRow({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  const handleConnect = async () => {
    setLinking(true);
    setDeepLink(null);
    try {
      const res = await fetch("/api/users/whatsapp/link-token", { method: "POST" });
      const data = await res.json() as { deepLink?: string };
      if (data.deepLink) {
        setDeepLink(data.deepLink);
        window.open(data.deepLink, "_blank");
      }
    } catch {
      // ignore
    } finally {
      setLinking(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/users/whatsapp/disconnect", { method: "DELETE" });
      setConfirmDisconnect(false);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-sm font-medium">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Create trips and manage checklists via chat</p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600">Connected</span>
            </div>
            {confirmDisconnect ? (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="destructive" onClick={handleDisconnect} disabled={disconnecting} className="h-7 text-xs px-2">
                  {disconnecting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDisconnect(false)} className="h-7 text-xs px-2">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmDisconnect(true)} className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive">
                Disconnect
              </Button>
            )}
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={linking}>
            {linking && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Connect
          </Button>
        )}
      </div>
      {deepLink && (
        <div className="text-xs text-muted-foreground pl-1 space-y-1">
          <p>A WhatsApp chat will open with a pre-filled message. Just tap <strong>Send</strong> to link your account.</p>
          <p>
            Link didn&apos;t open?{" "}
            <a href={deepLink} target="_blank" rel="noopener noreferrer" className="underline text-primary">
              Click here
            </a>
            , then refresh this page.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── API Keys section ─────────────────────────────────────────────────────────

function ApiKeysSection({
  initialKeys,
}: {
  initialKeys: Pick<ApiKey, "id" | "name" | "createdAt" | "lastUsedAt">[];
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/users/me/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json() as { id: string; name: string; createdAt: string; key: string };
      setKeys((prev) => [{ id: data.id, name: data.name, createdAt: new Date(data.createdAt), lastUsedAt: null }, ...prev]);
      setNewRawKey(data.key);
      setNewKeyName("");
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!newRawKey) return;
    await navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/users/me/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setConfirmRevoke(null);
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">API Keys</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate keys to access your PackList data from scripts or AI agents.
      </p>

      {/* New key revealed — show once */}
      {newRawKey && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 space-y-2">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-background border px-2 py-1.5 text-xs font-mono break-all">
              {newRawKey}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 h-8 px-2">
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setNewRawKey(null)} className="h-7 text-xs text-muted-foreground">
            I&apos;ve saved it, dismiss
          </Button>
        </div>
      )}

      {/* Existing keys */}
      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(k.createdAt).toLocaleDateString()}
                  {k.lastUsedAt && ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              {confirmRevoke === k.id ? (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="destructive" onClick={() => handleRevoke(k.id)} disabled={revoking === k.id} className="h-7 text-xs px-2">
                    {revoking === k.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Revoke
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmRevoke(null)} className="h-7 text-xs px-2">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setConfirmRevoke(k.id)} className="h-7 px-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate new key */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Key name (e.g. travel agent)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()} size="sm">
          {creating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Generate
        </Button>
      </div>
    </div>
  );
}

// ─── Telegram connect row ─────────────────────────────────────────────────────

function TelegramConnectRow({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  const handleConnect = async () => {
    setLinking(true);
    setDeepLink(null);
    try {
      const res = await fetch("/api/users/telegram/link-token", { method: "POST" });
      const data = await res.json() as { deepLink?: string };
      if (data.deepLink) {
        setDeepLink(data.deepLink);
        window.open(data.deepLink, "_blank");
      }
    } catch {
      // ignore — fallback link will still show if deepLink was set
    } finally {
      setLinking(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/users/telegram/disconnect", { method: "DELETE" });
      setConfirmDisconnect(false);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  };

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "PackListBeBot";

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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600">Connected</span>
            </div>
            {confirmDisconnect ? (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="destructive" onClick={handleDisconnect} disabled={disconnecting} className="h-7 text-xs px-2">
                  {disconnecting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDisconnect(false)} className="h-7 text-xs px-2">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmDisconnect(true)} className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive">
                Disconnect
              </Button>
            )}
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={linking}>
            {linking && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Connect
          </Button>
        )}
      </div>
      {deepLink && (
        <div className="text-xs text-muted-foreground pl-1 space-y-1">
          <p>Open <strong>@{botUsername}</strong> in Telegram and tap <strong>Start</strong> to link your account.</p>
          <p>
            Link didn&apos;t open?{" "}
            <a href={deepLink} target="_blank" rel="noopener noreferrer" className="underline text-primary">
              Click here
            </a>
            , then refresh this page.
          </p>
        </div>
      )}
    </div>
  );
}
