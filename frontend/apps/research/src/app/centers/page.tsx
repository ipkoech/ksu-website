import type { Metadata } from "next";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import {
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import { getCenters, getCentersFiltered, getFacilities } from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordYears,
} from "../../lib/research-page-model";
import { CenterFacilitiesDisplay, CentersDisplay } from "../../components/research-record-displays";
import { toResearchRecordDisplayDto } from "../../lib/research-formatters";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Centers",
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
  const centerDisplayRecords = visibleCenters.map((center) => toResearchRecordDisplayDto(center));
  const facilityDisplayRecords = facilities.data.map((facility) => toResearchRecordDisplayDto(facility));
  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPortfolioHero
        eyebrow="Institutional research anchors"
        title="Centers"
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

        <CentersDisplay centers={centerDisplayRecords} />
      </ResearchPortfolioShell>

      <ResearchSection
        eyebrow="Infrastructure"
        title="Facilities connected to center work"
        body="Published farm and facility records are shown from the backend as practical research infrastructure."
      >
        {facilities.error ? <StatusMessage tone="error">{facilities.error}</StatusMessage> : null}
        {facilityDisplayRecords.length > 0 ? <CenterFacilitiesDisplay facilities={facilityDisplayRecords} /> : <StatusMessage>No public facilities are currently published.</StatusMessage>}
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

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
