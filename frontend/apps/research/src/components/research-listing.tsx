import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Badge, StatusMessage } from "./research-ui";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  compactText,
  formatDate,
  formatLabel,
  type PublicResearchData,
} from "../lib/research-public-data";

type FilterOption = {
  name: string;
  label: string;
  value?: string;
  options: string[];
};

type CenterOption = {
  id?: string;
  name?: string | null;
  title?: string | null;
  code?: string | null;
};

type ProjectOption = CenterOption;

type SortOption = {
  value: string;
  label: string;
};

type SelectChoice = string | { value: string; label: string };

type ResearchSelectFieldProps = {
  name: string;
  label: string;
  value?: string;
  options: SelectChoice[];
  allLabel?: string;
  includeAllOption?: boolean;
  className?: string;
};

type TextFilter = {
  name: string;
  label: string;
  value?: string;
  placeholder: string;
};

type ListingFact = {
  label: string;
  value: string;
};

export function ResearchFilterForm({
  action,
  resetHref,
  searchValue,
  searchPlaceholder,
  textFilters = [],
  selects = [],
  centers,
  centerValue,
  projects,
  projectValue,
  sortValue,
  sortOptions = [],
}: {
  action: string;
  resetHref: string;
  searchValue?: string;
  searchPlaceholder: string;
  textFilters?: TextFilter[];
  selects?: FilterOption[];
  centers?: CenterOption[];
  centerValue?: string;
  projects?: ProjectOption[];
  projectValue?: string;
  sortValue?: string;
  sortOptions?: SortOption[];
}) {
  return (
    <form
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
      action={action}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <ResearchTextField
          name="q"
          label="Search"
          value={searchValue}
          placeholder={searchPlaceholder}
          type="search"
          className="xl:col-span-2"
        />

        {selects.map((select) => (
          <ResearchSelectField key={select.name} {...select} />
        ))}

        {textFilters.map((filter) => (
          <ResearchTextField
            key={filter.name}
            name={filter.name}
            label={filter.label}
            value={filter.value}
            placeholder={filter.placeholder}
          />
        ))}

        {centers ? (
          <ResearchSelectField
            name="center"
            label="Center"
            value={centerValue}
            options={centers.map((center) => ({
              value: center.id ?? center.code ?? center.name ?? center.title ?? "",
              label: center.name ?? center.title ?? center.code ?? center.id ?? "Unnamed center",
            }))}
            allLabel="All centers"
            className="md:col-span-2 xl:col-span-2"
          />
        ) : null}

        {projects ? (
          <ResearchSelectField
            name="project"
            label="Project"
            value={projectValue}
            options={projects.map((project) => ({
              value: project.id ?? project.code ?? project.title ?? project.name ?? "",
              label: project.title ?? project.name ?? project.code ?? project.id ?? "Unnamed project",
            }))}
            allLabel="All projects"
            className="md:col-span-2 xl:col-span-2"
          />
        ) : null}

        {sortOptions.length > 0 ? (
          <ResearchSelectField
            name="sort"
            label="Sort"
            value={sortValue ?? sortOptions[0]?.value}
            options={sortOptions}
            includeAllOption={false}
          />
        ) : null}

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            Apply Filters
          </button>
          <Link
            href={resetHref}
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            Reset Filters
          </Link>
        </div>
      </div>
    </form>
  );
}

