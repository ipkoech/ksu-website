import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { FundingIllustratedHero, formatMoney, getDeadlineState, DeadlineStatusBadge, fundingIcons } from "../../components/funding-ui";
import { compactText, formatDate, formatLabel, getScholarships, getScholarshipsFiltered } from "../../lib/research-public-data";
import { filterRecordsByMonth, getListPageSize, getRecordMonths, getRecordSummary, getRecordTimelineLabel, getRecordTitle, getRecordYears } from "../../lib/research-page-model";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Scholarships",
  description: "Research scholarship calls and student funding opportunities.",
};

type ScholarshipParams = { q?: string; type?: string; active?: string; status?: string; year?: string; month?: string; sort?: string; page?: string };
const scholarshipTypes = ["research", "postgraduate", "doctoral", "masters", "mobility", "seed", "fellowship"];
const statuses = ["open", "upcoming", "closed", "awarded", "draft"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "application_deadline", label: "Deadline" },
  { value: "application_open", label: "Opening date" },
  { value: "created_at", label: "Newest" },
  { value: "value", label: "Award value" },
  { value: "name", label: "Name A-Z" },
];

export default async function ScholarshipsPage({ searchParams }: { searchParams?: Promise<ScholarshipParams> }) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const sort = params.sort || "application_deadline";
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [scholarships, allScholarships] = await Promise.all([
    getScholarshipsFiltered({
      search: params.q,
      scholarshipType: params.type,
      status: params.status,
      year: params.year,
      sort,
      order,
      page,
      perPage,
      ...activeFlags,
    }),
    getScholarships(),
  ]);
  const years = getRecordYears(allScholarships.data);
  const months = getRecordMonths(allScholarships.data, params.year);
  const visibleScholarships = filterRecordsByMonth(scholarships.data, params.year, params.month);
  const featuredScholarship = visibleScholarships.find((item) => item.is_featured);
  const rowScholarships = featuredScholarship
    ? visibleScholarships.filter((item) => item.id !== featuredScholarship.id)
    : visibleScholarships;
  const totalPages = Math.ceil((params.month ? visibleScholarships.length : scholarships.total) / scholarships.perPage);

  return (
    <main id="research-main" className="min-h-screen bg-surface-subtle">
      <ScholarshipsMasthead
        resultCount={visibleScholarships.length}
        publishedCount={allScholarships.data.length}
        typeCount={scholarshipTypes.length}
        statusCount={statuses.length}
      />
      <ResearchSection eyebrow="Scholarship Calls" title="Open and published opportunities" body="Search first, then use the filter menu for type, active state, status, year, month, and sort order." tone="white">
        <ScholarshipFilters params={params} years={years} months={months} />
        {[scholarships.error, allScholarships.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {visibleScholarships.length > 0 ? (
          <>
            {featuredScholarship ? <div className="mt-6"><FeaturedScholarship item={featuredScholarship} /></div> : null}
            <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
              {rowScholarships.map((item) => <ScholarshipRow key={item.id} item={item} />)}
            </div>
            <ResearchListPagination page={page} totalPages={totalPages} total={params.month ? visibleScholarships.length : scholarships.total} perPage={scholarships.perPage} path="/scholarships" params={params} className="mt-6" />
          </>
        ) : <div className="mt-7"><StatusMessage>No scholarship calls match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ScholarshipsMasthead({ resultCount, publishedCount, typeCount, statusCount }: { resultCount: number; publishedCount: number; typeCount: number; statusCount: number }) {
  return (
    <FundingIllustratedHero
      eyebrow="Funding / Support"
      title="Research Scholarships"
      body="Compare eligibility, award value, coverage, deadlines, funders, and direct application paths from published scholarship records."
      tone="scholarship"
      actions={[
        { label: "View funding", href: "/funding" },
        { label: "Read guidelines", href: "/guidelines", variant: "secondary" },
      ]}
      facts={[
        { label: "Results", value: resultCount || "", icon: fundingIcons.check },
        { label: "Published", value: publishedCount || "", icon: fundingIcons.award },
        { label: "Types", value: typeCount || "", icon: fundingIcons.money },
        { label: "Statuses", value: statusCount || "", icon: fundingIcons.calendar },
      ]}
    />
  );
}

function ScholarshipFilters({ params, years, months }: { params: ScholarshipParams; years: string[]; months: Array<{ value: string; label: string }> }) {
  return (
    <ResearchFilterForm
      action="/scholarships"
      resetHref="/scholarships"
      searchValue={params.q}
      searchPlaceholder="Scholarship, funder, eligibility"
      selects={[
        { name: "type", label: "Type", value: params.type, options: scholarshipTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedScholarship({ item }: { item: ResearchGenericRecord }) {
  const value = formatMoney(item.value, compactText(item.currency) || "KES");
  const deadline = getDeadlineState(compactText(item.application_deadline), compactText(item.status));
  const coverage = [
    item.covers_tuition ? "Tuition" : "",
    item.covers_stipend ? "Stipend" : "",
    item.covers_travel ? "Travel" : "",
    item.covers_research ? "Research" : "",
  ].filter(Boolean);
  return (
    <Link href={item.slug ? `/scholarships/${item.slug}` : "/scholarships"} className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(item.scholarship_type ?? "scholarship")}</Badge>
          {item.status ? <Badge>{formatLabel(item.status)}</Badge> : null}
          {deadline.value ? <DeadlineStatusBadge deadline={deadline} /> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">{getRecordTitle(item, "Research scholarship")}</h2>
        {getRecordSummary(item) || compactText(item.eligibility) ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{getRecordSummary(item) || compactText(item.eligibility)}</p> : null}
        {coverage.length ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Covers {coverage.join(", ")}</p> : null}
      </div>
      <dl className="grid gap-2 text-sm">
        {formatDate(item.application_deadline) ? <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Deadline</dt><dd className="mt-1 font-semibold text-foreground">{formatDate(item.application_deadline)}</dd></div> : null}
        {value ? <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Value</dt><dd className="mt-1 font-semibold text-foreground">{value}</dd></div> : null}
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open scholarship</span>
    </Link>
  );
}

function ScholarshipRow({ item }: { item: ResearchGenericRecord }) {
  const value = formatMoney(item.value, compactText(item.currency) || "KES");
  const deadline = getDeadlineState(compactText(item.application_deadline), compactText(item.status));
  return (
    <ResearchRecordRow
      href={item.slug ? `/scholarships/${item.slug}` : "/scholarships"}
      title={getRecordTitle(item, "Research scholarship")}
      description={getRecordSummary(item) || compactText(item.eligibility)}
      badges={[item.scholarship_type ?? "scholarship", item.status]}
      filledBadges={[deadline.value ? deadline.label : null, item.is_featured ? "Featured" : null]}
      facts={[
        { label: "Deadline", value: formatDate(item.application_deadline) },
        { label: "Value", value },
        { label: "Timeline", value: getRecordTimelineLabel(item) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
