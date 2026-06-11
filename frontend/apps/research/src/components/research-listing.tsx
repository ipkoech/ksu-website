import Link from "next/link";
import { Badge, StatusMessage } from "./research-ui";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  compactText,
  formatDate,
  formatLabel,
  type PublicResearchData,
} from "../lib/research-public-data";

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
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {getRecordTitle(record)}
      </h2>
      {getRecordDescription(record, descriptionFields) ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">
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
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
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
