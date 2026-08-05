import type { Metadata } from "next";
import Link from "next/link";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import {
  Badge,
  ResearchSection,
  FilledBadge,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getFacilities,
  getFacilitiesFiltered,
  getServices,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Facilities & Labs",
  description: "Research facilities, labs, farms, and support services.",
};

type FacilitySearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
};

const farmTypes = ["crop", "livestock", "aquaculture", "mixed", "demonstration", "experimental"];
const facilityStatuses = ["active", "inactive", "maintenance", "planned", "closed"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "display_order", label: "Featured order" },
  { value: "name", label: "Name A-Z" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
];
const quickLinks = [
  { label: "Centers", href: "/centers", body: "Institutional owners and anchors" },
  { label: "Services", href: "/services", body: "Support available to researchers" },
  { label: "Farm", href: "/farm", body: "Research farm profiles" },
  { label: "Resources", href: "/resources-tools", body: "Tools and access material" },
];

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams?: Promise<FacilitySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const activeFlags = getActiveFlags(params.active);
  const [facilities, allFacilities, centers, services] = await Promise.all([
    getFacilitiesFiltered({
      search: params.q,
      farmType: params.type,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "display_order",
      order: params.sort === "name" ? "asc" : "desc",
      page,
      perPage,
      ...activeFlags,
    }),
    getFacilities(),
    getCenters(),
    getServices(),
  ]);
  const years = getRecordYears(allFacilities.data);
  const months = getRecordMonths(allFacilities.data, params.year);
  const visibleFacilities = filterRecordsByMonth(facilities.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visibleFacilities.length : facilities.total) / facilities.perPage,
  );

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPortfolioHero
        eyebrow="Research infrastructure"
        title="Facilities & Labs"
        body="Facilities, farms, laboratories, and practical infrastructure that support field trials, experiments, services, and training."
        primary={{ label: "Explore facilities", href: "#facility-portfolio" }}
        secondary={{ label: "View centers", href: "/centers" }}
        illustration="facilities"
      />

      <ResearchPortfolioShell
        id="facility-portfolio"
        title="Facility Portfolio"
        body="Search, filter, sort, and open published infrastructure profiles."
        quickLinks={quickLinks}
        controls={<FacilityFilters params={params} centers={centers.data} years={years} months={months} />}
        footer={
          visibleFacilities.length > 0 ? (
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleFacilities.length : facilities.total}
              perPage={facilities.perPage}
              path="/facilities"
              params={params}
            />
          ) : null
        }
      >
        {[facilities.error, allFacilities.error, centers.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleFacilities.length > 0 ? (
          <>
            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
                <span>Facility</span>
                <span>Type</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleFacilities.map((facility) => (
                  <FacilityRow key={facility.id} facility={facility} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No facilities match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchPortfolioShell>

      <ResearchSection
        eyebrow="Support"
        title="Services that help researchers use facilities"
        body="Service records explain access, process, support scope, contact points, and downloadable requirements when available."
      >
        {services.error ? <StatusMessage tone="error">{services.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.data.slice(0, 6).map((service) => (
            <Link
              key={service.id}
              href={service.slug ? `/services/${service.slug}` : "/services"}
              className="block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/30"
            >
              <Badge>{formatLabel(service.service_type ?? service.type ?? "service")}</Badge>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {service.name ?? service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {compactText(service.summary) ||
                  compactText(service.description) ||
                  compactText(service.how_to_access) ||
                  "Service details will appear when published."}
              </p>
              <p className="mt-5 rounded-md bg-surface-subtle p-3 text-sm font-semibold text-muted-foreground">
                {compactText(service.turnaround_time) ||
                  compactText(service.contact_email) ||
                  "Access details not published"}
              </p>
            </Link>
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function FacilityFilters({
  params,
  centers,
  years,
  months,
}: {
  params: FacilitySearchParams;
  centers: ResearchGenericRecord[];
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ProgramTableControls
      action="/facilities"
      resetHref="/facilities"
      searchValue={params.q}
      searchPlaceholder="Search facilities by name, activity, location..."
      filterTitle="Filter facilities"
      sortTitle="Sort facilities"
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: farmTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: facilityStatuses },
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

function FacilityRow({ facility }: { facility: ResearchGenericRecord }) {
  const href = facility.slug ? `/farm/${facility.slug}` : "/farm";
  const title = getRecordTitle(facility, "Research facility");
  const type = formatLabel(compactText(facility.farm_type) || "facility");
  const status = formatLabel(compactText(facility.status) || (facility.is_active === false ? "inactive" : "active"));

  return (
    <Link
      href={href}
      className="group grid gap-2 px-4 py-3 transition hover:bg-surface-subtle/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">
          {title}
        </h2>
        {facility.code ? (
          <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{compactText(facility.code)}</p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-muted-foreground md:text-sm">{type}</div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{status}</Badge>
        {facility.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
    </Link>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
