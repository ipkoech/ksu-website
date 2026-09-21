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
import {
  getCenters,
  getFacilities,
  getFacilitiesFiltered,
  getServices,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { FacilitiesDisplay, ServicesDisplay } from "../../components/research-record-displays";
import { toResearchRecordDisplayDto } from "../../lib/research-formatters";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
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
  const facilityDisplayRecords = visibleFacilities.map((facility) => toResearchRecordDisplayDto(facility));
  const serviceDisplayRecords = services.data.map((service) => toResearchRecordDisplayDto(service));

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPortfolioHero
        eyebrow="Research infrastructure"
        title="Facilities & Labs"
        body="Facilities, farms, laboratories, and practical infrastructure that support field trials, experiments, services, and training."
        primary={{ label: "Explore facilities", href: "#facility-portfolio" }}
        secondary={{ label: "View centers", href: "/centers" }}
        illustration="facilities"
        imageSrc="/images/research/headers/innovation-week-8243.jpg"
        immersive
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

        <FacilitiesDisplay facilities={facilityDisplayRecords} />
      </ResearchPortfolioShell>

      <ResearchSection
        eyebrow="Support"
        title="Services that help researchers use facilities"
        body="Service records explain access, process, support scope, contact points, and downloadable requirements when available."
      >
        {services.error ? <StatusMessage tone="error">{services.error}</StatusMessage> : null}
        {serviceDisplayRecords.length > 0 ? <ServicesDisplay services={serviceDisplayRecords} /> : <StatusMessage>No public facility services are currently published.</StatusMessage>}
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

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
