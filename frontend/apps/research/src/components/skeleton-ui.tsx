export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded bg-surface-muted" />
        <div className="h-5 w-16 rounded bg-surface-muted" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-5 w-3/4 rounded bg-surface-muted" />
        <div className="h-5 w-1/2 rounded bg-surface-muted" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-surface-muted" />
        <div className="h-3 w-5/6 rounded bg-surface-muted" />
        <div className="h-3 w-2/3 rounded bg-surface-muted" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-md bg-surface-muted" />
        <div className="h-12 rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-6">
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-surface-muted" />
        <div className="h-6 w-32 rounded-full bg-surface-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-surface-muted" />
        <div className="h-8 w-1/2 rounded bg-surface-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-surface-muted" />
        <div className="h-4 w-5/6 rounded bg-surface-muted" />
        <div className="h-4 w-4/6 rounded bg-surface-muted" />
      </div>
      <div className="aspect-[16/9] rounded-lg bg-surface-muted" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-surface-muted" />
          <div className="h-4 w-full rounded bg-surface-muted" />
          <div className="h-4 w-3/4 rounded bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="h-4 w-1/3 rounded bg-surface-muted" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border px-5 py-4 last:border-b-0">
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-surface-muted" />
            <div className="h-3 w-1/3 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
