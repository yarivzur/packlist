#!/usr/bin/env npx tsx
/**
 * PackList MCP Server
 *
 * Exposes PackList trip and checklist management as MCP tools so AI agents
 * can create trips, browse checklists, and tick items on your behalf.
 *
 * Usage:
 *   PACKLIST_API_URL=https://app.packlist.be \
 *   PACKLIST_API_KEY=pk_... \
 *   npx tsx mcp/server.ts
 *
 * Claude Code config (~/.claude/settings.json):
 *   {
 *     "mcpServers": {
 *       "packlist": {
 *         "command": "npx",
 *         "args": ["tsx", "/absolute/path/to/packlist/mcp/server.ts"],
 *         "env": {
 *           "PACKLIST_API_URL": "https://app.packlist.be",
 *           "PACKLIST_API_KEY": "pk_..."
 *         }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.PACKLIST_API_URL?.replace(/\/$/, "");
const API_KEY = process.env.PACKLIST_API_KEY;

if (!BASE_URL || !API_KEY) {
  process.stderr.write(
    "Error: PACKLIST_API_URL and PACKLIST_API_KEY environment variables must be set.\n"
  );
  process.exit(1);
}

// ── HTTP helper ────────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── Server ─────────────────────────────────────────────────────────────────────

const server = new McpServer({ name: "packlist", version: "1.0.0" });

// ── list_trips ─────────────────────────────────────────────────────────────────

server.tool(
  "list_trips",
  "List trips for the authenticated user. Use filter='upcoming' for current and future trips, 'past' for completed trips, or 'all' (default) for everything. Sorted by start date.",
  {
    filter: z
      .enum(["all", "upcoming", "past"])
      .default("all")
      .describe("'upcoming' = endDate >= today, 'past' = endDate < today, 'all' = no filter"),
  },
  async ({ filter }) => text(await api("GET", `/api/trips?filter=${filter}`))
);

// ── create_trip ────────────────────────────────────────────────────────────────

server.tool(
  "create_trip",
  "Create a new trip. Triggers weather fetch, visa check, and checklist generation automatically.",
  {
    type: z.enum(["business", "leisure", "mixed"]).describe("Trip purpose"),
    destinationText: z.string().min(2).max(200).describe("Free-text destination (e.g. 'Paris, France')"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Departure date (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Return date (YYYY-MM-DD)"),
    baggageMode: z
      .enum(["carry-on", "checked", "unknown"])
      .default("unknown")
      .describe("Baggage type — affects bulky item recommendations"),
  },
  async (params) => text(await api("POST", "/api/trips", params))
);

// ── get_trip ───────────────────────────────────────────────────────────────────

server.tool(
  "get_trip",
  "Get full details for a trip including cached weather and visa data.",
  { id: z.string().uuid().describe("Trip ID") },
  async ({ id }) => text(await api("GET", `/api/trips/${id}`))
);

// ── delete_trip ────────────────────────────────────────────────────────────────

server.tool(
  "delete_trip",
  "Permanently delete a trip and all its checklist items.",
  { id: z.string().uuid().describe("Trip ID") },
  async ({ id }) => {
    await api("DELETE", `/api/trips/${id}`);
    return text({ deleted: true, id });
  }
);

// ── get_checklist ──────────────────────────────────────────────────────────────

server.tool(
  "get_checklist",
  "Get all checklist items for a trip, sorted by priority. Each item includes category, done status, quantity, and rationale.",
  { tripId: z.string().uuid().describe("Trip ID") },
  async ({ tripId }) => text(await api("GET", `/api/checklist-items?tripId=${tripId}`))
);

// ── toggle_item ────────────────────────────────────────────────────────────────

server.tool(
  "toggle_item",
  "Mark a checklist item as done or undone.",
  {
    id: z.string().uuid().describe("Checklist item ID"),
    done: z.boolean().describe("true = packed, false = unpacked"),
  },
  async ({ id, done }) => text(await api("PATCH", `/api/checklist-items/${id}`, { done }))
);

// ── add_item ───────────────────────────────────────────────────────────────────

server.tool(
  "add_item",
  "Add a custom item to a trip's checklist.",
  {
    tripId: z.string().uuid().describe("Trip ID"),
    text: z.string().min(1).max(300).describe("Item description"),
    category: z
      .enum(["crucial", "clothing", "evening", "sports", "accessories", "tech", "toiletries"])
      .default("accessories")
      .describe("Checklist category"),
  },
  async (params) => text(await api("POST", "/api/checklist-items", params))
);

// ── delete_item ────────────────────────────────────────────────────────────────

server.tool(
  "delete_item",
  "Remove an item from a checklist.",
  { id: z.string().uuid().describe("Checklist item ID") },
  async ({ id }) => {
    await api("DELETE", `/api/checklist-items/${id}`);
    return text({ deleted: true, id });
  }
);

// ── regenerate_checklist ───────────────────────────────────────────────────────

server.tool(
  "regenerate_checklist",
  "Re-fetch weather, re-run visa check, and regenerate the entire checklist for a trip. Use after profile changes or when weather has updated.",
  { tripId: z.string().uuid().describe("Trip ID") },
  async ({ tripId }) => text(await api("POST", `/api/trips/${tripId}/regenerate`))
);

// ── update_profile ─────────────────────────────────────────────────────────────

server.tool(
  "update_profile",
  "Update the user's profile settings. Nationality and homeCountry affect visa checks and power adapter recommendations on future trips.",
  {
    nationality: z
      .string()
      .length(2)
      .toUpperCase()
      .optional()
      .describe("Passport country ISO 3166-1 alpha-2 code (e.g. 'IL', 'US', 'GB')"),
    homeCountry: z
      .string()
      .length(2)
      .toUpperCase()
      .optional()
      .describe("Resident country ISO 3166-1 alpha-2 code — used for power adapter detection"),
    timezone: z
      .string()
      .optional()
      .describe("IANA timezone (e.g. 'Europe/Brussels', 'America/New_York')"),
  },
  async (params) => text(await api("PATCH", "/api/users/me", params))
);

// ── Start ──────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
