import type { Metadata } from "next";
import Link from "next/link";
import { ResearchSidePanel } from "../../components/research-detail";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
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
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord, ResearchGrant } from "@ksu/api-client";

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
  active?: string;
  year?: string;
  month?: string;
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
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Deadline", value: "deadline" },
  { label: "Open date", value: "open_date" },
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

export default async function FundingPage({
  searchParams,
}: {
  searchParams?: Promise<FundingSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "deadline";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [grants, allGrants, guidelines, resources] = await Promise.all([
    getGrantsFiltered({
      search: params.q,
      grantType: params.type,
      category: params.category,
      status: params.status,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getGrants(),
    getGrantGuidelines(),
    getResources(),
  ]);
  const allGrantRecords = allGrants.data as unknown as ResearchGenericRecord[];
  const grantRecords = grants.data as unknown as ResearchGenericRecord[];
  const years = getRecordYears(allGrantRecords);
  const months = getRecordMonths(allGrantRecords, params.year);
  const visibleGrants = filterRecordsByMonth(grantRecords, params.year, params.month) as unknown as ResearchGrant[];
  const featuredGrant = visibleGrants.find((grant) => grant.is_featured);
  const rowGrants = featuredGrant
    ? visibleGrants.filter((grant) => grant.id !== featuredGrant.id)
    : visibleGrants;
  const internalGrants = visibleGrants.filter((grant) => grant.grant_type === "internal");
  const externalGrants = visibleGrants.filter((grant) => grant.grant_type === "external");

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <FundingMasthead
        resultCount={visibleGrants.length}
        publishedCount={allGrants.data.length}
        internalCount={internalGrants.length}
        externalCount={externalGrants.length}
        guidanceCount={guidelines.data.length}
        resourcesCount={resources.data.length}
      />

      <ResearchSection
        eyebrow="Opportunity Board"
        title="Funding opportunities"
        body="Search public funding calls and use the filter menu for type, category, status, active state, year, month, and sort order."
        tone="white"
      >
        <GrantTypeSplit
          internalCount={internalGrants.length}
          externalCount={externalGrants.length}
          activeType={params.type}
        />
        <FundingFilters params={params} years={years} months={months} />

        {[grants.error, guidelines.error, resources.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleGrants.length > 0 ? (
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {featuredGrant ? (
                <div className="mb-6">
                  <FeaturedGrant grant={featuredGrant} />
                </div>
              ) : null}
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                {rowGrants.map((grant) => (
                  <GrantRow key={grant.id} grant={grant} />
                ))}
              </div>
            </div>
            <aside className="flex flex-col gap-5">
              <SupportPanel
                title="Downloadable guidance"
                records={[...guidelines.data, ...resources.data].slice(0, 8)}
              />
            </aside>
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published funding opportunities match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function FundingMasthead({
  resultCount,
  publishedCount,
  internalCount,
  externalCount,
  guidanceCount,
  resourcesCount,
}: {
  resultCount: number;
  publishedCount: number;
  internalCount: number;
  externalCount: number;
  guidanceCount: number;
  resourcesCount: number;
}) {
  const stats = [
    { label: "Funding results", value: resultCount },
    { label: "Published grants", value: publishedCount },
    { label: "Internal grants", value: internalCount },
    { label: "External calls", value: externalCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/resources-tools" className="transition hover:text-primary">Funding & Support</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Funding</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Funding & Support
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Grant calls, internal funding, and research support opportunities
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Review internal grants administered through Kisii University and external funder calls with deadlines, eligibility notes, documents, and application routes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/guidelines">Open guidelines</PrimaryLink>
            <SecondaryLink href="/forms">View forms</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Support records</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md bg-white px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">Guidance</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{guidanceCount}</dd>
            </div>
            <div className="rounded-md bg-white px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">Resources</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{resourcesCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function GrantTypeSplit({
  internalCount,
  externalCount,
  activeType,
}: {
  internalCount: number;
  externalCount: number;
  activeType?: string;
}) {
  const items = [
    {
      href: "/funding",
      label: "All funding",
      body: "Internal and external records together.",
      count: internalCount + externalCount,
      active: !activeType,
    },
    {
      href: "/funding?type=internal",
      label: "Internal grants",
      body: "University-administered calls with prominent deadline status and application flow.",
      count: internalCount,
      active: activeType === "internal",
    },
    {
      href: "/funding?type=external",
      label: "External calls",
      body: "Funder opportunities, official links, eligibility, and deadline tracking.",
      count: externalCount,
      active: activeType === "external",
    },
  ];

  return (
    <div className="mb-5 grid gap-3 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={
            item.active
              ? "rounded-lg border border-primary bg-primary/[0.04] p-4 shadow-sm"
              : "rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30"
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
            <span className={item.active ? "rounded-md bg-primary px-3 py-1 text-sm font-semibold text-white" : "rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"}>
              {item.count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FundingFilters({
  params,
  years,
  months,
}: {
  params: FundingSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
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
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: grantStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedGrant({ grant }: { grant: ResearchGrant }) {
  const isInternal = grant.grant_type === "internal";

  return (
    <Link
      href={grant.slug ? `/funding/${grant.slug}` : "/funding"}
      className={
        isInternal
          ? "group grid gap-4 rounded-lg border-2 border-primary bg-primary/[0.04] p-4 shadow-sm transition hover:bg-primary/[0.07] lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
          : "group grid gap-4 rounded-lg border border-amber-300 bg-amber-50/50 p-4 shadow-sm transition hover:border-amber-400 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
      }
    >
      <GrantRowContent grant={grant} featured />
    </Link>
  );
}

function GrantRow({ grant }: { grant: ResearchGrant }) {
  const deadline = getDeadlineState(grant.deadline, grant.status);
  const isInternal = grant.grant_type === "internal";

  return (
    <ResearchRecordRow
      href={grant.slug ? `/funding/${grant.slug}` : "/funding"}
      title={grant.title}
      description={
        compactText(grant.summary) ||
        compactText((grant as ResearchGenericRecord).description) ||
        "Funding details have not been published yet."
      }
      badges={[grant.grant_type, grant.category, grant.status]}
      filledBadges={[isInternal ? deadline.label : null, grant.is_featured ? "Featured" : null]}
      facts={[
        { label: "Funder", value: compactText(grant.funder_name) },
        { label: deadline.label, value: deadline.value },
        { label: "Award range", value: formatAwardRange(grant as ResearchGenericRecord) },
      ]}
    />
  );
}

function GrantRowContent({
  grant,
  featured = false,
}: {
  grant: ResearchGrant;
  featured?: boolean;
}) {
  const deadline = getDeadlineState(grant.deadline, grant.status);
  const isInternal = grant.grant_type === "internal";

  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(grant.grant_type ?? "internal")}</Badge>
          <Badge>{formatLabel(grant.category ?? "research")}</Badge>
          {isInternal ? <DeadlineStatusBadge deadline={deadline} size="large" /> : null}
          {featured || grant.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">{grant.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {compactText(grant.summary) ||
            compactText((grant as ResearchGenericRecord).description) ||
            "Funding details have not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        {isInternal ? (
          <div className="rounded-md border border-primary/25 bg-white p-3">
            <dt className="text-xs font-semibold uppercase text-primary">{deadline.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">{deadline.value}</dd>
          </div>
        ) : null}
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Funder</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(grant.funder_name) || "Not published"}</dd>
        </div>
        {!isInternal ? <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">{deadline.label}</dt>
          <dd className="mt-1 font-semibold text-slate-950">{deadline.value}</dd>
        </div> : null}
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View funding
      </span>
    </>
  );
}

function DeadlineStatusBadge({
  deadline,
  size = "normal",
}: {
  deadline: ReturnType<typeof getDeadlineState>;
  size?: "normal" | "large";
}) {
  const tone = deadline.tone;
  const className =
    tone === "closed"
      ? "border-slate-300 bg-slate-100 text-slate-700"
      : tone === "urgent"
        ? "border-red-300 bg-red-50 text-red-700"
        : tone === "soon"
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-primary/30 bg-primary/[0.08] text-primary";

  return (
    <span className={`inline-flex items-center rounded-md border font-semibold ${className} ${size === "large" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}>
      {deadline.label}
    </span>
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
            <h3 className="text-sm font-semibold text-slate-950">
              {compactText(record.title) || compactText(record.name)}
            </h3>
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

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
