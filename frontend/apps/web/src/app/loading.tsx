export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="mx-auto w-full max-w-6xl"
        role="status"
        aria-live="polite"
        aria-label="Loading Kisii University content"
      >
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-12 max-w-2xl animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-3xl animate-pulse rounded bg-slate-200" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-11 w-11 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-6 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading Kisii University...</span>
      </div>
    </main>
  );
}
