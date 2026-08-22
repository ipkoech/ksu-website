"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  GraduationCap,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { RevealGroup, RevealItem } from "@/components/home/motion-primitives";
import type {
  HomeProgrammeCard,
  HomeProgrammeFilters,
  HomeSchoolCard,
} from "@/lib/homepage-data";

export const CATALOGUE_HREF = "/academics/programmes";

interface SearchResult {
  id: string;
  name: string;
  level: string | null;
  mode: string | null;
  duration: string | null;
  department: string | null;
  href: string;
}

type SearchState = "idle" | "loading" | "ready" | "error";

type Filters = { level: string; mode_of_study: string; school_id: string };
const EMPTY: Filters = { level: "", mode_of_study: "", school_id: "" };

/**
 * Programme search: one field, filters behind a control, live results.
 *
 * The filters used to sit as three permanent selects under the input, which
 * asked every visitor to reckon with taxonomy before they had typed anything.
 * They now live in a panel behind a single button that carries a count, so
 * the default state is a search box and nothing else.
 */
export function ProgrammeSearchPanel({
  schools,
  filters,
}: {
  schools: HomeSchoolCard[];
  filters: HomeProgrammeFilters;
}) {
  const router = useRouter();
  const fieldId = useId();
  const listboxId = `${fieldId}-results`;
  const panelId = `${fieldId}-filters`;
  const optionId = (index: number) => `${fieldId}-option-${index}`;

  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Filters>(EMPTY);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<SearchState>("idle");
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const appliedCount = Object.values(active).filter(Boolean).length;

  const catalogueHref = (() => {
    const p = new URLSearchParams();
    if (trimmed) p.set("q", trimmed);
    if (active.level) p.set("level", active.level);
    if (active.mode_of_study) p.set("mode_of_study", active.mode_of_study);
    if (active.school_id) p.set("school_id", active.school_id);
    const qs = p.toString();
    return qs ? `${CATALOGUE_HREF}?${qs}` : CATALOGUE_HREF;
  })();

  const optionHrefs = [...results.map((r) => r.href), catalogueHref];

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  // Dismiss the filter panel on outside click and on Escape.
  useEffect(() => {
    if (!filtersOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!filterWrapRef.current?.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
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
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      close();
      router.push(optionHrefs[activeIndex]);
    }
  };

  // Re-runs on query *or* filter change: a filter on its own is a valid
  // search, so this is not gated on the text length alone.
  useEffect(() => {
    const term = query.trim();
    const hasFilter = Object.values(active).some(Boolean);
    if (term.length < 2 && !hasFilter) {
      abortRef.current?.abort();
      setResults([]);
      setTotal(0);
      setState("idle");
      setOpen(false);
      return;
    }

    setState("loading");
    const timeout = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      if (active.level) params.set("level", active.level);
      if (active.mode_of_study) params.set("mode_of_study", active.mode_of_study);
      if (active.school_id) params.set("school_id", active.school_id);

      try {
        const response = await fetch(
          `/api/programme-search?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Programme search failed");
        const payload = (await response.json()) as {
          results?: SearchResult[];
          total?: number;
          error?: boolean;
        };
        if (payload.error) throw new Error("Programme search unavailable");
        setResults(payload.results ?? []);
        setTotal(payload.total ?? payload.results?.length ?? 0);
        setState("ready");
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setTotal(0);
        setState("error");
        setOpen(true);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query, active]);

  const statusMessage =
    state === "loading"
      ? "Searching programmes"
      : state === "error"
        ? "Programme search is unavailable. Browse the full catalogue instead."
        : state === "ready"
          ? total > 0
            ? `${total} ${total === 1 ? "programme" : "programmes"} found`
            : "No programmes found"
          : "";

  const setFilter = (key: keyof Filters, value: string) =>
    setActive((current) => ({
      ...current,
      [key]: current[key] === value ? "" : value,
    }));

  return (
    <div>
      <div className="relative">
        <div className="flex min-w-0 gap-2">
          {/* Search field */}
          <div className="relative flex min-w-0 flex-1 rounded-2xl bg-white shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.06),0_12px_28px_-16px_hsl(var(--brand-overlay)/0.4)] ring-1 ring-brand-overlay/10 transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary">
            <Search
              className="pointer-events-none ml-5 mt-5 h-5 w-5 shrink-0 text-brand-overlay/35"
              aria-hidden
            />
            <label htmlFor={fieldId} className="sr-only">
              Search programmes
            </label>
            <input
              id={fieldId}
              type="search"
              name="q"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={
                open && activeIndex >= 0 ? optionId(activeIndex) : undefined
              }
              placeholder="Search programmes, e.g. nursing, education, law"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => {
                if (results.length > 0) setOpen(true);
              }}
              onBlur={() => window.setTimeout(close, 160)}
              className="ksu-l-small min-h-14 min-w-0 flex-1 bg-transparent px-3 text-brand-overlay outline-none placeholder:text-brand-overlay/40"
            />
            {state === "loading" ? (
              <Loader2
                className="mr-4 mt-5 h-4 w-4 shrink-0 animate-spin text-brand-overlay/40"
                aria-hidden
              />
            ) : null}
            {trimmed ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className={cn(
                  "mr-2 flex w-10 shrink-0 items-center justify-center rounded-xl text-brand-overlay/40 transition-colors hover:text-brand-overlay",
                  focusVisibleStyles.primary,
                )}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>

          {/* Filters, behind one control */}
          <div ref={filterWrapRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls={panelId}
              className={cn(
                "flex h-full min-h-14 items-center gap-2 rounded-2xl px-4 font-medium transition-colors duration-200 sm:px-5",
                appliedCount > 0
                  ? "bg-primary text-white"
                  : "bg-white text-brand-overlay ring-1 ring-brand-overlay/10 hover:ring-brand-overlay/30",
                focusVisibleStyles.primary,
              )}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              <span className="ksu-l-small hidden sm:inline">Filters</span>
              {appliedCount > 0 ? (
                <span
                  className="ksu-l-small flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 font-medium text-primary"
                  aria-label={`${appliedCount} filters applied`}
                >
                  {appliedCount}
                </span>
              ) : null}
            </button>

            {filtersOpen ? (
              <div
                id={panelId}
                className="absolute right-0 top-full z-40 mt-2 w-[min(21rem,calc(100vw-2.5rem))] rounded-2xl bg-white p-5 shadow-xl ring-1 ring-brand-overlay/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="ksu-l-small font-medium">Narrow your search</h4>
                  {appliedCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActive(EMPTY)}
                      className={cn(
                        "ksu-l-small font-medium text-[hsl(var(--secondary-ink))]",
                        focusVisibleStyles.primary,
                      )}
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                <FilterGroup
                  label="Study level"
                  options={filters.levels.map((l) => ({ value: l, label: l }))}
                  selected={active.level}
                  onSelect={(v) => setFilter("level", v)}
                />
                <FilterGroup
                  label="Study mode"
                  options={filters.modes.map((m) => ({ value: m, label: m }))}
                  selected={active.mode_of_study}
                  onSelect={(v) => setFilter("mode_of_study", v)}
                />
                <FilterGroup
                  label="School"
                  options={schools
                    .filter((s) => Boolean(s.id))
                    .map((s) => ({ value: s.id as string, label: s.title }))}
                  selected={active.school_id}
                  onSelect={(v) => setFilter("school_id", v)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <span role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </span>

        {/* Suggestions */}
        {open ? (
          <div
            id={listboxId}
            className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(26rem,55vh)] overflow-y-auto rounded-2xl bg-white shadow-xl ring-1 ring-brand-overlay/10"
          >
            {state === "error" ? (
              <p className="ksu-l-small px-5 py-4 text-brand-overlay/75">
                Programme search is unavailable right now.{" "}
                <Link
                  href={CATALOGUE_HREF}
                  className="font-medium underline underline-offset-2"
                >
                  Browse the full catalogue
                </Link>
                .
              </p>
            ) : results.length > 0 ? (
              <ul role="listbox" aria-label="Programme suggestions">
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
                        "flex min-h-12 items-center gap-3 px-5 py-3 transition-colors",
                        activeIndex === index && "bg-[hsl(var(--primary-soft))]",
                        focusVisibleStyles.primary,
                      )}
                    >
                      <GraduationCap
                        className="h-4 w-4 shrink-0 text-[hsl(var(--secondary-ink))]"
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="ksu-l-small block truncate font-medium">
                          {result.name}
                        </span>
                        <span className="ksu-l-small block truncate capitalize text-brand-overlay/55">
                          {[result.level, result.duration, result.department]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={catalogueHref}
                    id={optionId(results.length)}
                    role="option"
                    aria-selected={activeIndex === results.length}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(results.length)}
                    className={cn(
                      "ksu-l-small flex min-h-11 items-center gap-2 border-t border-brand-overlay/8 px-5 py-3 font-medium text-[hsl(var(--secondary-ink))]",
                      activeIndex === results.length &&
                        "bg-[hsl(var(--primary-soft))]",
                      focusVisibleStyles.primary,
                    )}
                  >
                    See all {total} results
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              </ul>
            ) : (
              <p className="ksu-l-small px-5 py-4 text-brand-overlay/75">
                Nothing matches that yet. Try a broader term, or{" "}
                <Link
                  href={CATALOGUE_HREF}
                  className="font-medium underline underline-offset-2"
                >
                  browse all programmes
                </Link>
                .
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Applied filters, visible outside the panel so nothing is hidden. */}
      {appliedCount > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["level", active.level],
              ["mode_of_study", active.mode_of_study],
              [
                "school_id",
                schools.find((s) => s.id === active.school_id)?.title ?? "",
              ],
            ] as Array<[keyof Filters, string]>
          )
            .filter(([, label]) => Boolean(label))
            .map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setActive((c) => ({ ...c, [key]: "" }))}
                  className={cn(
                    "ksu-l-small inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[hsl(var(--primary-soft))] px-3 capitalize text-primary transition-colors hover:bg-[hsl(var(--primary-muted))]",
                    focusVisibleStyles.primary,
                  )}
                >
                  {label}
                  <X className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset className="mt-5">
      <legend className="ksu-l-small font-medium text-brand-overlay/60">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(option.value)}
              className={cn(
                "ksu-l-small inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 capitalize transition-colors",
                on
                  ? "bg-primary text-white"
                  : "bg-[hsl(var(--surface-band))] text-brand-overlay hover:bg-[hsl(var(--primary-soft))]",
                focusVisibleStyles.primary,
              )}
            >
              {on ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * The featured programmes, as an even two-column grid.
 *
 * A wrapping pill row made a long degree name sit beside a short one and the
 * short one read as stunted; a fixed grid gives every entry the same box. The
 * level is left off deliberately: the name is what is being scanned, and the
 * qualification is already implied by it.
 */
export function TopProgrammes({
  programmes,
}: {
  programmes: HomeProgrammeCard[];
}) {
  if (programmes.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h4 className="ksu-l-small font-medium text-brand-overlay/70">
          Featured programmes
        </h4>
        <Link
          href={CATALOGUE_HREF}
          className={cn(
            "group ksu-l-small inline-flex min-h-11 items-center gap-1.5 font-medium text-[hsl(var(--secondary-ink))]",
            focusVisibleStyles.primary,
          )}
        >
          All programmes
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>

      <RevealGroup as="ul" className="mt-3 grid gap-2 sm:grid-cols-2">
        {programmes.map((programme) => (
          <RevealItem as="li" key={programme.href} className="min-w-0">
            <Link
              href={programme.href}
              className={cn(
                "group flex h-full min-h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-brand-overlay/10 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[hsl(var(--secondary))]/50",
                focusVisibleStyles.primary,
              )}
            >
              <span className="ksu-l-small min-w-0 flex-1 truncate font-medium">
                {programme.title}
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-brand-overlay/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--secondary-ink))]"
                aria-hidden
              />
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
