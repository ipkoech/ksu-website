"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { buildLibrarySearchHref } from "../lib/library-home";

const searchTypes = [
  { label: "Everything", value: "everything" },
  { label: "Catalog", value: "catalog" },
  { label: "E-resources", value: "databases" },
  { label: "Repository", value: "external_link" },
];

export function LibrarySearchHero() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("everything");

  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <Image
        src="/images/library/reading-hall.jpg"
        alt="The main reading hall of the Kisii University Library"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.94)_0%,rgba(2,20,49,0.78)_50%,rgba(2,20,49,0.34)_100%)]" />
      <div className="relative mx-auto flex min-h-[min(640px,78vh)] max-w-[1680px] items-center px-4 py-16 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary sm:text-sm">
            Kisii University Library
          </p>
          <h1 className="mt-5 max-w-2xl text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Knowledge begins with discovery.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/85 sm:text-lg">
            Find the books, articles, journals, databases, repository materials,
            and research support you need to learn, teach, and create knowledge.
          </p>

          <form
            action="/search"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.assign(buildLibrarySearchHref(query, type));
            }}
            className="mt-8 max-w-3xl rounded-lg bg-white p-2 text-foreground shadow-2xl shadow-primary/30 sm:p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="library-hero-search">
                What are you looking for?
              </label>
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="library-hero-search"
                  name="q"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What are you looking for?"
                  autoComplete="off"
                  className="h-12 w-full rounded-md border border-border bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-white transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30"
              >
                Search
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Search type">
              {searchTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={type === item.value}
                  onClick={() => setType(item.value)}
                  className={`shrink-0 rounded-md px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
                    type === item.value
                      ? "bg-primary text-white"
                      : "bg-surface-subtle text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/85">
            <Link className="transition hover:text-white" href="/contact#hours">
              Library hours
            </Link>
            <Link className="transition hover:text-white" href="/electronic">
              Access e-resources
            </Link>
            <Link className="transition hover:text-white" href="/electronic#external-links">
              Visit the repository
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
