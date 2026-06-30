import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchFact,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getGrantBySlug,
} from "../../../lib/research-public-data";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.grants.list);
}

export default async function FundingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getGrantBySlug(slug);
  if (!data) notFound();

  const grant = data as ResearchGenericRecord;
  const isExternal = grant.grant_type === "external";
  const guidelines = Array.isArray(grant.guidelines)
    ? (grant.guidelines as ResearchGenericRecord[])
    : [];
  const documents = Array.isArray(grant.documents)
    ? (grant.documents as ResearchGenericRecord[])
    : [];
  const actionUrl = compactText(grant.application_url) || compactText(grant.external_url);
  const deadline = getDeadlineState(compactText(grant.deadline), compactText(grant.status));

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow={isExternal ? "External Funding" : "Internal Funding"}
        title={grant.title ?? "Funding opportunity"}
        body={compactText(grant.summary) || compactText(grant.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Funding", href: "/funding" },
          { label: grant.title ?? "Funding" },
        ]}
        labels={[grant.grant_type, grant.category, grant.status, !isExternal ? deadline.label : null]}
        facts={[
          { label: "Deadline", value: formatDate(grant.deadline) },
          { label: "Funder", value: grant.funder_name },
          { label: "Award range", value: formatAwardRange(grant) },
          { label: "Awards", value: grant.number_of_awards },
        ]}
        actions={[
          { label: "Back to funding", href: "/funding", variant: "secondary" },
          ...(actionUrl
            ? [{ label: isExternal ? "Open funder link" : "Apply or submit", href: actionUrl }]
            : []),
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research funding opportunity and application workflow"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Opportunity Details"
        title={isExternal ? "External opportunity information" : "Internal funding workflow"}
        body={
          isExternal
            ? "External opportunities prioritize funder information, deadline, eligibility, documents, and the official external link."
            : "Internal opportunities show the full application flow, eligibility, award range, documents, guidelines, review dates, and contact."
        }
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            {!isExternal ? <InternalDeadlinePanel deadline={deadline} grant={grant} actionUrl={actionUrl} /> : null}
            <OpportunityEvidence
              title="About this opportunity"
              fields={[
                ["Summary", grant.summary],
                ["Description", grant.description],
                ["Objectives", grant.objectives],
                ["Focus areas", grant.focus_areas],
              ]}
            />
            <OpportunityEvidence
              title="Eligibility and requirements"
              fields={[
                ["Eligibility", grant.eligibility],
                ["Requirements", grant.requirements],
              ]}
            />
            {!isExternal ? <WorkflowDates grant={grant} /> : null}
          </div>
          <ResearchDetailSidebar
            labels={[grant.grant_type ?? "internal", grant.category ?? "research", grant.status]}
            facts={[
              { label: "Deadline", value: formatDate(grant.deadline) },
              { label: "Funder", value: compactText(grant.funder_name) },
              { label: "Award range", value: formatAwardRange(grant) },
              { label: "Total budget", value: formatMoney(grant.total_budget, grant.currency) },
              { label: "Number of awards", value: compactText(grant.number_of_awards) },
            ]}
            actions={
              actionUrl
                ? [{ label: isExternal ? "Open funder link" : "Apply or submit", href: actionUrl }]
                : []
            }
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Downloads"
        title="Guidelines, documents, and contacts"
        body="Downloadable resources are displayed directly from grant documents and grant guideline records."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <DownloadPanel
            title="Grant guidelines"
            records={guidelines}
            empty="No grant guidelines have been published for this opportunity."
          />
          <DownloadPanel
            title="Documents"
            records={documents}
            empty="No downloadable documents have been published for this opportunity."
          />
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <ResearchFact label="Name" value={compactText(grant.contact_name)} />
              <ResearchFact label="Email" value={compactText(grant.contact_email)} />
              <ResearchFact label="Phone" value={compactText(grant.contact_phone)} />
            </dl>
          </section>
        </div>
      </ResearchSection>
    </main>
  );
}

