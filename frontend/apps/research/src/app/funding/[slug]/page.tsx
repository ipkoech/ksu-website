import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchFact,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  CompactFactGrid,
  DeadlineStatusBadge,
  DocumentListPanel,
  FundingIllustratedHero,
  FundingInfoSection,
  FundingSidebar,
  formatMoney,
  getDeadlineState,
  fundingIcons,
} from "../../../components/funding-ui";
import {
  compactText,
  formatDate,
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
      <FundingIllustratedHero
        eyebrow={isExternal ? "External Funding" : "Internal Funding"}
        title={grant.title ?? "Funding opportunity"}
        body={compactText(grant.summary) || compactText(grant.description)}
        tone="grant"
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
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Opportunity Details"
        title={isExternal ? "External opportunity information" : "Internal funding workflow"}
        body={isExternal ? "External opportunities prioritize funder information, eligibility, documents, and the official funder link." : "Internal opportunities show deadline status, eligibility, award details, documents, review dates, and contact."}
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            {!isExternal ? <InternalDeadlinePanel deadline={deadline} grant={grant} actionUrl={actionUrl} /> : null}
            <CompactFactGrid
              facts={[
                { label: "Deadline", value: formatDate(grant.deadline), icon: fundingIcons.calendar },
                { label: "Funder", value: compactText(grant.funder_name), icon: fundingIcons.bank },
                { label: "Award range", value: formatAwardRange(grant), icon: fundingIcons.money },
                { label: "Code", value: compactText(grant.code), icon: fundingIcons.award },
              ]}
            />
            <FundingInfoSection
              title="About this opportunity"
              fields={[
                ["Summary", grant.summary],
                ["Description", grant.description],
                ["Objectives", grant.objectives],
                ["Focus areas", grant.focus_areas],
              ]}
            />
            <FundingInfoSection
              title="Eligibility and requirements"
              fields={[
                ["Eligibility", grant.eligibility],
                ["Requirements", grant.requirements],
              ]}
            />
            {!isExternal ? <WorkflowDates grant={grant} /> : null}
          </div>
          <FundingSidebar
            title="Grant facts"
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
          <DocumentListPanel
            title="Grant guidelines"
            records={guidelines}
          />
          <DocumentListPanel
            title="Documents"
            records={documents}
          />
          {compactText(grant.contact_name) || compactText(grant.contact_email) || compactText(grant.contact_phone) ? <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <ResearchFact label="Name" value={compactText(grant.contact_name)} />
              <ResearchFact label="Email" value={compactText(grant.contact_email)} />
              <ResearchFact label="Phone" value={compactText(grant.contact_phone)} />
            </dl>
          </section> : null}
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
    <section className="rounded-lg border border-primary/30 bg-primary/[0.04] p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">Internal grant deadline</p>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">{deadline.label}</h2>
          <p className="mt-2 text-lg font-semibold text-foreground">{deadline.value}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            This is a Kisii University administered grant. Review eligibility, requirements, documents, and workflow dates before submitting.
          </p>
        </div>
        <DeadlineStatusBadge deadline={deadline} large />
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
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">
        Application flow
      </h2>
      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {dates.map(([label, value]) => (
          <ResearchFact key={label} label={label} value={formatDate(value as string | null | undefined)} />
        ))}
      </dl>
    </section>
  );
}


function formatAwardRange(grant: ResearchGenericRecord) {
  const min = formatMoney(grant.min_award, grant.currency);
  const max = formatMoney(grant.max_award, grant.currency);
  if (min && max) return `${min} - ${max}`;
  return min || max;
}
