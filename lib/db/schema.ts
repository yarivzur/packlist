import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const tripTypeEnum = pgEnum("trip_type", [
  "business",
  "leisure",
  "mixed",
]);

export const baggageModeEnum = pgEnum("baggage_mode", [
  "carry-on",
  "checked",
  "unknown",
]);

export const tripStatusEnum = pgEnum("trip_status", ["active", "archived"]);

export const checklistCategoryEnum = pgEnum("checklist_category", [
  "crucial",
  "clothing",
  "evening",
  "sports",
  "accessories",
  "tech",
  "toiletries",
]);

export const reminderTypeEnum = pgEnum("reminder_type", [
  "72h",
  "48h",
  "24h",
  "12h",
  "leave",
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "failed",
]);

export const botChannelEnum = pgEnum("bot_channel", ["telegram", "whatsapp"]);

export const retroRatingEnum = pgEnum("retro_rating", [
  "too_much",
  "just_right",
  "forgot_things",
]);

// ─── Auth.js tables ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  phone: text("phone"),
  timezone: text("timezone").default("UTC").notNull(),
  locale: text("locale").default("en").notNull(),
  theme: text("theme").default("system").notNull(),   // 'system' | 'light' | 'dark'
  nationality: text("nationality"),                   // ISO 3166-1 alpha-2 (passport country)
  homeCountry: text("home_country"),                  // ISO 3166-1 alpha-2 (resident country / plug type)
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Auth.js Drizzle adapter expects these specific TypeScript property names
export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── Domain tables ─────────────────────────────────────────────────────────────

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: tripTypeEnum("type").notNull(),
  destinationText: text("destination_text").notNull(),
  destinationCountry: text("destination_country"),
  destinationCity: text("destination_city"),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  baggageMode: baggageModeEnum("baggage_mode").notNull().default("unknown"),
  status: tripStatusEnum("status").notNull().default("active"),
  reviewed: boolean("reviewed").notNull().default(false),
  weatherDataJson: jsonb("weather_data_json"),
  visaDataJson: jsonb("visa_data_json"),              // cached visa check result
  retroRating: retroRatingEnum("retro_rating"),       // null until user responds
  retroNote: text("retro_note"),                      // optional free-text follow-up
  retroPromptedAt: timestamp("retro_prompted_at", { mode: "date" }), // set when prompt sent
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  category: checklistCategoryEnum("category").notNull().default("accessories"),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  quantity: integer("quantity").notNull().default(1),
  rationale: text("rationale"), // human-readable explanation e.g. "7-day trip → 6 t-shirts"
  sourceRule: text("source_rule").notNull().default("custom"), // template id or 'custom'
  priority: integer("priority").notNull().default(50),
  oftenSkipped: boolean("often_skipped").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  type: reminderTypeEnum("type").notNull(),
  sendAt: timestamp("send_at", { mode: "date" }).notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }),
  status: reminderStatusEnum("status").notNull().default("pending"),
  payloadJson: jsonb("payload_json"),
});

export const botSessions = pgTable("bot_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  channel: botChannelEnum("channel").notNull(),
  channelUserId: text("channel_user_id").notNull(), // Telegram chat_id or WA phone
  state: text("state").notNull().default("IDLE"),
  stateDataJson: jsonb("state_data_json"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const telegramLinkTokens = pgTable("telegram_link_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export const whatsappLinkTokens = pgTable("whatsapp_link_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  keyHash: text("key_hash").notNull().unique(), // SHA-256 hex of raw key
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
});

// ─── Types ─────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type BotSession = typeof botSessions.$inferSelect;

export type ApiKey = typeof apiKeys.$inferSelect;

export type NewTrip = typeof trips.$inferInsert;
export type NewChecklistItem = typeof checklistItems.$inferInsert;
export type NewReminder = typeof reminders.$inferInsert;
