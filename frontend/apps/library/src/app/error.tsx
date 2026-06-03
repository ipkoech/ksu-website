"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="library-main" className="min-h-screen bg-background">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Library service error
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            We could not load this library page
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            The request failed before the page could finish loading. Retry the
            page, or return to another library section.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open library portal
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
