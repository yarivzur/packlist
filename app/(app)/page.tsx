import { redirect } from "next/navigation";

// Redirect /app root → /trips
export default function AppRoot() {
  redirect("/trips");
}
