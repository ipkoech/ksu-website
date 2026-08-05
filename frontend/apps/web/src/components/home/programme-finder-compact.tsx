"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Loader2, Search } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/reveal";
import type { HomeProgrammeCard, HomeSchoolCard } from "@/lib/homepage-data";

const levels = [
  { label: "Undergraduate", href: "/academics/programmes?level=undergraduate" },
  { label: "Postgraduate", href: "/academics/programmes?level=postgraduate" },
  { label: "Diploma & Certificate", href: "/academics/programmes?level=diploma" },
];

/* Same primary-tinted ground as the Why-KSU interlude, so the two light
   moments on the page read as one voice within the brand's blue family. */
const ground = "color-mix(in srgb, hsl(var(--primary)) 6%, white)";

/**
 * The programme moment: a centred search invitation on the warm cream
 * ground, level shortcuts, then featured programmes beside the schools.
 */
export function ProgrammeFinderCompact({
  schools,
  featuredProgrammes,
}: {
  schools: HomeSchoolCard[];
  featuredProgrammes: HomeProgrammeCard[];
}) {
  const programmes = featuredProgrammes.slice(0, 4);

  return (
    <section
      id="programme-finder"
      aria-labelledby="finder-heading"
      className="pb-20 pt-12 text-brand-overlay sm:pb-24 lg:pb-28 lg:pt-16"
      style={{ backgroundColor: ground }}
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Centred invitation */}
        <Reveal amount={0.3}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Academics &amp; admissions
          </p>
          <h2
            id="finder-heading"
            className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-normal leading-tight sm:text-4xl lg:text-5xl"
          >
            Find <em className="italic">your programme.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 opacity-80 md:text-base md:leading-7">
            Two hundred programmes across eight schools. Search by name, or
            start from a level or a school.
          </p>

          <LiveProgrammeSearch />

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {levels.map((level) => (
              <Link
                key={level.label}
                href={level.href}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border border-primary/25 px-4 text-sm font-semibold transition-colors duration-200 hover:bg-primary/10",
                  focusVisibleStyles.primary,
                )}
              >
                {level.label}
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Featured programmes + schools */}
        <div className="mx-auto mt-10 grid max-w-6xl items-start gap-10 lg:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {programmes.length > 0 && (
            <Reveal amount={0.3}
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">
                Featured programmes
              </h3>
              <ul className="mt-4 divide-y divide-primary/15 border-y border-primary/15">
                {programmes.map((programme) => (
                  <li key={programme.href}>
                    <Link
                      href={programme.href}
                      className={cn(
                        "group flex min-h-14 items-center gap-4 py-3.5",
                        focusVisibleStyles.primary,
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-secondary shadow-sm">
                        <GraduationCap className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-[family-name:var(--font-display)] text-base font-medium">
                          {programme.title}
                        </span>
                        <span className="block truncate text-xs opacity-65">
                          {programme.schoolName ?? programme.meta ?? ""}
                        </span>
                      </span>
                      <ArrowRight
                        className="ml-auto h-4 w-4 shrink-0 opacity-40 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/academics/programmes"
                className={cn(
                  "group mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:opacity-80",
                  focusVisibleStyles.primary,
                )}
              >
                All programmes
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </Reveal>
          )}

          <Reveal amount={0.3}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">
                Or start from a school
              </h3>
              <Link
                href="/academics/schools"
                className={cn(
                  "group inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:opacity-80",
                  focusVisibleStyles.primary,
                )}
              >
                All schools
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
            {schools.length > 0 ? (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {schools.slice(0, 8).map((school) => (
                  <li key={school.href}>
                    <Link
                      href={school.href}
                      className={cn(
                        "group relative block h-24 overflow-hidden rounded-xl sm:h-[104px]",
                        focusVisibleStyles.primary,
                      )}
                    >
                      <PublicImage
                        src={school.imageUrl}
                        alt=""
                        ratio="fill"
                        fallbackContent={
                          <GraduationCap className="h-6 w-6" aria-hidden />
                        }
                        className="absolute inset-0 h-full w-full"
                        imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <div
                        className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.85)_0%,hsl(var(--brand-overlay)/0.35)_55%,hsl(var(--brand-overlay)/0.12)_100%)]"
                        aria-hidden
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                          {school.title}
                        </span>
                        <ArrowRight
                          className="ml-auto h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                          aria-hidden
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm opacity-80">
                School listings are temporarily unavailable.{" "}
                <Link
                  href="/academics/schools"
                  className="font-semibold underline"
                >
                  Open the schools page
                </Link>{" "}
                to browse.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

interface SearchResult {
  id: string;
  name: string;
  level: string | null;
  department: string | null;
  href: string;
}

/**
 * Realtime programme search: debounced fetch on every keystroke with the
 * results listed under the pill. The form still submits to the full
 * listing as a no-JS fallback and for "see all results".
 */
function LiveProgrammeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  const seeAllHref = `/academics/programmes?q=${encodeURIComponent(query.trim())}`;
  /* The "see all results" row is the last option in the listbox. */
  const optionHrefs = [...results.map((result) => result.href), seeAllHref];
  const optionId = (index: number) => `landing-programme-option-${index}`;

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (optionHrefs.length === 0) return;
      setActiveIndex((current) =>
        event.key === "ArrowDown"
          ? current + 1 >= optionHrefs.length
            ? 0
            : current + 1
          : current <= 0
            ? optionHrefs.length - 1
            : current - 1,
      );
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && optionHrefs[activeIndex]) {
        event.preventDefault();
        close();
        router.push(optionHrefs[activeIndex]);
      }
    } else if (event.key === "Escape") {
      close();
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abortRef.current?.abort();
      setResults([]);
      setSearching(false);
      setOpen(false);
      return;
    }

    setSearching(true);
    const timeout = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(
          `/api/programme-search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as { results?: SearchResult[] };
        setResults(payload.results ?? []);
        setOpen(true);
        setSearching(false);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
          setSearching(false);
        }
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative mx-auto mt-7 max-w-xl">
      <form
        action="/academics/programmes"
        method="get"
        className="flex overflow-hidden rounded-full bg-white p-1.5 shadow-lg shadow-primary/10 ring-1 ring-primary/10"
        role="search"
      >
        <label htmlFor="landing-programme-search" className="sr-only">
          Search programmes
        </label>
        <Search
          className="ml-4 mt-3 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          id="landing-programme-search"
          type="search"
          name="q"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          placeholder="e.g. Nursing, Commerce, Education…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            // Delay so result links receive their click first.
            window.setTimeout(close, 150);
          }}
          aria-expanded={open}
          aria-controls="landing-programme-results"
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {searching ? (
          <span
            className="mr-4 mt-3 shrink-0 text-muted-foreground"
            role="status"
            aria-label="Searching programmes"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          </span>
        ) : null}
      </form>

      <span role="status" aria-live="polite" className="sr-only">
        {open
          ? results.length > 0
            ? `${results.length} programmes found`
            : "No programmes found"
          : ""}
      </span>

      {open && (
        <div
          id="landing-programme-results"
          className="absolute inset-x-0 top-full z-20 mt-2 max-h-[min(420px,60vh)] overflow-y-auto rounded-2xl bg-white text-left shadow-xl shadow-primary/15 ring-1 ring-primary/10"
        >
          {results.length > 0 ? (
            <ul
              className="divide-y divide-primary/10"
              role="listbox"
              aria-label="Programme suggestions"
            >
              {results.map((result, index) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    id={optionId(index)}
                    role="option"
                    aria-selected={activeIndex === index}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-primary/5",
                      activeIndex === index && "bg-primary/5",
                      focusVisibleStyles.primary,
                    )}
                  >
                    <GraduationCap
                      className="h-4 w-4 shrink-0 text-secondary"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-overlay">
                        {result.name}
                      </span>
                      <span className="block truncate text-xs capitalize text-muted-foreground">
                        {[result.level, result.department]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={seeAllHref}
                  id={optionId(results.length)}
                  role="option"
                  aria-selected={activeIndex === results.length}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(results.length)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 px-5 py-3 text-sm font-semibold text-secondary transition-colors duration-150 hover:bg-primary/5",
                    activeIndex === results.length && "bg-primary/5",
                    focusVisibleStyles.primary,
                  )}
                >
                  See all results
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-muted-foreground" role="status">
              No programmes match &ldquo;{query.trim()}&rdquo; yet. Try a
              broader term, or{" "}
              <Link
                href="/academics/programmes"
                className="font-semibold text-secondary"
              >
                browse all programmes
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgrammeFinderCompact;
