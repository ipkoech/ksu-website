import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getScholarships, getScholarshipsFiltered } from "../../lib/research-public-data";
import { filterRecordsByMonth, getRecordMonths, getRecordSummary, getRecordTimelineLabel, getRecordTitle, getRecordYears } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Scholarships",
  description: "Research scholarship calls and student funding opportunities.",
};

type ScholarshipParams = { q?: string; type?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };
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

  return (
    <main id="research-main" className="min-h-screen bg-white">
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
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowScholarships.map((item) => <ScholarshipRow key={item.id} item={item} />)}
            </div>
          </>
        ) : <div className="mt-7"><StatusMessage>No scholarship calls match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ScholarshipsMasthead({ resultCount, publishedCount, typeCount, statusCount }: { resultCount: number; publishedCount: number; typeCount: number; statusCount: number }) {
  const stats = [
    { label: "Scholarship results", value: resultCount },
    { label: "Published scholarships", value: publishedCount },
    { label: "Scholarship types", value: typeCount },
    { label: "Statuses", value: statusCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/funding" className="transition hover:text-primary">Funding</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Scholarships</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Funding / Support</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Research scholarships, student funding calls, and fellowship opportunities</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Compare eligibility, award value, coverage, deadlines, funders, and direct application paths from published scholarship records.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/funding">View funding</PrimaryLink>
            <SecondaryLink href="/guidelines">Read guidelines</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"><dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd></div>)}
        </dl>
      </div>
    </section>
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
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">{getRecordTitle(item, "Research scholarship")}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{getRecordSummary(item) || compactText(item.eligibility) || "Scholarship information has not been published yet."}</p>
        {coverage.length ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Covers {coverage.join(", ")}</p> : null}
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Deadline</dt><dd className="mt-1 font-semibold text-slate-950">{formatDate(item.application_deadline) || "Not published"}</dd></div>
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Value</dt><dd className="mt-1 font-semibold text-slate-950">{value || "Not published"}</dd></div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open scholarship</span>
    </Link>
  );
}

function ScholarshipRow({ item }: { item: ResearchGenericRecord }) {
  const value = formatMoney(item.value, compactText(item.currency) || "KES");
  return (
    <ResearchRecordRow
      href={item.slug ? `/scholarships/${item.slug}` : "/scholarships"}
      title={getRecordTitle(item, "Research scholarship")}
      description={getRecordSummary(item) || compactText(item.eligibility) || "Scholarship information has not been published yet."}
      badges={[item.scholarship_type ?? "scholarship", item.status]}
      filledBadges={[item.is_featured ? "Featured" : null]}
      facts={[
        { label: "Deadline", value: formatDate(item.application_deadline) },
        { label: "Value", value },
        { label: "Timeline", value: getRecordTimelineLabel(item) },
      ]}
    />
  );
}

function formatMoney(value?: string | number | null, currency = "KES") {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? compactText(value) : `${currency} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
