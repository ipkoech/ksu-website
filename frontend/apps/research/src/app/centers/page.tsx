import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Building2, FlaskConical, GraduationCap, Sprout } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
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
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Centers",
  description: "Research centers and institutes at Kisii University.",
};

type CenterSearchParams = {
  q?: string;
  type?: string;
  sort?: string;
};

const centerTypes = ["research_center", "institute", "hub", "laboratory", "farm"];

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

export default async function CentersPage({
  searchParams,
}: {
  searchParams?: Promise<CenterSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [centers, allCenters, facilities] = await Promise.all([
    getCentersFiltered({
      search: params.q,
      centerType: params.type,
      sort: params.sort || "display_order",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getCenters(),
    getFacilities(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Discovery"
        title="Research centers, institutes, hubs, and specialist units."
        body="Centers are the institutional homes for programs, projects, facilities, and public research collaboration."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Discovery", href: "/projects" },
          { label: "Centers" },
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Research centers connecting faculty, facilities, and partner networks"
        links={discoveryLinks}
        primaryAction={{ label: "Explore facilities", href: "/facilities" }}
        stats={[
          { label: "Center results", value: centers.data.length },
          { label: "Published centers", value: allCenters.data.length },
          { label: "Facilities", value: facilities.data.length },
          { label: "Center types", value: centerTypes.length },
        ]}
      />

      <ResearchSection
        eyebrow="Directory"
        title="Centers and institutes"
        body="Center records are backed by the Research Centers endpoint and filtered server-side."
        tone="white"
      >
        <CenterFilters params={params} />

        {[centers.error, allCenters.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {centers.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {centers.data.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No research centers match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Facilities"
        title="Facilities connected to centers"
        body="Farm and facility records are shown as practical research infrastructure connected to the center network."
      >
        {facilities.error ? <StatusMessage tone="error">{facilities.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {facilities.data.slice(0, 6).map((facility) => (
            <Link
              key={facility.id}
              href={facility.slug ? `/farm/${facility.slug}` : "/farm"}
              className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30"
            >
              <Badge>{formatLabel(facility.farm_type ?? "facility")}</Badge>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {facility.name ?? facility.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(facility.about) ||
                  compactText(facility.activities) ||
                  compactText(facility.facilities) ||
                  "Facility details will appear when published."}
              </p>
            </Link>
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function CenterFilters({ params }: { params: CenterSearchParams }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/centers">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Center name, mandate, research area"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Type</span>
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All types</option>
            {centerTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "display_order"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="display_order">Featured order</option>
            <option value="name">Name</option>
            <option value="created_at">Newest</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply
          </button>
          <Link
            href="/centers"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function CenterCard({ center }: { center: ResearchGenericRecord }) {
  return (
    <Link
      href={center.slug ? `/centers/${center.slug}` : "/centers"}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(center.center_type ?? "research center")}</Badge>
        {center.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {center.name ?? center.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(center.about) ||
          compactText(center.mandate) ||
          compactText(center.research_areas) ||
          "Center profile will appear when published by the research office."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {compactText(center.location) || compactText(center.email) || "Contact details not published"}
      </p>
    </Link>
  );
}
