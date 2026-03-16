export default function TripDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-44 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>

      {/* Weather strip */}
      <div className="h-20 w-full rounded-xl bg-muted animate-pulse" />

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
      </div>

      {/* Checklist items */}
      <div className="space-y-4">
        {[1, 2, 3].map((group) => (
          <div key={group} className="space-y-2">
            <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2">
                <div className="h-5 w-5 rounded bg-muted animate-pulse shrink-0" />
                <div
                  className="h-4 rounded-md bg-muted animate-pulse"
                  style={{ width: `${50 + (item * group * 7) % 40}%` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
