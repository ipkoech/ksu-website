export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded bg-slate-200" />
        <div className="h-5 w-16 rounded bg-slate-200" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-1/2 rounded bg-slate-200" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-md bg-slate-100" />
        <div className="h-12 rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-slate-200" />
        <div className="h-6 w-32 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-slate-200" />
        <div className="h-8 w-1/2 rounded bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
        <div className="h-4 w-4/6 rounded bg-slate-100" />
      </div>
      <div className="aspect-[16/9] rounded-lg bg-slate-200" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-slate-100 px-5 py-4 last:border-b-0">
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
