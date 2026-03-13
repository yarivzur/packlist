import { TripForm } from "@/components/trips/trip-form";

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Where are you headed? 🌍</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your trip and we&apos;ll build a smart packing list — tailored to the weather, how long you&apos;re going, and how you&apos;re flying.
        </p>
      </div>
      <TripForm />
    </div>
  );
}