export function ResearchSelectField({
  name,
  label,
  value,
  options,
  allLabel,
  includeAllOption = true,
  className = "",
}: ResearchSelectFieldProps) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
      >
        {includeAllOption ? <option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option> : null}
        {normalizeOptions(options).map((option) => (
          <option key={`${name}-${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResearchTextField({
  name,
  label,
  value,
  placeholder,
  type = "text",
  className = "",
}: TextFilter & {
  type?: "search" | "text";
  className?: string;
}) {
  const isSearch = type === "search";

  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <span className="relative mt-2 block">
        {isSearch ? (
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
        ) : null}
        <input
          type={type}
          name={name}
          defaultValue={value ?? ""}
          placeholder={placeholder}
          autoComplete="off"
          className={`h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4 ${
            isSearch ? "pl-9" : ""
          }`}
        />
      </span>
    </label>
  );
}

function normalizeOptions(options: SelectChoice[]) {
  const seen = new Set<string>();

  return options
    .map((option) =>
      typeof option === "string"
        ? { value: option, label: formatLabel(option) }
        : option,
    )
    .filter((option) => {
      const key = `${option.value}-${option.label}`;
      if (!option.value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function ResearchListCard({
  href,
  title,
  description,
  badges = [],
  filledBadges = [],
  facts = [],
}: {
  href: string;
  title: ReactNode;
  description: ReactNode;
  badges?: Array<string | null | undefined>;
  filledBadges?: Array<string | null | undefined>;
  facts?: ListingFact[];
}) {
  const cleanBadges = uniqueDisplayValues(
    badges.map((badge) => formatLabel(compactText(badge))),
  );
  const cleanFilledBadges = uniqueDisplayValues(filledBadges.map((badge) => compactText(badge)));

  return (
    <article className="flex min-h-[340px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap gap-2">
        {cleanBadges.map((badge) => (
          <Badge key={badge}>{badge}</Badge>
        ))}
        {cleanFilledBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase text-primary"
          >
            {badge}
          </span>
        ))}
      </div>
      <h2 className="mt-4 text-pretty text-xl font-semibold leading-7 text-slate-950">
        <Link href={href} className="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
          {title}
        </Link>
      </h2>
      <p className="mt-3 text-pretty text-sm leading-7 text-slate-600">{description}</p>
      {facts.length > 0 ? (
        <dl className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm">
          {facts.map((fact) => (
            <ResearchListingFact key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </dl>
      ) : null}
    </article>
  );
}

export function ResearchListingFact({ label, value }: ListingFact) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">
        {value || "Not published"}
      </dd>
    </div>
  );
}

export function ResearchRecordRow({
  href,
  title,
  description,
  badges = [],
  filledBadges = [],
  facts = [],
}: {
  href: string;
  title: ReactNode;
  description: ReactNode;
  badges?: Array<string | null | undefined>;
  filledBadges?: Array<string | null | undefined>;
  facts?: ListingFact[];
}) {
  const cleanBadges = uniqueDisplayValues(
    badges.map((badge) => formatLabel(compactText(badge))),
  );
  const cleanFilledBadges = uniqueDisplayValues(filledBadges.map((badge) => compactText(badge)));

  return (
    <article className="grid gap-4 p-5 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap gap-2">
          {cleanBadges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
          {cleanFilledBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase text-primary"
            >
              {badge}
            </span>
          ))}
        </div>
        <h2 className="mt-4 text-pretty text-xl font-semibold leading-7 text-slate-950">
          <Link href={href} className="rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
            {title}
          </Link>
        </h2>
        <p className="mt-3 text-pretty text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <dl className="grid gap-3 text-sm">
        {facts.map((fact) => (
          <ResearchListingFact key={fact.label} label={fact.label} value={fact.value} />
        ))}
      </dl>
    </article>
  );
}

export function GenericRecordGrid({
  records,
  error,
  labelFields = ["category", "type", "status"],
  descriptionFields = ["summary", "description", "about", "bio", "impact"],
  metaFields = [],
  hrefBase,
}: {
  records: PublicResearchData<ResearchGenericRecord>;
  error?: string | null;
  emptyMessage?: string;
  labelFields?: string[];
  descriptionFields?: string[];
  metaFields?: string[];
  hrefBase?: string;
}) {
  return (
    <>
      {records.error || error ? (
        <StatusMessage tone="error">{records.error || error}</StatusMessage>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {records.data.map((record) => (
          <GenericRecordCard
            key={record.id}
            record={record}
            labelFields={labelFields}
            descriptionFields={descriptionFields}
            metaFields={metaFields}
            href={getRecordHref(record, hrefBase)}
          />
        ))}
      </div>
    </>
  );
}

export function GenericRecordList({
  records,
  error,
  labelFields = ["category", "type", "status"],
  descriptionFields = ["summary", "description", "about", "bio", "impact"],
  limit,
}: {
  records: PublicResearchData<ResearchGenericRecord>;
  error?: string | null;
  emptyMessage?: string;
  labelFields?: string[];
  descriptionFields?: string[];
  limit?: number;
}) {
  const visibleRecords = limit ? records.data.slice(0, limit) : records.data;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {records.error || error ? (
        <StatusMessage tone="error">{records.error || error}</StatusMessage>
      ) : null}
      <div className="divide-y divide-slate-200">
        {visibleRecords.map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            {getRecordLabels(record, labelFields).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {getRecordLabels(record, labelFields).map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
            ) : null}
            <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
              {getRecordTitle(record)}
            </h3>
            {getRecordDescription(record, descriptionFields) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {getRecordDescription(record, descriptionFields)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function GenericRecordCard({
  record,
  labelFields,
  descriptionFields,
  metaFields,
  href,
}: {
  record: ResearchGenericRecord;
  labelFields: string[];
  descriptionFields: string[];
  metaFields: string[];
  href?: string;
}) {
  const labels = getRecordLabels(record, labelFields);
  const meta = metaFields
    .map((field) => formatRecordValue(record[field]))
    .filter(Boolean);

  const content = (
    <>
      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
        </div>
      ) : null}
      <h2 className="mt-4 text-pretty text-xl font-semibold leading-7 text-slate-950">
        {getRecordTitle(record)}
      </h2>
      {getRecordDescription(record, descriptionFields) ? (
        <p className="mt-3 text-pretty text-sm leading-7 text-slate-600">
          {getRecordDescription(record, descriptionFields)}
        </p>
      ) : null}
      {meta.length > 0 ? (
        <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          {meta.join(" · ")}
        </p>
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

function getRecordTitle(record: ResearchGenericRecord) {
  return (
    compactText(record.title) ||
    compactText(record.name) ||
    compactText(record.display_name) ||
    compactText(record.organization_name) ||
    compactText(record.code) ||
    compactText(record.id)
  );
}

function getRecordDescription(
  record: ResearchGenericRecord,
  fields: string[],
) {
  for (const field of fields) {
    const value = compactText(record[field]);
    if (value) return value;
  }
  return "";
}

function getRecordLabels(record: ResearchGenericRecord, fields: string[]) {
  const values = fields
    .map((field) => formatLabel(compactText(record[field])))
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, 3);
}

function formatRecordValue(value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value);
  }
  return compactText(value as string | number | null | undefined);
}

function getRecordHref(record: ResearchGenericRecord, hrefBase?: string) {
  const slug = compactText(record.slug);
  if (!hrefBase || !slug) return undefined;
  return `${hrefBase}/${slug}`;
}

function uniqueDisplayValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
