import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "../components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <main className="grid min-h-[60vh] place-items-center bg-white px-6 py-20">
        <div className="max-w-xl text-center">
          <p className="text-7xl font-bold text-heri-lime">404</p>
          <h1 className="mt-4 text-3xl font-bold text-heri-blue sm:text-4xl">
            We could not find that page
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The page may have moved, or the link may be out of date. Try one of
            these instead.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl bg-heri-lime px-6 py-3.5 text-sm font-bold text-heri-ink transition hover:bg-heri-teal hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal"
            >
              Back to the homepage
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/our-work"
              className="inline-flex items-center gap-3 rounded-xl border border-heri-teal px-6 py-3.5 text-sm font-bold text-heri-teal transition hover:bg-heri-teal hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal"
            >
              Explore our research
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
