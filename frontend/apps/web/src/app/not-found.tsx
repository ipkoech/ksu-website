import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";

export default async function NotFound() {
  return (
    <PageShell>
      <section className="flex min-h-[60vh] items-center justify-center bg-surface-subtle px-4 py-12">
        <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page may have moved, expired, or the address may be incorrect.
          Search the university site or return to the homepage.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Search site</Link>
          </Button>
        </div>
        </div>
      </section>
    </PageShell>
  );
}
