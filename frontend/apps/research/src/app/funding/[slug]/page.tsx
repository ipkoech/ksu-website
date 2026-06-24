import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchFact,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getGrantBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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
        labels={[grant.grant_type, grant.category, grant.status]}
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
        imageSrc="/images/research/research-demo-imagegen.png"
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
            <ResearchTextPanel
              title="About this opportunity"
              fields={[
                ["Summary", grant.summary],
                ["Description", grant.description],
                ["Objectives", grant.objectives],
                ["Focus areas", grant.focus_areas],
              ]}
            />
            <ResearchTextPanel
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
