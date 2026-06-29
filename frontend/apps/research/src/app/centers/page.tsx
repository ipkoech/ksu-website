import type { Metadata } from "next";
import Link from "next/link";
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
  formatLabel,
  getCenters,
  getCentersFiltered,
  getFacilities,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Centers",
  description: "Research centers, institutes, hubs, and specialist units at Kisii University.",
};

type CenterSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const centerTypes = ["research_center", "institute", "hub", "laboratory", "farm"];
const centerStatuses = ["active", "inactive", "planning", "suspended"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Featured order", value: "display_order" },
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Name A-Z", value: "name" },
  { label: "Name Z-A", value: "name_desc" },
];

export default async function CentersPage({
  searchParams,
}: {
  searchParams?: Promise<CenterSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "display_order";
  const sortField = sort === "name_desc" ? "name" : sort;
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [centers, allCenters, facilities] = await Promise.all([
    getCentersFiltered({
      search: params.q,
      centerType: params.type,
      status: params.status,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getCenters(),
    getFacilities(),
  ]);
  const years = getRecordYears(allCenters.data);
  const months = getRecordMonths(allCenters.data, params.year);
  const visibleCenters = filterRecordsByMonth(centers.data, params.year, params.month);
  const featuredCenter = visibleCenters.find((center) => center.is_featured);
  const rowCenters = featuredCenter
    ? visibleCenters.filter((center) => center.id !== featuredCenter.id)
    : visibleCenters;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <CentersMasthead
        resultCount={visibleCenters.length}
        publishedCount={allCenters.data.length}
        facilitiesCount={facilities.data.length}
        centerTypesCount={centerTypes.length}
      />

      <ResearchSection
        eyebrow="Center Directory"
        title="Centers, institutes, hubs, and specialist units"
        body="Search published centers and use the filter menu for type, years, months, active states, status, and sort order."
        tone="white"
      >
        <CenterFilters params={params} years={years} months={months} />

        {[centers.error, allCenters.error, facilities.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleCenters.length > 0 ? (
          <>
            {featuredCenter ? (
              <div className="mt-6">
                <FeaturedCenter center={featuredCenter} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowCenters.map((center) => (
                <CenterRow key={center.id} center={center} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published research centers match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Infrastructure"
        title="Facilities connected to center work"
        body="Published farm and facility records are shown from the backend as practical research infrastructure."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {facilities.data.slice(0, 8).map((facility) => (
            <FacilityTile key={facility.id} facility={facility} />
          ))}
          {facilities.data.length === 0 ? (
            <StatusMessage>No public facilities are currently published.</StatusMessage>
          ) : null}
        </div>
      </ResearchSection>
    </main>
  );
}

function CentersMasthead({
  resultCount,
  publishedCount,
  facilitiesCount,
  centerTypesCount,
}: {
  resultCount: number;
  publishedCount: number;
  facilitiesCount: number;
  centerTypesCount: number;
}) {
  const stats = [
    { label: "Center results", value: resultCount },
    { label: "Published centers", value: publishedCount },
    { label: "Facilities", value: facilitiesCount },
    { label: "Center types", value: centerTypesCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/projects" className="transition hover:text-primary">Research</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Centers</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Research Centers
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Institutional homes for research, innovation, and public collaboration
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Browse centers by name, type, active state, status, published period, and linked infrastructure.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/facilities">Explore facilities</PrimaryLink>
            <SecondaryLink href="/programs">View programmes</SecondaryLink>
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
      </div>
    </section>
  );
}

function CenterFilters({
  params,
  years,
  months,
}: {
  params: CenterSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ResearchFilterForm
      action="/centers"
      resetHref="/centers"
      searchValue={params.q}
      searchPlaceholder="Center name, mandate, research area"
      selects={[
        { name: "type", label: "Type", value: params.type, options: centerTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: centerStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedCenter({ center }: { center: ResearchGenericRecord }) {
  return (
    <Link
      href={center.slug ? `/centers/${center.slug}` : "/centers"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <CenterRowContent center={center} featured />
    </Link>
  );
}

function CenterRow({ center }: { center: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={center.slug ? `/centers/${center.slug}` : "/centers"}
      title={getRecordTitle(center, "Research center")}
      description={
        compactText(center.about) ||
        compactText(center.mandate) ||
        compactText(center.research_areas) ||
        getRecordSummary(center) ||
        "Center profile has not been published yet."
      }
      badges={[center.center_type, center.status]}
      filledBadges={[center.is_featured ? "Featured" : null]}
      facts={[
        { label: "Location", value: compactText(center.location) },
        { label: "Updated", value: getRecordTimelineLabel(center) },
        { label: "Active", value: center.is_active === false ? "Inactive" : "Active" },
      ]}
    />
  );
}

function CenterRowContent({
  center,
  featured = false,
}: {
  center: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(center.center_type) || "research center")}</Badge>
          {center.status ? <Badge>{formatLabel(center.status)}</Badge> : null}
          {featured || center.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(center, "Research center")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {compactText(center.about) ||
            compactText(center.mandate) ||
            compactText(center.research_areas) ||
            getRecordSummary(center) ||
            "Center profile has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Location</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(center.location) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Contact</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(center.email) || compactText(center.phone) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View center
      </span>
    </>
  );
}

function FacilityTile({ facility }: { facility: ResearchGenericRecord }) {
  return (
    <Link
      href={facility.slug ? `/farm/${facility.slug}` : "/farm"}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
    >
      <Badge>{formatLabel(compactText(facility.farm_type) || "facility")}</Badge>
      <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
        {getRecordTitle(facility, "Research facility")}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {compactText(facility.about) ||
          compactText(facility.activities) ||
          compactText(facility.facilities) ||
          getRecordSummary(facility) ||
          "Facility details will appear when published."}
      </p>
    </Link>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
