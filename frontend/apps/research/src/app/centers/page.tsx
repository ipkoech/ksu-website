import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import {
  Badge,
  FilledBadge,
  ResearchSection,
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
  getListPageSize,
  getPublishedFactItems,
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
  page?: string;
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
const quickLinks = [
  { label: "Programs", href: "/programs", body: "Research umbrellas anchored by centers" },
  { label: "Projects", href: "/projects", body: "Workstreams delivered with centers" },
  { label: "Facilities", href: "/facilities", body: "Labs, farms, and infrastructure" },
  { label: "Outputs", href: "/outputs", body: "Evidence produced by research teams" },
];

export default async function CentersPage({
  searchParams,
}: {
  searchParams?: Promise<CenterSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
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
      page,
      perPage,
      ...activeFlags,
    }),
    getCenters(),
    getFacilities(),
  ]);
  const years = getRecordYears(allCenters.data);
  const months = getRecordMonths(allCenters.data, params.year);
  const visibleCenters = filterRecordsByMonth(centers.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visibleCenters.length : centers.total) / centers.perPage,
  );
  const featuredCenter = visibleCenters.find((center) => center.is_featured);
  const rowCenters = featuredCenter
    ? visibleCenters.filter((center) => center.id !== featuredCenter.id)
    : visibleCenters;

  const baseHref = getCentersPageHref(params);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResearchPortfolioHero
        eyebrow="Institutional research anchors"
        title="Research Centers"
        body="Centers, institutes, hubs, laboratories, and specialist units that coordinate research delivery, infrastructure, and public collaboration."
        primary={{ label: "Explore centers", href: "#center-directory" }}
        secondary={{ label: "View facilities", href: "/facilities" }}
        illustration="centers"
      />

      <ResearchPortfolioShell
        id="center-directory"
        title="Center Directory"
        body="Search, filter, sort, and open published center profiles."
        quickLinks={quickLinks}
        controls={<CenterFilters params={params} years={years} months={months} />}
      >
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
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(340px,1fr)_150px_170px_170px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Center</span>
                <span>Status</span>
                <span>Location</span>
                <span>Updated</span>
              </div>
              <div className="divide-y divide-slate-200">
                {rowCenters.map((center) => (
                  <CenterRow key={center.id} center={center} />
                ))}
              </div>
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleCenters.length : centers.total}
              perPage={centers.perPage}
              baseHref={baseHref}
              className="mt-5"
            />
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published research centers match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchPortfolioShell>

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
    <ProgramTableControls
      action="/centers"
      resetHref="/centers"
      searchValue={params.q}
      searchPlaceholder="Search centers by name, mandate, research area..."
      filterTitle="Filter centers"
      sortTitle="Sort centers"
      filterSelects={[
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
  const href = center.slug ? `/centers/${center.slug}` : "/centers";
  const title = getRecordTitle(center, "Research center");
  const summary =
    compactText(center.about) ||
    compactText(center.mandate) ||
    compactText(center.research_areas) ||
    getRecordSummary(center);
  const status = center.status ? formatLabel(center.status) : center.is_active === false ? "Inactive" : "Active";
  const location = compactText(center.location);
  const updated = getRecordTimelineLabel(center);
  const facts = getPublishedFactItems([
    { label: "Status", value: status },
    { label: "Location", value: location },
    { label: "Updated", value: updated },
  ]);

  return (
    <Link
      href={href}
      className="group grid gap-3 px-4 py-4 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:grid-cols-[minmax(340px,1fr)_150px_170px_170px] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatLabel(compactText(center.center_type) || "research center")}</Badge>
          {center.status ? <Badge>{formatLabel(center.status)}</Badge> : null}
          {center.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-2 flex items-start gap-2 text-base font-semibold leading-6 text-slate-950">
          <span className="transition group-hover:text-primary">{title}</span>
          <ExternalLink aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
        </h2>
        {summary ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p> : null}
        {facts.length ? (
          <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3 lg:hidden">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md bg-slate-50 px-3 py-2">
                <dt className="font-semibold uppercase text-slate-500">{fact.label}</dt>
                <dd className="mt-1 font-medium text-slate-800">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      <div className="hidden text-sm font-medium text-slate-700 lg:block">{status}</div>
      <div className="hidden text-sm text-slate-600 lg:block">{location || "-"}</div>
      <div className="hidden text-sm text-slate-600 lg:block">{updated || "-"}</div>
    </Link>
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

function getCentersPageHref(params: CenterSearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") continue;
    query.set(key, value);
  }
  const search = query.toString();
  return search ? `/centers?${search}` : "/centers";
}
