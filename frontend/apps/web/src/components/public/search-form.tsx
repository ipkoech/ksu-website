"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";
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

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search news, events, schools, departments, and people"
          className="h-12 w-full rounded-full border border-slate-200 bg-white px-12 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
      >
        <Search aria-hidden className="h-4 w-4" />
        Search
      </button>
    </form>
  );
}
