import type { ReactNode } from "react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchHero, ResearchSection, StatusMessage } from "./research-ui";
import { compactText, formatDate, formatLabel } from "../lib/research-public-data";

type DetailSection = {
  title: string;
  fields: string[];
};

type FactField = {
  label: string;
  field: string;
  format?: "date" | "label";
};

export function ResearchRecordDetail({
  record,
  error,
  eyebrow,
  backLabel,
  backHref,
  labelFields = ["category", "type", "status"],
  factFields = [],
  sections = [],
  children,
}: {
  record: ResearchGenericRecord;
  error?: string | null;
  eyebrow: string;
  backLabel: string;
  backHref: string;
  labelFields?: string[];
  factFields?: FactField[];
  sections?: DetailSection[];
  children?: ReactNode;
}) {
  const title = getTitle(record);
  const body = getFirstText(record, [
    "summary",
    "abstract",
    "about",
    "description",
    "impact",
  ]);
  const labels = labelFields
    .map((field) => formatLabel(compactText(record[field])))
    .filter(Boolean);
  const facts = factFields
    .map((item) => ({
      label: item.label,
      value: formatFact(record[item.field], item.format),
    }))
    .filter((item) => item.value);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow={eyebrow}
        title={title}
        body={body}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: backLabel, href: backHref },
          { label: title },
        ]}
      >
        {labels.length > 0 || facts.length > 0 ? (
          <div className="grid gap-4 text-white">
            {labels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(labels)).slice(0, 4).map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            {facts.length > 0 ? (
              <dl className="grid grid-cols-2 gap-3">
                {facts.slice(0, 4).map((fact) => (
                  <div key={fact.label} className="rounded-md border border-white/15 bg-white/10 p-3">
                    <dt className="text-xs font-semibold uppercase text-white/65">{fact.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </ResearchHero>

      {error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Record"
        title={title}
        body={compactText(record.code) ? `Code: ${compactText(record.code)}` : undefined}
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {sections.map((section) => (
              <DetailTextSection key={section.title} record={record} section={section} />
            ))}
            {children}
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-md bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">{fact.label}</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {labels.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {Array.from(new Set(labels)).map((label) => (
                  <Badge key={label}>{label}</Badge>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </ResearchSection>
    </main>
  );
}

function DetailTextSection({
  record,
  section,
}: {
  record: ResearchGenericRecord;
  section: DetailSection;
}) {
  const entries = section.fields
    .map((field) => ({ label: formatLabel(field), value: compactText(record[field]) }))
    .filter((entry) => entry.value);

  if (entries.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
      <div className="mt-4 space-y-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-xs font-semibold uppercase text-slate-500">{entry.label}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">
              {entry.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTitle(record: ResearchGenericRecord) {
  return (
    compactText(record.title) ||
    compactText(record.name) ||
    compactText(record.display_name) ||
    compactText(record.organization_name) ||
    compactText(record.code) ||
    compactText(record.id)
  );
}

function getFirstText(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    const value = compactText(record[field]);
    if (value) return value;
  }
  return "";
}

function formatFact(value: unknown, format?: "date" | "label") {
  if (format === "date") return formatDate(value as string | null | undefined);
  if (format === "label") return formatLabel(compactText(value as string | null | undefined));
  return compactText(value as string | number | null | undefined);
}
