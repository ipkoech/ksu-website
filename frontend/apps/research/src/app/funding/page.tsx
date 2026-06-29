import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact, ResearchSidePanel } from "../../components/research-detail";
import { ResearchFilterForm } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getGrantGuidelines,
  getGrants,
  getGrantsFiltered,
  getResources,
} from "../../lib/research-public-data";
import type { ResearchGrant } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Funding",
  description: "Research grant opportunities and funding calls at Kisii University.",
};

type FundingSearchParams = {
  q?: string;
  type?: string;
  category?: string;
  status?: string;
  year?: string;
  sort?: string;
};

type SupportRecord = {
  id?: string | number | null;
  title?: string | null;
  name?: string | null;
  guideline_type?: string | null;
  resource_type?: string | null;
  category?: string | null;
  document_url?: string | null;
  file_url?: string | null;
  url?: string | null;
};

const grantTypes = ["internal", "external"];
const grantCategories = ["research", "innovation", "capacity_building", "travel", "equipment", "publication"];
const grantStatuses = ["open", "closed", "reviewing", "awarded", "cancelled"];

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function FundingPage({
  searchParams,
}: {
  searchParams?: Promise<FundingSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [grants, allGrants, guidelines, resources] = await Promise.all([
    getGrantsFiltered({
      search: params.q,
      grantType: params.type,
      category: params.category,
      status: params.status,
      year: params.year,
      sort: params.sort || "deadline",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getGrants(),
    getGrantGuidelines(),
    getResources(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Funding & Support"
        title="Grant calls, internal funding, and research support opportunities."
        body="Review open and featured funding opportunities, eligibility notes, funders, application documents, and deadline status."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Funding & Support", href: "/funding" },
          { label: "Funding" },
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research funding support workflow with grant calls and application guidance"
        links={supportLinks}
        primaryAction={{ label: "Open guidelines", href: "/guidelines" }}
        stats={[
          { label: "Funding results", value: grants.data.length },
          { label: "Published grants", value: allGrants.data.length },
          { label: "Guidance records", value: guidelines.data.length },
          { label: "Resources", value: resources.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Opportunity Board"
        title="Funding opportunities"
        body="Funding calls are published with deadlines, eligibility, award ranges, and application routes."
        tone="white"
      >
        <FundingFilters params={params} years={getGrantYears(allGrants.data)} />

        {[grants.error, guidelines.error, resources.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {grants.data.length > 0 ? (
          <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5 md:grid-cols-2">
              {grants.data.map((grant) => (
                <GrantCard key={grant.id} grant={grant} />
              ))}
            </div>
            <aside className="flex flex-col gap-5">
              <SupportPanel
                title="Downloadable guidance"
                records={[...guidelines.data, ...resources.data].slice(0, 6)}
              />
              <WorkflowPanel />
            </aside>
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No funding opportunities match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function FundingFilters({
  params,
  years,
}: {
  params: FundingSearchParams;
  years: string[];
}) {
  return (
    <ResearchFilterForm
      action="/funding"
      resetHref="/funding"
      searchValue={params.q}
      searchPlaceholder="Grant title, funder, eligibility"
      selects={[
        { name: "type", label: "Type", value: params.type, options: grantTypes },
        { name: "category", label: "Category", value: params.category, options: grantCategories },
        { name: "status", label: "Status", value: params.status, options: grantStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      sortValue={params.sort}
      sortOptions={[
        { value: "deadline", label: "Deadline" },
        { value: "open_date", label: "Open date" },
        { value: "created_at", label: "Newest" },
        { value: "title", label: "Title" },
      ]}
    />
  );
}

function GrantCard({ grant }: { grant: ResearchGrant }) {
  const deadline = getDeadlineState(grant.deadline, grant.status);
  return (
    <Link
      href={grant.slug ? `/funding/${grant.slug}` : "/funding"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(grant.grant_type ?? "internal")}</Badge>
        <Badge>{formatLabel(grant.category ?? "research")}</Badge>
        {grant.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {grant.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(grant.summary) ||
          "Funding details will appear when published by the research office."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm">
        <ResearchFact label="Funder" value={compactText(grant.funder_name)} />
        <div className={`rounded-md p-3 ${deadline.className}`}>
          <dt className="text-xs font-semibold uppercase">{deadline.label}</dt>
          <dd className="mt-1 font-semibold">{deadline.value}</dd>
        </div>
      </dl>
      <p className="mt-5 text-sm font-semibold text-primary">
        {grant.grant_type === "external" ? "View external opportunity" : "View application workflow"}
      </p>
    </Link>
  );
}

function SupportPanel({
  title,
  records,
}: {
  title: string;
  records: SupportRecord[];
}) {
  return (
    <ResearchSidePanel title={title}>
      <div className="divide-y divide-slate-200">
        {records.map((record) => (
          <article key={compactText(record.id)} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-sm font-semibold text-slate-950">{compactText(record.title) || compactText(record.name)}</h3>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(record.guideline_type ?? record.resource_type ?? record.category ?? "resource")}
            </p>
            {record.document_url || record.file_url || record.url ? (
              <a
                href={compactText(record.document_url) || compactText(record.file_url) || compactText(record.url)}
                className="mt-2 inline-flex text-sm font-semibold text-primary"
              >
                Download
              </a>
            ) : null}
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            Downloadable guidance will appear when resources are published.
          </p>
        ) : null}
      </div>
    </ResearchSidePanel>
  );
}

function WorkflowPanel() {
  return (
    <ResearchSidePanel title="Internal funding flow">
      <ol className="flex flex-col gap-3 text-sm leading-6 text-slate-600">
        {["Check eligibility", "Download requirements", "Submit application", "Review and award", "Report progress"].map((step) => (
          <li key={step} className="rounded-md bg-slate-50 p-3 font-semibold text-slate-800">
            {step}
          </li>
        ))}
      </ol>
    </ResearchSidePanel>
  );
}

function getDeadlineState(deadline?: string | null, status?: string) {
  if (!deadline) {
    return {
      label: "Deadline",
      value: "No deadline published",
      className: "bg-slate-50 text-slate-700",
    };
  }
  const date = new Date(deadline);
  const now = new Date();
  const days = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (status === "closed" || days < 0) {
    return {
      label: "Closed",
      value: formatDate(deadline),
      className: "bg-slate-100 text-slate-700",
    };
  }
  if (days === 0) {
    return {
      label: "Due today",
      value: formatDate(deadline),
      className: "bg-red-50 text-red-800",
    };
  }
  if (days <= 14) {
    return {
      label: "Closing soon",
      value: `${formatDate(deadline)} · ${days} days left`,
      className: "bg-amber-50 text-amber-800",
    };
  }
  return {
    label: "Open",
    value: `${formatDate(deadline)} · ${days} days left`,
    className: "bg-emerald-50 text-emerald-800",
  };
}

function getGrantYears(grants: ResearchGrant[]) {
  const years = grants
    .flatMap((grant) => [grant.deadline, grant.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
