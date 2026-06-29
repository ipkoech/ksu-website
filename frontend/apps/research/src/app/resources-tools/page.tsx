import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getCenters, getResources, getResourcesFiltered } from "../../lib/research-public-data";
import { filterRecordsByMonth, getRecordMonths, getRecordSummary, getRecordTimelineLabel, getRecordTitle, getRecordYears } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = { title: "Resources & Tools", description: "Research equipment, tools, templates, platforms, and support resources." };

type ResourceParams = { q?: string; type?: string; access?: string; category?: string; center?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };
const resourceTypes = ["equipment", "software", "dataset", "template", "form", "facility", "platform", "guide"];
const accessTypes = ["internal", "public", "restricted", "bookable", "request"];
const statuses = ["available", "unavailable", "maintenance", "retired", "draft"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "status", label: "Availability" },
];

export default async function ResourcesToolsPage({ searchParams }: { searchParams?: Promise<ResourceParams> }) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "name";
  const order = sort === "name" || sort === "status" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [resources, allResources, centers] = await Promise.all([
    getResourcesFiltered({ search: params.q, resourceType: params.type, accessType: params.access, category: params.category, centerId: params.center, status: params.status, year: params.year, sort, order, ...activeFlags }),
    getResources(),
    getCenters(),
  ]);
  const categories = Array.from(new Set(allResources.data.map((item) => compactText(item.category)).filter(Boolean))).sort();
  const years = getRecordYears(allResources.data);
  const months = getRecordMonths(allResources.data, params.year);
  const visibleResources = filterRecordsByMonth(resources.data, params.year, params.month);
  const featuredResource = visibleResources.find((item) => item.is_featured);
  const rowResources = featuredResource ? visibleResources.filter((item) => item.id !== featuredResource.id) : visibleResources;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResourcesMasthead resultCount={visibleResources.length} publishedCount={allResources.data.length} centersCount={centers.data.length} categoriesCount={categories.length} />
      <ResearchSection eyebrow="Resource Catalogue" title="Find and access research tools" body="Search first, then use the filter menu for type, access, active state, status, year, month, category, center, and sort order." tone="white">
        <ResourceFilters params={params} categories={categories} centers={centers.data} years={years} months={months} />
        {[resources.error, allResources.error, centers.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {visibleResources.length ? (
          <>
            {featuredResource ? <div className="mt-6"><FeaturedResource item={featuredResource} /></div> : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">{rowResources.map((item) => <ResourceRow key={item.id} item={item} />)}</div>
          </>
        ) : <div className="mt-7"><StatusMessage>No resources match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ResourcesMasthead({ resultCount, publishedCount, centersCount, categoriesCount }: { resultCount: number; publishedCount: number; centersCount: number; categoriesCount: number }) {
  const stats = [
    { label: "Resource results", value: resultCount },
    { label: "Published resources", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Categories", value: categoriesCount },
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
            <span className="text-slate-900">Resources & Tools</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Research Support</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Tools, platforms, equipment, forms, and bookable research assets</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse what is available, where it sits, how it can be accessed, and which office or center manages the record.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/services">Open services</PrimaryLink>
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

function ResourceFilters({ params, categories, centers, years, months }: { params: ResourceParams; categories: string[]; centers: ResearchGenericRecord[]; years: string[]; months: Array<{ value: string; label: string }> }) {
  return (
    <ResearchFilterForm
      action="/resources-tools"
      resetHref="/resources-tools"
      searchValue={params.q}
      searchPlaceholder="Equipment, tool, facility, capability"
      selects={[
        { name: "type", label: "Type", value: params.type, options: resourceTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedResource({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link href={item.slug ? `/resources-tools/${item.slug}` : "/resources-tools"} className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(item.resource_type) || "resource")}</Badge>
          {item.access_type ? <Badge>{formatLabel(item.access_type)}</Badge> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">{getRecordTitle(item, "Research resource")}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{getRecordSummary(item) || compactText(item.capabilities) || "Resource details have not been published yet."}</p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Access</dt><dd className="mt-1 font-semibold text-slate-950">{formatLabel(compactText(item.access_type)) || "Not published"}</dd></div>
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Updated</dt><dd className="mt-1 font-semibold text-slate-950">{formatDate(item.updated_at) || formatDate(item.created_at) || "Not published"}</dd></div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open resource</span>
    </Link>
  );
}

function ResourceRow({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `/resources-tools/${item.slug}` : "/resources-tools"}
      title={getRecordTitle(item, "Research resource")}
      description={getRecordSummary(item) || compactText(item.capabilities) || "Resource details have not been published yet."}
      badges={[item.resource_type ?? "resource", item.status]}
      filledBadges={item.is_featured ? ["Featured"] : []}
      facts={[
        { label: "Access", value: formatLabel(item.access_type) },
        { label: "Location", value: [item.location, item.room].map(compactText).filter(Boolean).join(" · ") },
        { label: "Updated", value: getRecordTimelineLabel(item) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
