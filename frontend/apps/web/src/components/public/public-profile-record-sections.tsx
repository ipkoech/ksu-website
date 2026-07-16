"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";

export type PublicProfileRecord = {
  title: string;
  meta: string[];
  category?: string | null;
  description?: string | null;
  href?: string | null;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function recordCategory(record: PublicProfileRecord, fallbackCategory: string) {
  return record.category?.trim() || fallbackCategory;
}

function recordYear(record: PublicProfileRecord) {
  return record.meta.find((item) => /^(19|20)\d{2}/.test(item.trim())) ?? null;
}

function recordMeta(record: PublicProfileRecord) {
  return uniqueValues(record.meta.filter((item) => item !== record.category));
}

function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("book")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalized.includes("journal")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized.includes("conference") || normalized.includes("workshop")) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (normalized.includes("press") || normalized.includes("manuscript")) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  return "border-primary/15 bg-primary/[0.06] text-primary";
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-semibold normal-case tracking-normal text-muted-foreground shadow-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PublicationRecordBrowser({
  title,
  records,
  itemLabel,
  noMatchText,
  fallbackCategory = title,
  pageSize = 9,
}: {
  title: string;
  records: PublicProfileRecord[];
  itemLabel: string;
  noMatchText: string;
  fallbackCategory?: string;
  pageSize?: number;
}) {
  const [category, setCategory] = useState("All Categories");
  const [year, setYear] = useState("All Years");
  const [sort, setSort] = useState("Newest First");
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(
    () => [
      "All Categories",
      ...uniqueValues(
        records.map((record) => recordCategory(record, fallbackCategory)),
      ),
    ],
    [fallbackCategory, records],
  );
  const yearOptions = useMemo(
    () => [
      "All Years",
      ...uniqueValues(records.map(recordYear)).sort((a, b) =>
        b.localeCompare(a),
      ),
    ],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const filtered = records.filter((record) => {
      const matchesCategory =
        category === "All Categories" ||
        recordCategory(record, fallbackCategory) === category;
      const matchesYear = year === "All Years" || recordYear(record) === year;
      return matchesCategory && matchesYear;
    });

    return [...filtered].sort((left, right) => {
      const leftYear = recordYear(left) ?? "";
      const rightYear = recordYear(right) ?? "";
      return sort === "Oldest First"
        ? leftYear.localeCompare(rightYear)
        : rightYear.localeCompare(leftYear);
    });
  }, [category, fallbackCategory, records, sort, year]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = filteredRecords.length ? (safePage - 1) * pageSize : 0;
  const visibleRecords = filteredRecords.slice(start, start + pageSize);
  const end = start + visibleRecords.length;

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function updateYear(value: string) {
    setYear(value);
    setPage(1);
  }

  function updateSort(value: string) {
    setSort(value);
    setPage(1);
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredRecords.length
              ? `Showing ${start + 1}–${end} of ${filteredRecords.length} ${itemLabel}`
              : noMatchText}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectControl
            label="Category"
            value={category}
            options={categoryOptions}
            onChange={updateCategory}
          />
          <SelectControl
            label="Year"
            value={year}
            options={yearOptions}
            onChange={updateYear}
          />
          <SelectControl
            label="Sort"
            value={sort}
            options={["Newest First", "Oldest First"]}
            onChange={updateSort}
          />
        </div>
      </div>

      {visibleRecords.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleRecords.map((record, index) => {
            const categoryLabel = recordCategory(record, fallbackCategory);
            const meta = recordMeta(record);
            const yearValue = recordYear(record);
            return (
              <article
                key={`${record.title}-${start + index}`}
                className="flex min-h-[15rem] flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em]",
                      categoryTone(categoryLabel),
                    ].join(" ")}
                  >
                    {categoryLabel}
                  </span>
                  {yearValue ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                      {yearValue}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-sm font-bold leading-6 text-foreground">
                  {record.title}
                </h3>

                {record.description && record.description !== record.title ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {record.description}
                  </p>
                ) : null}

                {meta.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meta
                      .filter((item) => item !== yearValue)
                      .slice(0, 3)
                      .map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-surface-muted px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                ) : null}

                {record.href ? (
                  <a
                    href={record.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary"
                  >
                    Open publication
                    <ExternalLink aria-hidden className="h-4 w-4" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted-foreground">
          {noMatchText}
        </p>
      )}

      {filteredRecords.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={safePage === 1}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-bold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={safePage === totalPages}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-bold text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FundingRecordList({
  records,
}: {
  records: PublicProfileRecord[];
}) {
  return (
    <div className="grid gap-3">
      {records.map((record, index) => {
        const meta = recordMeta(record);
        const amount = meta.find((item) => /(?:US\$|KES|KSH|\$)/i.test(item));
        const year = recordYear(record);
        const funder = meta[0];
        return (
          <article
            key={`${record.title}-${index}`}
            className="grid gap-4 rounded-xl border border-border bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px]"
          >
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Banknote aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-6 text-foreground">
                  {record.title}
                </h3>
                {funder ? (
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {funder}
                  </p>
                ) : null}
                {record.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {record.description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {amount ? (
                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                  {amount}
                </span>
              ) : null}
              {year ? (
                <span className="rounded-lg bg-surface-muted px-3 py-2 text-sm font-bold text-muted-foreground">
                  {year}
                </span>
              ) : null}
              {meta
                .filter(
                  (item) => item !== amount && item !== year && item !== funder,
                )
                .slice(0, 3)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-lg bg-surface-subtle px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function TimelineRecordList({
  records,
  tone = "award",
}: {
  records: PublicProfileRecord[];
  tone?: "award" | "activity";
}) {
  const Icon = tone === "award" ? Award : Users;

  return (
    <ol className="relative grid gap-4 border-l border-border pl-5">
      {records.map((record, index) => {
        const year = recordYear(record);
        const meta = recordMeta(record).filter((item) => item !== year);
        return (
          <li key={`${record.title}-${index}`} className="relative">
            <span className="absolute -left-[2.15rem] flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-sm">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <article className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="max-w-3xl text-sm font-bold leading-6 text-foreground">
                  {record.title}
                </h3>
                {year ? (
                  <span className="rounded-full bg-primary/[0.08] px-3 py-1 text-xs font-bold text-primary">
                    {year}
                  </span>
                ) : null}
              </div>
              {record.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {record.description}
                </p>
              ) : null}
              {meta.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {meta.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-surface-muted px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export function InnovationRecordGrid({
  records,
}: {
  records: PublicProfileRecord[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record, index) => (
        <article
          key={`${record.title}-${index}`}
          className="rounded-xl border border-border bg-[linear-gradient(135deg,#ffffff_0%,hsl(var(--surface-subtle))_100%)] p-4 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Sparkles aria-hidden className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-sm font-bold leading-6 text-foreground">
            {record.title}
          </h3>
          {record.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {record.description}
            </p>
          ) : null}
          {recordMeta(record).length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recordMeta(record)
                .slice(0, 3)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted-foreground ring-1 ring-ring"
                  >
                    {item}
                  </span>
                ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function RefereeRecordGrid({
  records,
}: {
  records: PublicProfileRecord[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record, index) => (
        <article
          key={`${record.title}-${index}`}
          className="rounded-xl border border-border bg-white p-4 shadow-sm"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
            <Users aria-hidden className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-sm font-bold leading-6 text-foreground">
            {record.title}
          </h3>
          {record.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {record.description}
            </p>
          ) : null}
          <div className="mt-4 grid gap-2">
            {recordMeta(record)
              .slice(0, 4)
              .map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Mail aria-hidden className="h-4 w-4 text-primary" />
                  {item}
                </span>
              ))}
          </div>
        </article>
      ))}
    </div>
  );
}
