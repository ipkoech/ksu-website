"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { getMainApiBaseUrl } from "@ksu/api-client";
import type { HomeProgrammeCard, HomeSchoolCard } from "@/lib/homepage-data";

type ProgrammeFinderInteractiveProps = {
  programmes: HomeProgrammeCard[];
  schools: HomeSchoolCard[];
};

const allValue = "all";

export function ProgrammeFinderInteractive({
  programmes,
  schools,
}: ProgrammeFinderInteractiveProps) {
  const [query, setQuery] = useState("");
  const [schoolId, setSchoolId] = useState(allValue);
  const [level, setLevel] = useState(allValue);
  const [mode, setMode] = useState(allValue);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [remoteResults, setRemoteResults] = useState<HomeProgrammeCard[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    schoolId !== allValue ||
    level !== allValue ||
    mode !== allValue;

  const levels = useMemo(
    () => uniqueValues(programmes.map((programme) => programme.meta)),
    [programmes],
  );
  const modes = useMemo(
    () =>
      uniqueValues(
        programmes
          .map((programme) => programme.body.split(" · ").at(-1))
          .filter((value) => value && !/year|semester|trimester/i.test(value)),
      ),
    [programmes],
  );
  const localMatches = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return programmes.filter((programme) => {
      const matchesQuery =
        !normalizedQuery ||
        [programme.title, programme.body, programme.schoolName, programme.meta]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesSchool =
        schoolId === allValue || programme.schoolId === schoolId;
      const matchesLevel = level === allValue || programme.meta === level;
      const matchesMode =
        mode === allValue ||
        programme.body.toLowerCase().includes(mode.toLowerCase());
      return matchesQuery && matchesSchool && matchesLevel && matchesMode;
    });
  }, [deferredQuery, level, mode, programmes, schoolId]);

  useEffect(() => {
    if (!hasActiveFilters) {
      setRemoteResults(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      const params = new URLSearchParams({
        per_page: "24",
        fields:
          "id,name,slug,level,mode_of_study,duration,department_name,department",
      });
      if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
      if (schoolId !== allValue) params.set("school_id", schoolId);
      if (level !== allValue) params.set("level", level);
      if (mode !== allValue) params.set("mode_of_study", mode);

      try {
        const response = await fetch(
          `${getMainApiBaseUrl()}/api/v1/programmes?${params.toString()}`,
          {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          },
        );
        if (!response.ok) throw new Error(`Programme search failed: ${response.status}`);
        const payload = (await response.json()) as {
          data?: Array<Record<string, unknown>>;
        };
        setRemoteResults((payload.data ?? []).map(normalizeSearchProgramme));
      } catch (error) {
        if ((error as Error).name !== "AbortError") setRemoteResults(null);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [deferredQuery, hasActiveFilters, level, mode, schoolId]);

  const matchingProgrammes = remoteResults ?? localMatches;

  const actionHref = programmeSearchHref({ query, schoolId, level, mode });
  const resultSetKey = [deferredQuery, schoolId, level, mode].join(":");
  const previewItems = (
    hasActiveFilters ? matchingProgrammes : programmes
  ).slice(0, 3);

  return (
    <>
      <div className="programme-mosaic-search relative z-40 mx-auto mt-0 max-w-5xl bg-transparent px-5 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
        <form
          action="/academics/programmes"
          className="relative rounded-[1.25rem] bg-white/95 shadow-[0_18px_45px_-35px_hsl(var(--primary)/.65)] ring-1 ring-white/20"
        >
          <div className="flex min-h-16 items-center gap-3 rounded-[1.25rem] bg-white px-4 sm:px-5">
            <Search className="h-6 w-6 text-primary" aria-hidden />
            <input
              ref={searchInputRef}
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What would you like to study?"
              className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              autoComplete="off"
            />
            <button
              type="submit"
              className="hidden min-h-10 items-center justify-center rounded-full bg-[#0aa9e8] px-5 text-xs font-bold text-white transition hover:bg-[#0799d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
              aria-controls="programme-filters"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-[#0b2e64] bg-[#062353] px-4 text-xs font-bold text-white transition hover:bg-[#0b2e64] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && !query.trim() ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] text-white">
                  {[schoolId, level, mode].filter((value) => value !== allValue).length}
                </span>
              ) : null}
              {filtersOpen ? <X className="h-4 w-4 sm:hidden" aria-hidden /> : null}
            </button>
          </div>

          {filtersOpen ? <div id="programme-filters" role="dialog" aria-label="Programme filters" className="absolute right-0 top-full z-50 mt-2 grid w-[min(24rem,calc(100vw-2rem))] grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-[0_24px_60px_-30px_hsl(var(--primary)/.55)] ring-1 ring-primary/10 sm:p-5">
            <FilterSelect
              label="School"
              name="school_id"
              value={schoolId}
              onChange={setSchoolId}
              options={schools.map((school) => ({
                label: school.title,
                value: school.id ?? "",
              }))}
            />
            <FilterSelect
              label="Level"
              name="level"
              value={level}
              onChange={setLevel}
              options={levels.map((item) => ({ label: item, value: item }))}
            />
            <FilterSelect
              label="Study mode"
              name="mode_of_study"
              value={mode}
              onChange={setMode}
              options={modes.map((item) => ({ label: item, value: item }))}
            />
          </div> : null}
        </form>
        {!hasActiveFilters ? <PopularSearches schools={schools} onSelect={setQuery} /> : null}
      </div>

      {hasActiveFilters ? <div className="programme-mosaic-results mx-auto max-w-5xl rounded-t-[1.25rem] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
        <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Programme directory
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
              {hasActiveFilters ? "Your matches" : "Explore programmes"}
            </h3>
          </div>
          <p
            aria-live="polite"
            className="shrink-0 text-sm text-white/70"
          >
            {isSearching ? <span className="mr-2 text-xs text-secondary">Searching…</span> : null}
            <strong className="text-xl text-secondary">
              {matchingProgrammes.length}
            </strong>{" "}
            {matchingProgrammes.length === 1 ? "programme" : "programmes"}
          </p>
        </div>

        <div aria-live="polite" className="divide-y divide-white/10">
          {previewItems.length ? (
            previewItems.map((programme, index) => (
              <Link
                key={`${resultSetKey}-${programme.id ?? programme.href}`}
                href={programme.href}
                className="programme-result group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 transition duration-300 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:gap-4 sm:px-2"
                style={{ transitionDelay: `${index * 35}ms` }}
              >
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block font-[family-name:var(--font-display)] text-base font-semibold text-white transition group-hover:text-secondary">
                    {programme.title}
                  </span>
                  <span className="mt-1 line-clamp-1 block text-xs text-white/65">
                    {[programme.schoolName, programme.body]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-secondary transition group-hover:translate-x-1" />
              </Link>
            ))
          ) : (
            <div className="border-b border-white/10 py-5 text-sm leading-6 text-white/70">
              No programmes match these search criteria. Try a broader keyword
              or choose “All” in one of the filters.
            </div>
          )}
        </div>

        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 border-b border-secondary pb-1 text-sm font-bold text-white transition hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          View matching programmes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div> : null}
    </>
  );
}

function PopularSearches({
  schools,
  onSelect,
}: {
  schools: HomeSchoolCard[];
  onSelect: (value: string) => void;
}) {
  const searches = schools.slice(0, 6).map((school) => school.title).filter(Boolean);
  if (!searches.length) return null;

  return (
    <div className="mt-6 text-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Popular searches</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {searches.map((search, index) => (
          <button
            key={search}
            type="button"
            onClick={() => onSelect(search)}
            className="text-sm font-medium text-white/90 underline decoration-white/35 underline-offset-4 transition hover:text-secondary hover:decoration-secondary"
          >
            {search}
            {index < searches.length - 1 ? <span className="ml-4 text-white/35" aria-hidden>│</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        name={value === allValue ? undefined : name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full border-0 border-b border-primary/20 bg-transparent px-1 text-sm font-semibold text-primary outline-none transition focus:border-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <option value={allValue}>All</option>
        {options
          .filter((option) => option.value)
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </label>
  );
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]),
  ).slice(0, 8);
}

function normalizeSearchProgramme(record: Record<string, unknown>): HomeProgrammeCard {
  const department = (record.department as Record<string, unknown> | undefined) ?? {};
  const school = (department.school as Record<string, unknown> | undefined) ?? {};
  const name = String(record.name ?? "Programme");
  const slug = String(record.slug ?? record.id ?? "");
  const departmentName = String(record.department_name ?? department.name ?? "");
  const duration = String(record.duration ?? "");
  const mode = String(record.mode_of_study ?? "");

  return {
    id: String(record.id ?? slug),
    title: name,
    eyebrow: String(record.level ?? "Programme"),
    body: [departmentName, duration, mode].filter(Boolean).join(" · "),
    href: `/academics/programmes/${slug}`,
    action: "View programme",
    meta: String(record.level ?? ""),
    schoolId: String(department.school_id ?? school.id ?? "") || null,
    schoolName: String(department.school_name ?? school.name ?? "") || null,
  };
}

function programmeSearchHref({
  query,
  schoolId,
  level,
  mode,
}: {
  query: string;
  schoolId: string;
  level: string;
  mode: string;
}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (schoolId !== allValue) params.set("school_id", schoolId);
  if (level !== allValue) params.set("level", level);
  if (mode !== allValue) params.set("mode_of_study", mode);
  const suffix = params.toString();
  return suffix ? `/academics/programmes?${suffix}` : "/academics/programmes";
}
