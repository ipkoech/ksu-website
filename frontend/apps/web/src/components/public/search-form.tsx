"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@ksu/ui/lib/utils";

export function PublicSearchForm({
  initialQuery = "",
  className,
}: {
  initialQuery?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={cn("flex", className)}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        const target = trimmed
          ? `/search?q=${encodeURIComponent(trimmed)}`
          : "/search";
        startTransition(() => router.replace(target, { scroll: false }));
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
        />
        <label htmlFor="public-search" className="sr-only">
          Search Kisii University
        </label>
        <input
          id="public-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Kisii University"
          autoComplete="off"
          className="h-12 w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-24 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-12 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-70"
          disabled={isPending}
          aria-label={isPending ? "Searching" : "Submit search"}
          aria-describedby="public-search-status"
        >
          <Search aria-hidden className="h-4 w-4" />
        </button>
        <span id="public-search-status" className="sr-only" aria-live="polite">
          {isPending ? "Searching Kisii University" : ""}
        </span>
      </div>
    </form>
  );
}
