import { ResearchPageHero } from "../../components/research-page-hero";
import type { Metadata } from "next";
import { ResearchPageShell } from "../../components/research-page-primitives";
import Link from "next/link";
import {
  ArrowRight,
  UsersRound,
} from "lucide-react";
import { innovationPathwayLinks as pathwayLinks, innovationReadingSteps as readSteps } from "../../config/research-page-content";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { StatusMessage } from "../../components/research-ui";
import {
  getCenters,
  getInnovations,
  getInnovationsFiltered,
  getProjects,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { InnovationsDisplay } from "../../components/research-record-displays";
import { toResearchRecordDisplayDto } from "../../lib/research-formatters";

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
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
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
  { label: "Newest", value: "created_at" },
  { label: "Featured order", value: "display_order" },
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
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const sort = params.sort || "created_at";
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
      year: params.year,
      sort: sortField,
      order,
      page,
      perPage,
      ...activeFlags,
    }),
    getInnovations(),
    getCenters(),
    getProjects(),
  ]);
  const years = getRecordYears(allInnovations.data);
  const months = getRecordMonths(allInnovations.data, params.year);
  const visibleInnovations = filterRecordsByMonth(innovations.data, params.year, params.month);
  const featuredInnovation = visibleInnovations.find((innovation) => innovation.is_featured) ?? visibleInnovations[0];
  const cardInnovations = featuredInnovation
    ? visibleInnovations.filter((innovation) => innovation.id !== featuredInnovation.id)
    : visibleInnovations;
  const totalPages = Math.ceil(
    (params.month ? visibleInnovations.length : innovations.total) / innovations.perPage,
  );
  const projectNames = new Map(projects.data.map((project) => [project.id, project.title ?? project.name ?? project.code ?? ""]));
  const centerNames = new Map(centers.data.map((center) => [center.id, center.name ?? center.title ?? center.code ?? ""]));
  const featuredDisplayRecord = featuredInnovation ? toResearchRecordDisplayDto(featuredInnovation) : undefined;
  const innovationProjectNames = Object.fromEntries(projectNames);
  const innovationCenterNames = Object.fromEntries(centerNames);

  return (
    <ResearchPageShell>
      <InnovationHero />

      <section
        id="innovation-portfolio"
        className="bg-[linear-gradient(180deg,#ffffff_0%,hsl(var(--surface-subtle))_44%,#ffffff_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="min-w-0">
            <InnovationFilters
              params={params}
              centers={centers.data}
              projects={projects.data}
              years={years}
              months={months}
            />

            {[innovations.error, centers.error, projects.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-5">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}

            {visibleInnovations.length > 0 ? (
              <>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    All innovations
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {visibleInnovations.length} shown
                  </p>
                </div>
                <InnovationsDisplay
                  featured={featuredDisplayRecord}
                  records={cardInnovations.map((innovation) => toResearchRecordDisplayDto(innovation))}
                  projectNames={innovationProjectNames}
                  centerNames={innovationCenterNames}
                />
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={params.month ? visibleInnovations.length : innovations.total}
                  perPage={innovations.perPage}
                  path="/innovations"
                  params={params}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="mt-6">
                <StatusMessage>No published innovations match the current filters.</StatusMessage>
              </div>
            )}
          </div>

          <InnovationAside />
        </div>
      </section>
    </ResearchPageShell>
  );
}

function InnovationHero() {
  return (
    <ResearchPageHero
      eyebrow="Innovation & Enterprise"
      title="Innovations"
      description="Moving university research from ideas to field-ready solutions that improve lives, protect the environment, and grow economies."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Innovations" }]}
      imageSrc="/images/research/headers/innovation-week-8243.jpg"
      imageAlt="Visitors exploring an exhibition at Kisii University Innovation Week"
      actions={[{ label: "Explore innovations", href: "#innovation-portfolio" }, { label: "Partner with us", href: "/partners", variant: "secondary" }]}
    />
  );
}

function InnovationFilters({
  params,
  centers,
  projects,
  years,
  months,
}: {
  params: InnovationSearchParams;
  centers: ResearchGenericRecord[];
  projects: ResearchGenericRecord[];
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ProgramTableControls
      action="/innovations"
      resetHref="/innovations"
      searchValue={params.q}
      searchPlaceholder="Search innovations by title, keyword, technology, or problem solved..."
      filterTitle="Filter innovations"
      sortTitle="Sort innovations"
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: innovationTypes },
        { name: "stage", label: "Readiness stage", value: params.stage, options: developmentStages },
        { name: "ip", label: "IP status", value: params.ip, options: ipStatuses },
        { name: "commercial", label: "Commercial stage", value: params.commercial, options: commercializationStatuses },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: innovationStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function InnovationAside() {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Innovation pathways</h2>
        <div className="mt-3 divide-y divide-border">
          {pathwayLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 py-4 first:pt-2 last:pb-1"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/20 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary group-hover:text-secondary">{link.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{link.body}</span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 text-primary transition group-hover:translate-x-1 group-hover:text-secondary" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">How to read a record</h2>
        <div className="mt-4 space-y-4">
          {readSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="grid grid-cols-[48px_24px_minmax(0,1fr)] items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-border text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="pt-2 text-base font-semibold text-muted-foreground">{index + 1}</span>
                <span>
                  <span className="block font-semibold text-primary">{step.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{step.body}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
        <div className="flex gap-3">
          <UsersRound aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold text-primary">Have an innovation idea?</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              We support researchers to validate, develop, and deploy solutions.
            </p>
            <Link href="/connect" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
              Submit an innovation
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </aside>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
