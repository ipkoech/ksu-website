"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@ksu/ui/components";
import { PublicFooter, PublicHeader } from "@ksu/ui/layout/public";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface-subtle text-foreground">
      <PublicHeader />
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not load this page. Try again, search the site, or return
            to the homepage and continue from there.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={reset}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4" aria-hidden />
                Go home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">Search site</Link>
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
