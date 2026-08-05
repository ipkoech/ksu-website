export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="min-h-screen bg-white"
    >
      <div className="h-10 bg-heri-lime/60" />
      <div className="h-24 border-b border-slate-100 bg-white" />
      <div className="min-h-[420px] animate-pulse bg-heri-ink/90" />
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-14">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
