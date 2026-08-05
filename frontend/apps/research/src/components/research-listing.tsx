"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Badge, StatusMessage } from "./research-ui";
import { FilterDrawerSheet, ActiveFilterChips } from "@ksu/ui/components";
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
  options: SelectChoice[];
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
  formId?: string;
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
  const formId = useId().replaceAll(":", "");
  const activeFilterItems: { key: string; label: string; value: string }[] = [];

  if (searchValue) {
    activeFilterItems.push({ key: "q", label: "Search", value: searchValue });
  }

  for (const select of selects) {
    if (select.value) {
      activeFilterItems.push({ key: select.name, label: select.label, value: select.value });
    }
  }

  for (const filter of textFilters) {
    if (filter.value) {
      activeFilterItems.push({ key: filter.name, label: filter.label, value: filter.value });
    }
  }

  if (centerValue) {
    activeFilterItems.push({ key: "center", label: "Center", value: centerValue });
  }

  if (projectValue) {
    activeFilterItems.push({ key: "project", label: "Project", value: projectValue });
  }

  if (sortValue) {
    activeFilterItems.push({ key: "sort", label: "Sort", value: sortValue });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-3">
        <form id={formId} action={action} className="flex gap-2 md:gap-3">
          <ResearchTextField
            name="q"
            label="Search"
            value={searchValue}
            placeholder={searchPlaceholder}
            type="search"
            className="flex-1"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Search
          </button>
          <FilterDrawerSheet
            filterLabel="Filter"
            formId={formId}
            filterCount={activeFilterItems.length}
            activeFilters={activeFilterItems}
            onRemoveFilter={(_key) => {
              window.location.href = resetHref;
            }}
            showReset={!!resetHref}
            onReset={
              resetHref
                ? () => {
                    window.location.href = resetHref;
                  }
                : undefined
            }
          >
            {selects.map((select) => (
              <ResearchSelectField key={select.name} {...select} formId={formId} />
            ))}
            {textFilters.map((filter) => (
              <ResearchTextField
                key={filter.name}
                name={filter.name}
                label={filter.label}
                value={filter.value}
                placeholder={filter.placeholder}
                formId={formId}
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
                formId={formId}
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
                formId={formId}
              />
            ) : null}
            {sortOptions.length > 0 ? (
              <ResearchSelectField
                name="sort"
                label="Sort"
                value={sortValue ?? sortOptions[0]?.value}
                options={sortOptions}
                includeAllOption={false}
                formId={formId}
              />
            ) : null}
          </FilterDrawerSheet>
        </form>
        <ActiveFilterChips
          filters={activeFilterItems}
          onRemove={(_key) => {
            window.location.href = resetHref;
          }}
        />
      </div>
    </div>
  );
}

export function ResearchSelectField({
  name,
  label,
  value,
  options,
  allLabel,
  includeAllOption = true,
  formId,
  className = "",
}: ResearchSelectFieldProps) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <select
        form={formId}
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
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
  formId,
  type = "text",
  className = "",
}: TextFilter & {
  formId?: string;
  type?: "search" | "text";
  className?: string;
}) {
  const isSearch = type === "search";

  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <span className="relative mt-2 block">
        {isSearch ? (
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
          />
        ) : null}
        <input
          form={formId}
          type={type}
          name={name}
          defaultValue={value ?? ""}
          placeholder={placeholder}
          autoComplete="off"
          className={`h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none ring-ring transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 ${
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
    <article className="group flex min-h-[220px] flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-wrap gap-2">
        {cleanBadges.map((badge) => (
          <Badge key={badge}>{badge}</Badge>
        ))}
        {cleanFilledBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
          >
            {badge}
          </span>
        ))}
      </div>
      <h2 className="mt-3 text-pretty font-display text-lg font-semibold leading-7 text-foreground">
        <Link href={href} className="rounded-sm transition hover:text-primary">
          {title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-pretty text-sm leading-6 text-muted-foreground">{description}</p>
      {facts.length > 0 ? (
        <dl className="mt-auto grid grid-cols-2 gap-2 pt-4 text-sm">
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
    <div className="rounded-md bg-surface-subtle p-2.5">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-foreground">
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
    <article className="group grid gap-4 p-4 transition hover:bg-surface-subtle/70 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          {cleanBadges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
          {cleanFilledBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
        <h2 className="mt-3 text-pretty font-display text-lg font-semibold leading-7 text-foreground">
          <Link href={href} className="rounded-sm transition hover:text-primary">
            {title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-pretty text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <dl className="grid gap-2 text-sm">
        {facts.map((fact) => (
          <ResearchListingFact key={fact.label} label={fact.label} value={fact.value} />
        ))}
      </dl>
      <Link
        href={href}
        aria-label="Open item"
        className="hidden h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-primary transition group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white lg:inline-flex"
      >
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
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
      <div className="grid gap-3">
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
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      {records.error || error ? (
        <StatusMessage tone="error">{records.error || error}</StatusMessage>
      ) : null}
      <div className="divide-y divide-border">
        {visibleRecords.map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            {getRecordLabels(record, labelFields).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {getRecordLabels(record, labelFields).map((label) => (
                <Badge key={label}>{label}</Badge>
              ))}
            </div>
            ) : null}
            <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
              {getRecordTitle(record)}
            </h3>
            {getRecordDescription(record, descriptionFields) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
      <h2 className="mt-4 text-pretty font-display text-xl font-semibold leading-7 text-foreground">
        {getRecordTitle(record)}
      </h2>
      {getRecordDescription(record, descriptionFields) ? (
        <p className="mt-3 text-pretty text-sm leading-7 text-muted-foreground">
          {getRecordDescription(record, descriptionFields)}
        </p>
      ) : null}
      {meta.length > 0 ? (
        <p className="mt-5 rounded-md bg-surface-subtle p-3 text-sm font-semibold text-muted-foreground">
          {meta.join(" · ")}
        </p>
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
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
