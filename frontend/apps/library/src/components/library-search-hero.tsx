"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { buildLibrarySearchHref } from "../lib/library-home";
import { HeroParallaxMedia, MaskedWords, RiseIn } from "./library-motion";

const searchTypes = [
  { label: "Everything", value: "everything" },
  { label: "Catalog", value: "catalog" },
  { label: "E-resources", value: "databases" },
  { label: "Repository", value: "external_link" },
];

export function LibrarySearchHero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("everything");

  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <HeroParallaxMedia src="/images/library/reading-hall.jpg" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--brand-overlay)/0.94)_0%,hsl(var(--brand-overlay)/0.78)_50%,hsl(var(--brand-overlay)/0.34)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-overlay/50 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(680px,88dvh)] max-w-[1680px] items-center px-4 py-16 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="w-full max-w-3xl">
          <h1 className="max-w-2xl font-[family-name:var(--app-font-display)] text-4xl font-normal leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            <MaskedWords text="Knowledge begins with discovery." delay={0.1} />
          </h1>

          <RiseIn delay={0.45}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-white/85 sm:text-lg">
              Search books, journals, databases, and repository collections,
              with research support from KSU librarians.
            </p>
          </RiseIn>

          <RiseIn delay={0.6}>
            <form
              action="/search"
              onSubmit={(event) => {
                event.preventDefault();
                router.push(buildLibrarySearchHref(query, type));
              }}
              className="mt-8 max-w-3xl rounded-xl bg-white p-2 text-foreground shadow-2xl shadow-brand-overlay/40 sm:p-3"
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
                    className="h-12 w-full rounded-lg border border-border bg-white pl-12 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="submit"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30 active:scale-[0.98]"
                >
                  Search
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1"
                  />
                </button>
              </div>
              <div
                className="mt-2 flex gap-1 overflow-x-auto px-1 pb-1"
                role="group"
                aria-label="Search type"
              >
                {searchTypes.map((item) => {
                  const active = type === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setType(item.value)}
                      className="relative shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      {active ? (
                        <motion.span
                          layoutId={reduce ? undefined : "library-scope-pill"}
                          className="absolute inset-0 rounded-lg bg-primary"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      ) : null}
                      <span
                        className={`relative transition-colors ${
                          active
                            ? "text-white"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </form>
          </RiseIn>

          <RiseIn delay={0.75}>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
              <Link className="transition hover:text-white" href="/contact#hours">
                Library hours
              </Link>
              <Link className="transition hover:text-white" href="/electronic">
                Access e-resources
              </Link>
              <Link
                className="transition hover:text-white"
                href="/electronic#external-links"
              >
                Visit the repository
              </Link>
            </div>
          </RiseIn>
        </div>
      </div>
    </section>
  );
}
