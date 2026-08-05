import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getCenters, getServices, getServicesFiltered } from "../../lib/research-public-data";
import { filterRecordsByMonth, getRecordMonths, getRecordSummary, getRecordTimelineLabel, getRecordTitle, getRecordYears } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = { title: "Research Services", description: "Research support services available through Kisii University." };

type ServiceParams = { q?: string; type?: string; category?: string; center?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };
const serviceTypes = ["support", "consultation", "ethics", "data", "proposal", "training", "commercialization", "partnership"];
const serviceStatuses = ["available", "paused", "draft", "archived"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "turnaround_time", label: "Turnaround" },
];

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<ServiceParams> }) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "name";
  const order = sort === "name" || sort === "turnaround_time" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [services, allServices, centers] = await Promise.all([
    getServicesFiltered({ search: params.q, serviceType: params.type, category: params.category, centerId: params.center, status: params.status, year: params.year, sort, order, ...activeFlags }),
    getServices(),
    getCenters(),
  ]);
  const categories = Array.from(new Set(allServices.data.map((item) => compactText(item.category)).filter(Boolean))).sort();
  const years = getRecordYears(allServices.data);
  const months = getRecordMonths(allServices.data, params.year);
  const visibleServices = filterRecordsByMonth(services.data, params.year, params.month);
  const featuredService = visibleServices.find((item) => item.is_featured);
  const rowServices = featuredService ? visibleServices.filter((item) => item.id !== featuredService.id) : visibleServices;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ServicesMasthead resultCount={visibleServices.length} publishedCount={allServices.data.length} centersCount={centers.data.length} categoriesCount={categories.length} />
      <ResearchSection eyebrow="Service Catalogue" title="Available research services" body="Search first, then use the filter menu for type, active state, status, year, month, category, center, and sort order." tone="white">
        <ServiceFilters params={params} categories={categories} centers={centers.data} years={years} months={months} />
        {[services.error, allServices.error, centers.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {visibleServices.length ? (
          <>
            {featuredService ? <div className="mt-6"><FeaturedService item={featuredService} /></div> : null}
            <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">{rowServices.map((item) => <ServiceRow key={item.id} item={item} />)}</div>
          </>
        ) : <div className="mt-7"><StatusMessage>No services match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ServicesMasthead({ resultCount, publishedCount, centersCount, categoriesCount }: { resultCount: number; publishedCount: number; centersCount: number; categoriesCount: number }) {
  const stats = [
    { label: "Service results", value: resultCount },
    { label: "Published services", value: publishedCount },
    { label: "Centers", value: centersCount },
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
            <span className="text-foreground">Services</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Research Support</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Support services for researchers, students, collaborators, and public requests</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">Compare service scope, access route, turnaround, fees, and the center or office responsible for delivery.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/connect">Contact support</PrimaryLink>
            <SecondaryLink href="/resources-tools">Browse tools</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2"><dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt><dd className="mt-1 text-lg font-semibold text-foreground">{stat.value}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}

function ServiceFilters({ params, categories, centers, years, months }: { params: ServiceParams; categories: string[]; centers: ResearchGenericRecord[]; years: string[]; months: Array<{ value: string; label: string }> }) {
  return (
    <ResearchFilterForm
      action="/services"
      resetHref="/services"
      searchValue={params.q}
      searchPlaceholder="Service, process, deliverable"
      selects={[
        { name: "type", label: "Type", value: params.type, options: serviceTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: serviceStatuses },
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

function FeaturedService({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link href={item.slug ? `/services/${item.slug}` : "/services"} className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(item.service_type) || "service")}</Badge>
          {item.category ? <Badge>{formatLabel(item.category)}</Badge> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">{getRecordTitle(item, "Research support service")}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{getRecordSummary(item) || compactText(item.scope) || "Service details have not been published yet."}</p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Turnaround</dt><dd className="mt-1 font-semibold text-foreground">{compactText(item.turnaround_time) || "Not published"}</dd></div>
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-muted-foreground">Updated</dt><dd className="mt-1 font-semibold text-foreground">{formatDate(item.updated_at) || formatDate(item.created_at) || "Not published"}</dd></div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open service</span>
    </Link>
  );
}

function ServiceRow({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `/services/${item.slug}` : "/services"}
      title={getRecordTitle(item, "Research support service")}
      description={getRecordSummary(item) || compactText(item.scope) || "Service details have not been published yet."}
      badges={[item.service_type ?? "service", item.category, item.status]}
      filledBadges={[item.is_featured ? "Featured" : null, item.is_free ? "Free" : null]}
      facts={[
        { label: "Turnaround", value: compactText(item.turnaround_time) },
        { label: "Access", value: compactText(item.how_to_access) },
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
