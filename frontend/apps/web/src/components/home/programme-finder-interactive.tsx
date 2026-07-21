"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
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
  const deferredQuery = useDeferredValue(query);

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
  const matchingProgrammes = useMemo(() => {
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

  const actionHref = programmeSearchHref({ query, schoolId, level, mode });
  const resultSetKey = [deferredQuery, schoolId, level, mode].join(":");
  const hasActiveFilters =
    query.trim() ||
    schoolId !== allValue ||
    level !== allValue ||
    mode !== allValue;
  const previewItems = (
    hasActiveFilters ? matchingProgrammes : programmes
  ).slice(0, 3);

  return (
    <>
      <div className="programme-mosaic-search bg-accent/45 p-5 sm:p-6 lg:col-start-5 lg:col-end-13 lg:row-start-1 lg:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              Search the academic catalogue
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
              Find your programme.
            </h3>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Search by ambition, subject, school, or qualification.
          </p>
        </div>

        <form
          action="/academics/programmes"
          className="border border-primary/15 bg-white shadow-sm shadow-primary/5"
        >
          <div className="flex min-h-16 items-center gap-3 border-b border-primary/10 px-4 sm:px-5">
            <Search className="h-6 w-6 text-primary" aria-hidden />
            <input
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by programme, school, or keyword"
              className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              autoComplete="off"
            />
            <button
              type="submit"
              className="hidden min-h-10 items-center justify-center bg-secondary px-5 text-xs font-bold text-white transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
            >
              Search
            </button>
          </div>

          <div className="grid gap-3 px-4 py-3 sm:px-5 md:grid-cols-3">
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
          </div>
        </form>
      </div>

      <div className="programme-mosaic-results p-5 sm:p-6 lg:col-start-4 lg:col-end-10 lg:row-start-2 lg:p-6">
        <div className="flex items-end justify-between gap-4 border-b border-primary/15 pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              Programme directory
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
              {hasActiveFilters ? "Your matches" : "Explore programmes"}
            </h3>
          </div>
          <p
            aria-live="polite"
            className="shrink-0 text-sm text-muted-foreground"
          >
            <strong className="text-xl text-primary">
              {matchingProgrammes.length}
            </strong>{" "}
            {matchingProgrammes.length === 1 ? "programme" : "programmes"}
          </p>
        </div>

        <div aria-live="polite" className="divide-y divide-primary/10">
          {previewItems.length ? (
            previewItems.map((programme, index) => (
              <Link
                key={`${resultSetKey}-${programme.id ?? programme.href}`}
                href={programme.href}
                className="programme-result group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 transition duration-300 hover:bg-accent/45 focus-visible:bg-accent/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:gap-4 sm:px-2"
                style={{ transitionDelay: `${index * 35}ms` }}
              >
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block font-[family-name:var(--font-display)] text-base font-semibold text-primary transition group-hover:text-secondary">
                    {programme.title}
                  </span>
                  <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">
                    {[programme.schoolName, programme.body]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-secondary transition group-hover:translate-x-1" />
              </Link>
            ))
          ) : (
            <div className="border-b border-primary/10 py-5 text-sm leading-6 text-muted-foreground">
              No quick matches in the homepage preview. Open full programme
              search to see all records and filters.
            </div>
          )}
        </div>

        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 border-b border-secondary pb-1 text-sm font-bold text-primary transition hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          View matching programmes
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </>
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
