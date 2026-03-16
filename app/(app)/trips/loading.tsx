export default function TripsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
