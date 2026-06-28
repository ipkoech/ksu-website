import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Building2, FlaskConical, GraduationCap, Sprout } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm } from "../../components/research-listing";
import {
  Badge,
  ResearchSection,
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

export const dynamic = "force-dynamic";

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

const discoveryLinks = [
  {
    label: "Projects",
    href: "/projects",
    description: "Browse funded, applied, action, and collaborative work.",
    icon: FlaskConical,
  },
  {
    label: "Programs",
    href: "/programs",
    description: "See long-term research pathways and related projects.",
    icon: BookOpenCheck,
  },
  {
    label: "Centers",
    href: "/centers",
    description: "Find the institutional homes for research activity.",
    icon: Building2,
  },
  {
    label: "Facilities",
    href: "/facilities",
    description: "Explore farms, labs, and practical research infrastructure.",
    icon: Sprout,
  },
  {
    label: "Capacity",
    href: "/capacity",
    description: "Training, mentorship, and scholarship support.",
    icon: GraduationCap,
  },
];

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
      <ResearchClusterHero
        eyebrow="Discovery"
        title="Facilities, labs, farms, and research infrastructure."
        body="Find research infrastructure, access points, services, and facilities that support discovery and extension."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Discovery", href: "/projects" },
          { label: "Facilities" },
        ]}
        imageSrc="/images/research/research-events-hero.svg"
        imageAlt="Research farm, laboratory, and field infrastructure supporting discovery"
        links={discoveryLinks}
        primaryAction={{ label: "View centers", href: "/centers" }}
        stats={[
          { label: "Facility results", value: facilities.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Support services", value: services.data.length },
          { label: "Facility types", value: farmTypes.length },
        ]}
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
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {facilities.data.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
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

function FacilityCard({ facility }: { facility: ResearchGenericRecord }) {
  return (
    <Link
      href={facility.slug ? `/farm/${facility.slug}` : "/farm"}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(facility.farm_type ?? "facility")}</Badge>
        {facility.county ? <Badge>{facility.county}</Badge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {facility.name ?? facility.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(facility.about) ||
          compactText(facility.activities) ||
          compactText(facility.facilities) ||
          "Facility profile will appear when published by the research office."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {compactText(facility.location) ||
          compactText(facility.manager_name) ||
          "Location details not published"}
      </p>
    </Link>
  );
}
