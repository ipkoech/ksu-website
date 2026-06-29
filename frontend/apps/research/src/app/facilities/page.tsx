import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import {
  Badge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getFacilitiesFiltered,
  getServices,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { getRecordSummary, getRecordTimelineLabel, getRecordTitle } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Facilities & Labs",
  description: "Research facilities, labs, farms, and support services.",
};

type FacilitySearchParams = {
  q?: string;
  type?: string;
  center?: string;
  sort?: string;
};

const farmTypes = ["crop", "livestock", "aquaculture", "mixed", "demonstration", "experimental"];

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams?: Promise<FacilitySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [facilities, centers, services] = await Promise.all([
    getFacilitiesFiltered({
      search: params.q,
      farmType: params.type,
      centerId: params.center,
      sort: params.sort || "display_order",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getCenters(),
    getServices(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <FacilitiesMasthead
        facilityCount={facilities.data.length}
        centerCount={centers.data.length}
        serviceCount={services.data.length}
      />

      <ResearchSection
        eyebrow="Infrastructure"
        title="Facilities and research farms"
        body="Browse facilities by type, center, availability, location, and activity area."
        tone="white"
      >
        <FacilityFilters params={params} centers={centers.data} />

        {[facilities.error, centers.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {facilities.data.length > 0 ? (
          <div className="mt-7 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
            {facilities.data.map((facility) => (
              <FacilityRow key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No facilities match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

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
              className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30"
            >
              <Badge>{formatLabel(service.service_type ?? service.type ?? "service")}</Badge>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {service.name ?? service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(service.summary) ||
                  compactText(service.description) ||
                  compactText(service.how_to_access) ||
                  "Service details will appear when published."}
              </p>
              <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
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

function FacilitiesMasthead({
  facilityCount,
  centerCount,
  serviceCount,
}: {
  facilityCount: number;
  centerCount: number;
  serviceCount: number;
}) {
  const stats = [
    { label: "Facility results", value: facilityCount },
    { label: "Centers", value: centerCount },
    { label: "Support services", value: serviceCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,460px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Facilities</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Facilities</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Facilities, farms, labs, and research infrastructure</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Search backend facility records by name, type, center, location, activity area, and service access.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/centers">View centers</PrimaryLink>
            <SecondaryLink href="/services">Support services</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
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

function FacilityFilters({
  params,
  centers,
}: {
  params: FacilitySearchParams;
  centers: ResearchGenericRecord[];
}) {
  return (
    <ResearchFilterForm
      action="/facilities"
      resetHref="/facilities"
      searchValue={params.q}
      searchPlaceholder="Facility name, activities, location"
      selects={[{ name: "type", label: "Type", value: params.type, options: farmTypes }]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={[
        { value: "display_order", label: "Featured order" },
        { value: "name", label: "Name" },
        { value: "created_at", label: "Newest" },
      ]}
    />
  );
}

function FacilityRow({ facility }: { facility: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={facility.slug ? `/farm/${facility.slug}` : "/farm"}
      title={getRecordTitle(facility, "Research facility")}
      description={getRecordSummary(facility) || compactText(facility.activities) || compactText(facility.facilities) || "Facility profile will appear when published by the research office."}
      badges={[facility.farm_type ?? "facility", facility.county]}
      filledBadges={[facility.is_featured ? "Featured" : null]}
      facts={[
        { label: "Location", value: compactText(facility.location) || compactText(facility.manager_name) },
        { label: "Size", value: facility.size_hectares ? `${compactText(facility.size_hectares)} hectares` : "" },
        { label: "Updated", value: getRecordTimelineLabel(facility) },
      ]}
    />
  );
}
