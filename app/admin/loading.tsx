export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div>
        <div className="h-9 w-48 animate-pulse rounded-full bg-charcoal/10" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-full bg-charcoal/5" />
      </div>
      <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-charcoal/5 px-5 py-4 last:border-0"
          >
            <div className="size-11 shrink-0 animate-pulse rounded-lg bg-charcoal/10" />
            <div className="min-w-0 flex-1">
              <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-charcoal/10" />
              <div className="mt-2 h-3 w-1/4 animate-pulse rounded-full bg-charcoal/5" />
            </div>
            <div className="h-8 w-20 shrink-0 animate-pulse rounded-lg bg-charcoal/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
