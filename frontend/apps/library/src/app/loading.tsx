export default function Loading() {
  return (
    <main id="library-main" className="min-h-screen bg-background">
      <section
        aria-label="Loading library content"
        className="px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-full max-w-2xl animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-lg border bg-muted/40"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
