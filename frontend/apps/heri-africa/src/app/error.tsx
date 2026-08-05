"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center bg-white px-6 py-20">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold text-heri-blue sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          An unexpected error stopped this page from loading. You can try
          again, or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-xl bg-heri-lime px-6 py-3.5 text-sm font-bold text-heri-ink transition hover:bg-heri-teal hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-heri-teal px-6 py-3.5 text-sm font-bold text-heri-teal transition hover:bg-heri-teal hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
