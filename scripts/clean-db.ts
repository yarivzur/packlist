import { db } from "../lib/db/index";
import {
  checklistItems,
  reminders,
  botSessions,
  trips,
  sessions,
  accounts,
  users,
} from "../lib/db/schema";

async function main() {
  await db.delete(checklistItems);
  await db.delete(reminders);
  await db.delete(botSessions);
  await db.delete(trips);
  await db.delete(sessions);
  await db.delete(accounts);
  await db.delete(users);
  console.log("✓ Database cleaned.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
