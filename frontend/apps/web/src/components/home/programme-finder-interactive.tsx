"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, GraduationCap, Search } from "lucide-react";
import type { HomeProgrammeCard, HomeSchoolCard } from "@/lib/homepage-data";

type ProgrammeFinderInteractiveProps = {
  programmes: HomeProgrammeCard[];
  schools: HomeSchoolCard[];
  categories: Array<{
    id: string;
    title?: string | null;
    href?: string | null;
  }>;
};

const allValue = "all";

export function ProgrammeFinderInteractive({
  programmes,
  schools,
  categories,
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
  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return programmes
      .filter((programme) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            programme.title,
            programme.body,
            programme.schoolName,
            programme.meta,
          ]
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
      })
      .slice(0, 3);
  }, [deferredQuery, level, mode, programmes, schoolId]);

  const actionHref = programmeSearchHref({ query, schoolId, level, mode });
  const hasActiveFilters =
    query.trim() ||
    schoolId !== allValue ||
    level !== allValue ||
    mode !== allValue;
  const previewItems = hasActiveFilters ? filtered : programmes.slice(0, 3);

  return (
    <div className="relative z-10">
      <form
        action="/academics/programmes"
        className="overflow-hidden border border-blue-100 bg-white shadow-lg shadow-primary/10"
      >
        <div className="flex min-h-14 items-center gap-3 border-b border-blue-100 px-4">
          <Search className="h-5 w-5 text-primary" aria-hidden />
          <input
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by programme, school, or keyword"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
            autoComplete="off"
          />
          <button
            type="submit"
            className="hidden min-h-10 items-center justify-center bg-primary px-4 text-xs font-bold text-white transition hover:bg-primary/90 sm:inline-flex"
          >
            Search
          </button>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-3">
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

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.slice(0, 5).map((category) => (
          <Link
            key={category.id}
            href={category.href ?? "/academics/programmes"}
            className="inline-flex min-h-9 items-center rounded-full border border-blue-100 bg-white px-3 text-xs font-semibold text-primary transition hover:border-primary/25 hover:bg-blue-50"
          >
            {category.title}
          </Link>
        ))}
      </div>

      <div
        aria-live="polite"
        className="mt-5 grid gap-2 transition-all duration-300"
      >
        {previewItems.length ? (
          previewItems.map((programme) => (
            <Link
              key={programme.id ?? programme.href}
              href={programme.href}
              className="group flex items-center gap-3 border border-blue-100 bg-white/92 p-3 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-sm font-semibold text-slate-950">
                  {programme.title}
                </span>
                <span className="mt-1 line-clamp-1 block text-xs text-slate-500">
                  {[programme.schoolName, programme.body]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-primary opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          ))
        ) : (
          <div className="border border-dashed border-blue-200 bg-white/70 p-4 text-sm leading-6 text-slate-600">
            No quick matches in the homepage preview. Open full programme search
            to see all records and filters.
          </div>
        )}
      </div>

      <Link
        href={actionHref}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        View matching programmes
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
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
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <select
        name={value === allValue ? undefined : name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full border border-blue-100 bg-blue-50/40 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary/40 focus:bg-white"
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
