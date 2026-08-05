import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilterForm } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  DeadlineStatusBadge,
  FundingIllustratedHero,
  FundingSidebar,
  getDeadlineState,
} from "../../components/funding-ui";
import { getResearchRecordDownloadHref } from "../../lib/research-downloads";
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
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react";

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
    <main id="research-main" className="min-h-screen bg-surface-subtle">
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
            <div className="min-w-0">
              {featuredGrant ? (
                <div className="mb-6">
                  <FeaturedGrant grant={featuredGrant} />
                </div>
              ) : null}
              {rowGrants.length > 0 ? <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                {rowGrants.map((grant) => (
                  <GrantRow key={grant.id} grant={grant} />
                ))}
              </div> : null}
            </div>
            {[...guidelines.data, ...resources.data].length > 0 ? <aside className="flex flex-col gap-5">
              <SupportPanel
                title="Downloadable guidance"
                records={[...guidelines.data, ...resources.data].slice(0, 8)}
              />
            </aside> : null}
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
  return (
    <FundingIllustratedHero
      eyebrow="Funding & Support"
      title="Funding Opportunities"
      body="Review internal grants administered through Kisii University and external funder calls with deadlines, eligibility notes, documents, and application routes."
      tone="grant"
      actions={[
        { label: "Open guidelines", href: "/guidelines" },
        { label: "View forms", href: "/forms", variant: "secondary" },
      ]}
      facts={[
        { label: "Results", value: resultCount || "", icon: FileText },
        { label: "Published", value: publishedCount || "", icon: ShieldCheck },
        { label: "Internal", value: internalCount || "", icon: Landmark },
        { label: "External", value: externalCount || "", icon: ExternalLink },
        { label: "Guidance", value: guidanceCount || "", icon: FileText },
        { label: "Resources", value: resourcesCount || "", icon: FileText },
      ]}
    />
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

  const visibleItems = items.filter((item) => item.count > 0 || item.label === "All funding");

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={
            item.active
              ? "inline-flex min-h-10 items-center gap-3 rounded-md border border-primary bg-primary px-4 text-sm font-semibold text-white shadow-sm"
              : "inline-flex min-h-10 items-center gap-3 rounded-md border border-border bg-white px-4 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
          }
        >
          {item.label}
          <span className={item.active ? "rounded bg-white/15 px-2 py-0.5 text-white" : "rounded bg-surface-muted px-2 py-0.5 text-muted-foreground"}>
            {item.count}
          </span>
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
          ? "group grid gap-4 rounded-lg border-2 border-primary bg-primary/[0.04] p-4 shadow-sm transition hover:bg-primary/[0.07] lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-center"
          : "group grid gap-4 rounded-lg border border-amber-300 bg-amber-50/50 p-4 shadow-sm transition hover:border-amber-400 lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-center"
      }
    >
      <GrantRowContent grant={grant} featured />
    </Link>
  );
}

function GrantRow({ grant }: { grant: ResearchGrant }) {
  const deadline = getDeadlineState(grant.deadline, grant.status);
  const isInternal = grant.grant_type === "internal";
  const href = grant.slug ? `/funding/${grant.slug}` : "/funding";

  return (
    <Link href={href} className="group grid gap-3 px-4 py-3 transition hover:bg-primary/[0.03] lg:grid-cols-[minmax(0,1fr)_180px_190px_120px] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(grant.grant_type ?? "internal")}</Badge>
          {grant.category ? <Badge>{formatLabel(grant.category)}</Badge> : null}
          {isInternal ? <DeadlineStatusBadge deadline={deadline} /> : null}
          {grant.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-2 line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">{grant.title}</h2>
        {compactText(grant.summary) || compactText((grant as ResearchGenericRecord).description) ? (
          <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">
            {compactText(grant.summary) || compactText((grant as ResearchGenericRecord).description)}
          </p>
        ) : null}
      </div>
      <div className="text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Funder</p>
        <p className="mt-1 line-clamp-1 font-semibold text-foreground">{compactText(grant.funder_name) || formatLabel(grant.grant_type ?? "funding")}</p>
      </div>
      <div className="text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{isInternal ? deadline.label : "Deadline"}</p>
        <p className="mt-1 font-semibold text-foreground">{deadline.value || formatDate(grant.deadline)}</p>
      </div>
      <span className="inline-flex items-center justify-start gap-2 text-sm font-semibold text-primary lg:justify-end">
        Open <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
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
          {isInternal ? <DeadlineStatusBadge deadline={deadline} large /> : null}
          {featured || grant.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">{grant.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {compactText(grant.summary) ||
            compactText((grant as ResearchGenericRecord).description) ||
            ""}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        {isInternal ? (
          <div className="rounded-md border border-primary/25 bg-white p-3">
            <dt className="text-xs font-semibold uppercase text-primary">{deadline.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{deadline.value}</dd>
          </div>
        ) : null}
        {compactText(grant.funder_name) ? <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">Funder</dt>
          <dd className="mt-1 font-semibold text-foreground">{compactText(grant.funder_name)}</dd>
        </div> : null}
        {!isInternal && deadline.value ? <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">{deadline.label}</dt>
          <dd className="mt-1 font-semibold text-foreground">{deadline.value}</dd>
        </div> : null}
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View funding
      </span>
    </>
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
    <FundingSidebar title={title}>
      <div className="divide-y divide-slate-200">
        {records.map((record) => (
          <SupportPanelItem key={compactText(record.id)} record={record} />
        ))}
      </div>
    </FundingSidebar>
  );
}

function SupportPanelItem({ record }: { record: SupportRecord }) {
  const downloadHref = getResearchRecordDownloadHref(record, record.resource_type ? "resource" : "guideline");
  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <h3 className="text-sm font-semibold text-foreground">
        {compactText(record.title) || compactText(record.name)}
      </h3>
      <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
        {formatLabel(record.guideline_type ?? record.resource_type ?? record.category ?? "resource")}
      </p>
      {downloadHref ? (
        <a href={downloadHref} className="mt-2 inline-flex text-sm font-semibold text-primary">
          Download
        </a>
      ) : null}
    </article>
  );
}



function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
