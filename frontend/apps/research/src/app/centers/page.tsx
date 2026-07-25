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
  getRecordMonths,
  getRecordSummary,
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
  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
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
        footer={
          visibleCenters.length > 0 ? (
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleCenters.length : centers.total}
              perPage={centers.perPage}
              path="/centers"
              params={params}
            />
          ) : null
        }
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
            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
                <span>Center</span>
                <span>Type</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleCenters.map((center) => (
                  <CenterRow key={center.id} center={center} />
                ))}
              </div>
            </div>
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

function CenterRow({ center }: { center: ResearchGenericRecord }) {
  const href = center.slug ? `/centers/${center.slug}` : "/centers";
  const title = getRecordTitle(center, "Research center");
  const status = center.status ? formatLabel(center.status) : center.is_active === false ? "Inactive" : "Active";

  return (
    <Link
      href={href}
      className="group grid gap-2 px-4 py-3 transition hover:bg-surface-subtle/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">
          {title}
        </h2>
        {center.code ? (
          <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{compactText(center.code)}</p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-muted-foreground md:text-sm">
        {formatLabel(compactText(center.center_type) || "research center")}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{status}</Badge>
        {center.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
    </Link>
  );
}

function FacilityTile({ facility }: { facility: ResearchGenericRecord }) {
  return (
    <Link
      href={facility.slug ? `/farm/${facility.slug}` : "/farm"}
      className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
    >
      <Badge>{formatLabel(compactText(facility.farm_type) || "facility")}</Badge>
      <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
        {getRecordTitle(facility, "Research facility")}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
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