function InternalDeadlinePanel({
  deadline,
  grant,
  actionUrl,
}: {
  deadline: ReturnType<typeof getDeadlineState>;
  grant: ResearchGenericRecord;
  actionUrl: string;
}) {
  return (
    <section className="rounded-lg border-2 border-primary bg-primary/[0.04] p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Internal grant deadline</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">{deadline.label}</h2>
          <p className="mt-2 text-lg font-semibold text-slate-800">{deadline.value}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This is a Kisii University administered grant. Review eligibility, requirements, documents, and workflow dates before submitting.
          </p>
        </div>
        <DeadlineStatusBadge deadline={deadline} />
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResearchFact label="Open date" value={formatDate(grant.open_date)} />
        <ResearchFact label="Review starts" value={formatDate(grant.review_start_date)} />
        <ResearchFact label="Award date" value={formatDate(grant.award_date)} />
      </dl>
      {actionUrl ? (
        <a href={actionUrl} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
          Apply or submit
        </a>
      ) : null}
    </section>
  );
}

function DeadlineStatusBadge({ deadline }: { deadline: ReturnType<typeof getDeadlineState> }) {
  const className =
    deadline.tone === "closed"
      ? "border-slate-300 bg-slate-100 text-slate-700"
      : deadline.tone === "urgent"
        ? "border-red-300 bg-red-50 text-red-700"
        : deadline.tone === "soon"
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-primary/30 bg-primary/[0.08] text-primary";

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-4 py-2 text-base font-semibold ${className}`}>
      {deadline.label}
    </span>
  );
}

function OpportunityEvidence({ title, fields }: { title: string; fields: Array<[string, unknown]> }) {
  const entries = fields
    .map(([label, value]) => ({ label, value: compactText(value as string | number | null | undefined) }))
    .filter((entry) => entry.value);

  if (entries.length === 0) {
    return <StatusMessage>{title} details are not published yet.</StatusMessage>;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-xs font-semibold uppercase text-slate-500">{entry.label}</p>
            <p className="mt-1 break-words whitespace-pre-line text-sm leading-7 text-slate-600">{entry.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkflowDates({ grant }: { grant: ResearchGenericRecord }) {
  const dates = [
    ["Announcement", grant.announcement_date],
    ["Open date", grant.open_date],
    ["Deadline", grant.deadline],
    ["Review starts", grant.review_start_date],
    ["Award date", grant.award_date],
    ["Project starts", grant.project_start_date],
    ["Project ends", grant.project_end_date],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        Application flow
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {dates.map(([label, value]) => (
          <ResearchFact key={label} label={label} value={formatDate(value as string | null | undefined)} />
        ))}
      </div>
    </section>
  );
}

function DownloadPanel({
  title,
  records,
  empty,
}: {
  title: string;
  records: ResearchGenericRecord[];
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.map((record, index) => {
          const href = compactText(record.document_url) || compactText(record.url) || compactText(record.file_url);
          return (
            <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold text-slate-950">
                {record.title ?? record.document_name ?? record.name ?? `Document ${index + 1}`}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                {formatLabel(record.guideline_type ?? record.type ?? record.category ?? "document")}
              </p>
              {href ? (
                <a href={href} className="mt-2 inline-flex text-sm font-semibold text-primary">
                  Download
                </a>
              ) : null}
            </article>
          );
        })}
        {records.length === 0 ? <p className="py-4 text-sm text-slate-600">{empty}</p> : null}
      </div>
    </section>
  );
}

function formatAwardRange(grant: ResearchGenericRecord) {
  const min = formatMoney(grant.min_award, grant.currency);
  const max = formatMoney(grant.max_award, grant.currency);
  if (min && max) return `${min} - ${max}`;
  return min || max;
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function getDeadlineState(deadline?: string | null, status?: string) {
  if (!deadline) {
    return {
      label: "Deadline",
      value: "No deadline published",
      tone: "open" as const,
    };
  }
  const date = new Date(deadline);
  const now = new Date();
  const days = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (status === "closed" || days < 0) {
    return {
      label: "Closed",
      value: formatDate(deadline),
      tone: "closed" as const,
    };
  }
  if (days === 0) {
    return {
      label: "Due today",
      value: formatDate(deadline),
      tone: "urgent" as const,
    };
  }
  if (days <= 14) {
    return {
      label: "Closing soon",
      value: `${formatDate(deadline)} · ${days} days left`,
      tone: "soon" as const,
    };
  }
  return {
    label: "Open",
    value: `${formatDate(deadline)} · ${days} days left`,
    tone: "open" as const,
  };
}
