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
  getInnovations,
  getInnovationsFiltered,
  getProjects,
} from "../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Innovations",
  description: "Research innovations, prototypes, software, and technology transfer outputs.",
};

type InnovationSearchParams = {
  q?: string;
  type?: string;
  stage?: string;
  ip?: string;
  commercial?: string;
  center?: string;
  project?: string;
  status?: string;
  active?: string;
  sort?: string;
};

const innovationTypes = ["product", "process", "service", "technology", "software", "patent", "model", "prototype"];
const developmentStages = ["research", "development", "testing", "validation", "production"];
const ipStatuses = ["pending", "filed", "granted", "licensed", "open_source", "trade_secret"];
const commercializationStatuses = ["concept", "prototype", "pilot", "market_ready", "commercialized"];
const innovationStatuses = ["active", "draft", "archived", "discontinued"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Featured order", value: "display_order" },
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Technology readiness", value: "trl_level" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

export default async function InnovationsPage({
  searchParams,
}: {
  searchParams?: Promise<InnovationSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "display_order";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [innovations, allInnovations, centers, projects] = await Promise.all([
    getInnovationsFiltered({
      search: params.q,
      innovationType: params.type,
      developmentStage: params.stage,
      ipStatus: params.ip,
      commercializationStatus: params.commercial,
      centerId: params.center,
      projectId: params.project,
      status: params.status,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getInnovations(),
    getCenters(),
    getProjects(),
  ]);
  const featuredInnovation = innovations.data.find((innovation) => innovation.is_featured);
  const rowInnovations = featuredInnovation
    ? innovations.data.filter((innovation) => innovation.id !== featuredInnovation.id)
    : innovations.data;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <InnovationsMasthead
        resultCount={innovations.data.length}
        publishedCount={allInnovations.data.length}
        centersCount={centers.data.length}
        projectsCount={projects.data.length}
      />

      <ResearchSection
        eyebrow="Innovation Portfolio"
        title="Innovations"
        body="Search public innovations and use the filter menu for type, readiness, IP, commercialization, active state, status, center, project, and sort order."
        tone="white"
      >
        <InnovationFilters params={params} centers={centers.data} projects={projects.data} />

        {[innovations.error, allInnovations.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {innovations.data.length > 0 ? (
          <>
            {featuredInnovation ? (
              <div className="mt-6">
                <FeaturedInnovation innovation={featuredInnovation} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowInnovations.map((innovation) => (
                <InnovationRow key={innovation.id} innovation={innovation} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published innovations match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function InnovationsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  projectsCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  projectsCount: number;
}) {
  const stats = [
    { label: "Innovation results", value: resultCount },
    { label: "Published innovations", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Projects", value: projectsCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/partners" className="transition hover:text-primary">Innovation & Partnerships</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Innovations</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Innovation & Partnerships
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Research translated into tools, prototypes, services, and public value
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Explore innovations by readiness, intellectual property position, commercialization stage, project, and center.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/partners">View partners</PrimaryLink>
            <SecondaryLink href="/consultancies">Explore consultancies</SecondaryLink>
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

function InnovationFilters({
  params,
  centers,
  projects,
}: {
  params: InnovationSearchParams;
  centers: ResearchGenericRecord[];
  projects: Array<Record<string, any>>;
}) {
  return (
    <ResearchFilterForm
      action="/innovations"
      resetHref="/innovations"
      searchValue={params.q}
      searchPlaceholder="Title, problem, solution, benefit"
      selects={[
        { name: "type", label: "Type", value: params.type, options: innovationTypes },
        { name: "stage", label: "Stage", value: params.stage, options: developmentStages },
        { name: "ip", label: "IP", value: params.ip, options: ipStatuses },
        { name: "commercial", label: "Commercial", value: params.commercial, options: commercializationStatuses },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: innovationStatuses },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedInnovation({ innovation }: { innovation: ResearchGenericRecord }) {
  return (
    <Link
      href={innovation.slug ? `/innovations/${innovation.slug}` : "/innovations"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <InnovationRowContent innovation={innovation} featured />
    </Link>
  );
}

function InnovationRow({ innovation }: { innovation: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={innovation.slug ? `/innovations/${innovation.slug}` : "/innovations"}
      title={getRecordTitle(innovation, "Innovation")}
      description={
        getRecordSummary(innovation) ||
        compactText(innovation.problem_addressed) ||
        compactText(innovation.solution) ||
        "Innovation summary has not been published yet."
      }
      badges={[innovation.innovation_type, innovation.development_stage, innovation.status]}
      filledBadges={[innovation.is_featured ? "Featured" : null]}
      facts={[
        { label: "TRL", value: innovation.trl_level ? `Level ${innovation.trl_level}` : "" },
        { label: "IP", value: formatLabel(innovation.ip_status) },
        { label: "Commercial", value: formatLabel(innovation.commercialization_status) },
      ]}
    />
  );
}

function InnovationRowContent({
  innovation,
  featured = false,
}: {
  innovation: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(innovation.innovation_type) || "innovation")}</Badge>
          {innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}
          {featured || innovation.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(innovation, "Innovation")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(innovation) ||
            compactText(innovation.problem_addressed) ||
            compactText(innovation.solution) ||
            "Innovation summary has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">TRL</dt>
          <dd className="mt-1 font-semibold text-slate-950">{innovation.trl_level ? `Level ${innovation.trl_level}` : "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Commercial</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatLabel(innovation.commercialization_status) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View innovation
      </span>
    </>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
