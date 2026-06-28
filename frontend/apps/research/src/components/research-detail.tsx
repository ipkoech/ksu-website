import Link from "next/link";
import type { ReactNode } from "react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ArrowRight } from "lucide-react";
import { Badge, ResearchSection, StatusMessage } from "./research-ui";
import { ResearchImmersiveHero } from "./research-immersive-hero";
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

export type DetailAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type DetailFact = {
  label: string;
  value?: string | number | null;
};

export function ResearchDetailHero({
  eyebrow,
  title,
  body,
  breadcrumbs,
  labels = [],
  facts = [],
  actions = [],
  imageSrc = "/images/research/research-home-hero.webp",
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  breadcrumbs: { label: string; href?: string }[];
  labels?: Array<string | null | undefined>;
  facts?: DetailFact[];
  actions?: DetailAction[];
  imageSrc?: string;
  imageAlt?: string;
}) {
  const cleanLabels = Array.from(
    new Set(labels.map((label) => formatLabel(compactText(label))).filter(Boolean)),
  );
  const cleanFacts = facts
    .map((fact) => ({ label: fact.label, value: compactText(fact.value) }))
    .filter((fact) => fact.value);
  const primaryAction = actions.find((action) => action.variant !== "secondary");
  const secondaryAction =
    actions.find((action) => action.variant === "secondary") ??
    actions.find((action) => action !== primaryAction);

  return (
    <>
      <ResearchImmersiveHero
        size="detail"
        breadcrumbs={breadcrumbs}
        showControls={false}
        slides={[
          {
            id: "detail",
            eyebrow,
            title,
            body,
            imageSrc,
            imageAlt: imageAlt || title,
            primaryAction,
            secondaryAction,
            stats: cleanFacts.slice(0, 4),
          },
        ]}
      />

      {cleanLabels.length > 0 || cleanFacts.length > 0 || actions.length > 0 ? (
        <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto grid w-full max-w-[1680px] gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              {cleanLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cleanLabels.map((label) => (
                    <Badge key={label}>{label}</Badge>
                  ))}
                </div>
              ) : null}
              {cleanFacts.length > 0 ? (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {cleanFacts.map((fact) => (
                    <div key={fact.label} className="min-w-0 rounded-md bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase text-slate-500">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-slate-950 [overflow-wrap:anywhere]">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            {actions.length > 0 ? (
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {actions.map((action) => (
                  <a
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    className={
                      action.variant === "secondary"
                        ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                        : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    }
                  >
                    {action.label}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

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
      <ResearchDetailHero
        eyebrow={eyebrow}
        title={title}
        body={body}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: backLabel, href: backHref },
          { label: title },
        ]}
        labels={labels}
        facts={facts}
        actions={[{ label: `Back to ${backLabel}`, href: backHref, variant: "secondary" }]}
       />

      {error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            {sections.map((section) => (
              <DetailTextSection key={section.title} record={record} section={section} />
            ))}
            {children}
          </div>
          <ResearchDetailSidebar facts={facts} labels={labels} />
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
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{section.title}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-xs font-semibold uppercase text-slate-500">{entry.label}</p>
            <p className="mt-1 break-words whitespace-pre-line text-sm leading-7 text-slate-600">
              {entry.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ResearchTextPanel({
  title,
  fields,
  empty = "This information has not been published yet.",
}: {
  title: string;
  fields: Array<[string, string | number | null | undefined]>;
  empty?: string;
}) {
  const entries = fields
    .map(([label, value]) => [label, compactText(value)] as const)
    .filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {title}
      </h2>
      {entries.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {entries.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-1 break-words whitespace-pre-line text-sm leading-7 text-slate-600">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{empty}</p>
      )}
    </section>
  );
}

export function ResearchFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950 [overflow-wrap:anywhere]">
        {value || "Not published"}
      </dd>
    </div>
  );
}

export function ResearchActionLink({ action }: { action: DetailAction }) {
  return (
    <a
      href={action.href}
      className={
        action.variant === "secondary"
          ? "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      }
    >
      {action.label}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </a>
  );
}

export function ResearchDetailSidebar({
  labels = [],
  facts = [],
  actions = [],
}: {
  labels?: Array<string | null | undefined>;
  facts?: DetailFact[];
  actions?: DetailAction[];
}) {
  const cleanLabels = Array.from(
    new Set(labels.map((label) => formatLabel(compactText(label))).filter(Boolean)),
  );
  const cleanFacts = facts
    .map((fact) => ({ label: fact.label, value: compactText(fact.value) }))
    .filter((fact) => fact.value);

  if (cleanLabels.length === 0 && cleanFacts.length === 0 && actions.length === 0) {
    return null;
  }

  return (
    <aside className="h-fit min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {cleanLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {cleanLabels.map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
        </div>
      ) : null}
      {cleanFacts.length > 0 ? (
        <dl className="mt-5 grid gap-3 text-sm">
          {cleanFacts.map((fact) => (
            <ResearchFact key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </dl>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-5 flex flex-col gap-3">
          {actions.map((action) => (
            <ResearchActionLink key={`${action.label}-${action.href}`} action={action} />
          ))}
        </div>
      ) : null}
    </aside>
  );
}

export function ResearchSidePanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="h-fit min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={eyebrow ? "mt-3 text-xl font-semibold text-slate-950" : "text-xl font-semibold text-slate-950"}>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

export function ResearchRecordPanel({
  title,
  records,
  hrefBase,
  empty = "No public records are linked yet.",
}: {
  title: string;
  records: ResearchGenericRecord[];
  hrefBase?: string;
  empty?: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record, index) => (
          <SimpleRecordItem
            key={record.id ?? `${title}-${index}`}
            record={record}
            index={index}
            hrefBase={hrefBase}
          />
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">{empty}</p>
        ) : null}
      </div>
    </section>
  );
}

export function ResearchRecordGrid({
  records,
  empty = "No supporting files are linked yet.",
}: {
  records: ResearchGenericRecord[];
  empty?: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {records.map((record, index) => (
        <article key={record.id ?? index} className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            {record.name ?? record.title ?? record.file_name ?? record.document_name ?? `File ${index + 1}`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {compactText(record.description) ||
              compactText(record.summary) ||
              compactText(record.caption) ||
              "Supporting resource"}
          </p>
          {record.url || record.file_url || record.document_url ? (
            <a href={record.url ?? record.file_url ?? record.document_url} className="mt-3 inline-flex text-sm font-semibold text-primary">
              Open file
            </a>
          ) : null}
        </article>
      ))}
      {records.length === 0 ? <StatusMessage>{empty}</StatusMessage> : null}
    </div>
  );
}

export function ResearchRelationshipCard({
  title,
  record,
  hrefBase,
  empty,
}: {
  title: string;
  record?: ResearchGenericRecord;
  hrefBase: string;
  empty: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {record ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-slate-950">
            {record.slug ? (
              <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                {record.name ?? record.title}
              </Link>
            ) : (
              record.name ?? record.title
            )}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {compactText(record.summary) ||
              compactText(record.about) ||
              compactText(record.description) ||
              "Additional relationship details are not published yet."}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{empty}</p>
      )}
    </section>
  );
}

function SimpleRecordItem({
  record,
  index,
  hrefBase,
}: {
  record: ResearchGenericRecord;
  index: number;
  hrefBase?: string;
}) {
  const title =
    record.name ??
    record.title ??
    record.project_title ??
    record.full_name ??
    record.application_type ??
    record.award_name ??
    record.file_name ??
    record.document_name ??
    `Record ${index + 1}`;

  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <h3 className="text-base font-semibold text-slate-950">
        {hrefBase && record.slug ? (
          <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {compactText(record.motivation) ||
          compactText(record.goals) ||
          compactText(record.role) ||
          compactText(record.bio) ||
          compactText(record.summary) ||
          compactText(record.about) ||
          compactText(record.description) ||
          compactText(record.impact) ||
          compactText(record.organization) ||
          compactText(record.status) ||
          compactText(record.caption) ||
          "Additional details are not published yet."}
      </p>
      {record.url || record.file_url || record.document_url ? (
        <a href={record.url ?? record.file_url ?? record.document_url} className="mt-2 inline-flex text-sm font-semibold text-primary">
          Open resource
        </a>
      ) : null}
    </article>
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
