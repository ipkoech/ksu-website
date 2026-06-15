import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact } from "../../components/research-detail";
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

export const dynamic = "force-dynamic";

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
        imageSrc="/images/research/research-demo-imagegen.png"
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
        body="Grant records come directly from the Research service so public calls stay aligned with administrative records."
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
            <aside className="space-y-5">
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
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/funding">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Grant title, funder, eligibility"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={grantTypes} />
        <SelectField name="category" label="Category" value={params.category} options={grantCategories} />
        <SelectField name="status" label="Status" value={params.status} options={grantStatuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "deadline"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="deadline">Deadline</option>
            <option value="open_date">Open date</option>
            <option value="created_at">Newest</option>
            <option value="title">Title</option>
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/funding"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
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
  records: Array<Record<string, any>>;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-sm font-semibold text-slate-950">{record.title ?? record.name}</h3>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(record.guideline_type ?? record.resource_type ?? record.category ?? "resource")}
            </p>
            {record.document_url || record.file_url || record.url ? (
              <a
                href={record.document_url ?? record.file_url ?? record.url}
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
    </section>
  );
}

function WorkflowPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Internal funding flow</h2>
      <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        {["Check eligibility", "Download requirements", "Submit application", "Review and award", "Report progress"].map((step) => (
          <li key={step} className="rounded-md bg-slate-50 p-3 font-semibold text-slate-800">
            {step}
          </li>
        ))}
      </ol>
    </section>
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
