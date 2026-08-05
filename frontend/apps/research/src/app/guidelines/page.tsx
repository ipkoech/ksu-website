import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { getResearchRecordDownloadHref } from "../../lib/research-downloads";
import { compactText, formatDate, formatLabel, getGrantGuidelines, getGuidelines, getGuidelinesFiltered } from "../../lib/research-public-data";
import { filterRecordsByMonth, getRecordMonths, getRecordSummary, getRecordTimelineLabel, getRecordTitle, getRecordYears } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Guidelines",
  description: "Research guidelines, grant guidance, policies, and procedures.",
};

type GuidelineParams = { q?: string; type?: string; category?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };
const guidelineTypes = ["guideline", "policy", "procedure", "manual", "sop", "template", "checklist"];
const statuses = ["active", "draft", "archived", "superseded"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "effective_date", label: "Effective date" },
  { value: "review_date", label: "Review date" },
  { value: "approval_date", label: "Approval date" },
  { value: "created_at", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

export default async function GuidelinesPage({ searchParams }: { searchParams?: Promise<GuidelineParams> }) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "effective_date";
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [guidelines, allGuidelines, grantGuidelines] = await Promise.all([
    getGuidelinesFiltered({ search: params.q, guidelineType: params.type, category: params.category, status: params.status, year: params.year, sort, order, ...activeFlags }),
    getGuidelines(),
    getGrantGuidelines(),
  ]);
  const categories = Array.from(new Set(allGuidelines.data.map((item) => compactText(item.category)).filter(Boolean))).sort();
  const years = getRecordYears(allGuidelines.data);
  const months = getRecordMonths(allGuidelines.data, params.year);
  const visibleGuidelines = filterRecordsByMonth(guidelines.data, params.year, params.month);
  const featuredGuideline = visibleGuidelines.find((item) => item.is_featured || item.is_mandatory);
  const rowGuidelines = featuredGuideline ? visibleGuidelines.filter((item) => item.id !== featuredGuideline.id) : visibleGuidelines;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <GuidelinesMasthead resultCount={visibleGuidelines.length} publishedCount={allGuidelines.data.length} grantGuidanceCount={grantGuidelines.data.length} categoriesCount={categories.length} />
      <ResearchSection eyebrow="Document Control" title="Research guidelines" body="Search first, then use the filter menu for document type, active state, status, year, month, category, and sort order." tone="white">
        <GuidelineFilters params={params} categories={categories} years={years} months={months} />
        {[guidelines.error, allGuidelines.error, grantGuidelines.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {visibleGuidelines.length ? (
          <>
            {featuredGuideline ? <div className="mt-6"><FeaturedGuideline item={featuredGuideline} /></div> : null}
            <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">{rowGuidelines.map((item) => <GuidelineRow key={item.id} item={item} hrefBase="/guidelines" />)}</div>
          </>
        ) : <div className="mt-7"><StatusMessage>No guidelines match the current filters.</StatusMessage></div>}
      </ResearchSection>
      <ResearchSection eyebrow="Grant Guidance" title="Funding-specific guidance" body="Grant guideline records remain connected to the grant module and are shown separately from general research policy.">
        <div className="grid gap-5 lg:grid-cols-3">{grantGuidelines.data.map((item) => <GuidelineCard key={item.id} item={item} />)}{grantGuidelines.data.length === 0 ? <StatusMessage>No grant guidance is published yet.</StatusMessage> : null}</div>
      </ResearchSection>
    </main>
  );
}

function GuidelinesMasthead({ resultCount, publishedCount, grantGuidanceCount, categoriesCount }: { resultCount: number; publishedCount: number; grantGuidanceCount: number; categoriesCount: number }) {
  const stats = [
    { label: "Guideline results", value: resultCount },
    { label: "Published guidelines", value: publishedCount },
    { label: "Grant guidance", value: grantGuidanceCount },
    { label: "Categories", value: categoriesCount },
  ];

  return (
    <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <Link href="/funding" className="transition hover:text-primary">Funding</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Guidelines</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Research Support</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Controlled documents for research policy, procedure, grant work, and compliance</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">Scan active guidance by version, effective date, review window, status, and mandatory flag.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/forms">Open forms</PrimaryLink>
            <SecondaryLink href="/funding">View funding</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2"><dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt><dd className="mt-1 text-lg font-semibold text-foreground">{stat.value}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}

function GuidelineFilters({ params, categories, years, months }: { params: GuidelineParams; categories: string[]; years: string[]; months: Array<{ value: string; label: string }> }) {
  return (
    <ResearchFilterForm
      action="/guidelines"
      resetHref="/guidelines"
      searchValue={params.q}
      searchPlaceholder="Policy, procedure, code, scope"
      selects={[
        { name: "type", label: "Type", value: params.type, options: guidelineTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
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

function FeaturedGuideline({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link href={item.slug ? `/guidelines/${item.slug}` : "/guidelines"} className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(item.guideline_type) || "guideline")}</Badge>
          {item.status ? <Badge>{formatLabel(item.status)}</Badge> : null}
          {item.is_mandatory ? <FilledBadge>Mandatory</FilledBadge> : null}
          {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">{getRecordTitle(item, "Research guideline")}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{getRecordSummary(item) || compactText(item.scope) || "Guideline summary has not been published yet."}</p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Effective</dt><dd className="mt-1 font-semibold text-foreground">{formatDate(item.effective_date) || "Not published"}</dd></div>
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Review</dt><dd className="mt-1 font-semibold text-foreground">{formatDate(item.review_date) || "Not published"}</dd></div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open guideline</span>
    </Link>
  );
}

function GuidelineRow({ item, hrefBase }: { item: ResearchGenericRecord; hrefBase: string }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `${hrefBase}/${item.slug}` : hrefBase}
      title={getRecordTitle(item, "Research guideline")}
      description={getRecordSummary(item) || compactText(item.scope) || "Guideline summary has not been published yet."}
      badges={[item.guideline_type ?? item.category ?? "guideline", item.status]}
      filledBadges={[item.is_mandatory ? "Mandatory" : null, item.is_featured ? "Featured" : null]}
      facts={[
        { label: "Version", value: compactText(item.version) },
        { label: "Effective", value: formatDate(item.effective_date) },
        { label: "Review", value: formatDate(item.review_date) || getRecordTimelineLabel(item) },
      ]}
    />
  );
}

function GuidelineCard({ item }: { item: ResearchGenericRecord }) {
  const downloadHref = getResearchRecordDownloadHref(item, "guideline");
  return <article className="rounded-lg border border-border bg-white p-5 shadow-sm"><Badge>{formatLabel(item.guideline_type ?? "grant guidance")}</Badge><h2 className="mt-4 text-xl font-semibold leading-7 text-foreground">{item.title ?? "Grant guideline"}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{compactText(item.summary) || compactText(item.description) || "Grant guidance details are not published yet."}</p>{downloadHref ? <a href={downloadHref} className="mt-4 inline-flex text-sm font-semibold text-primary">Download document</a> : null}</article>;
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
