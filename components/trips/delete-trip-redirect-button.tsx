"use client";

import { useRouter } from "next/navigation";
import { DeleteTripButton } from "./delete-trip-button";

export function DeleteTripRedirectButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  return (
    <DeleteTripButton
      tripId={tripId}
      variant="detail"
      onDeleted={() => router.push("/trips")}
    />
  );
}
