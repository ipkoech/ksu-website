import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, FlaskConical, LayoutGrid, Rows3 } from "lucide-react";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import {
  getListingHref,
  ResearchListPagination,
} from "../../components/research-list-pagination";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import {
  Badge,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getFeaturedProject,
  getProjectFilterRecords,
  getPrograms,
  getProjects,
  getResearchPortfolioStats,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client/server";
import {
  getProjectMonths,
  getProjectYears,
} from "./project-page-model";
import { getListPageSize } from "../../lib/research-page-model";
import { ResearchImage } from "../../components/research-image";
import { ResearchDiscoveryInteractive } from "../../components/research-discovery-interactive";
import { ResearchBackground } from "../../components/research-background";
import { ProjectResults, type ProjectResultDto } from "../../components/project-results";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse Kisii University research projects and active research work.",
};

type ProjectSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  center?: string;
  program?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
  view?: string;
};

type ProjectListView = "table" | "cards";

const projectTypes = ["basic", "applied", "action", "collaborative", "commissioned"];
const projectStatuses = ["proposal", "approved", "ongoing", "completed", "suspended", "cancelled"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Start date", value: "start_date" },
  { label: "End date", value: "end_date" },
  { label: "Progress", value: "progress_percentage" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<ProjectSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const view = getProjectListView(params.view);
  const sort = params.sort || "created_at";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [projects, projectFilterRecords, centers, programs, featuredProject, portfolioStats] = await Promise.all([
    getProjects(
      {
        search: params.q,
        projectType: params.type,
        status: params.status,
        centerId: params.center,
        programId: params.program,
        year: params.year,
        month: params.month,
        sort: sortField,
        order,
        perPage,
        ...activeFlags,
      },
      page,
    ),
    getProjectFilterRecords(),
    getCenters(),
    getPrograms(),
    getFeaturedProject(),
    getResearchPortfolioStats(),
  ]);
  const years = getProjectYears(projectFilterRecords.data);
  const months = getProjectMonths(projectFilterRecords.data, params.year);
  const visibleProjects = projects.data;
  const projectResultDtos: ProjectResultDto[] = visibleProjects.map((project) => {
    const record = project as ResearchProject & Record<string, unknown>;
    const cover = record.cover_image;
    const coverImage = cover && typeof cover === "object" ? cover as Record<string, unknown> : null;
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      code: project.code ?? null,
      project_type: project.project_type ?? null,
      status: project.status ?? null,
      is_featured: Boolean(project.is_featured),
      summary: project.summary ?? null,
      start_date: project.start_date ?? null,
      end_date: project.end_date ?? null,
      cover_image_url: project.cover_image_url ?? null,
      principal_investigator_name: typeof record.principal_investigator_name === "string" ? record.principal_investigator_name : null,
      lead_researcher: typeof record.lead_researcher === "string" ? record.lead_researcher : null,
      center_name: typeof record.center_name === "string" ? record.center_name : null,
      cover_image: coverImage ? {
        url: typeof coverImage.url === "string" ? coverImage.url : null,
        public_url: typeof coverImage.public_url === "string" ? coverImage.public_url : null,
        thumbnail_url: typeof coverImage.thumbnail_url === "string" ? coverImage.thumbnail_url : null,
        file_url: typeof coverImage.file_url === "string" ? coverImage.file_url : null,
      } : null,
    };
  });
  const totalPages = Math.ceil(projects.total / projects.perPage);

  return (
    <ResearchBackground
      as="main"
      id="research-main"
      variant="discovery"
      intensity="soft"
      plateImage="/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3942.jpg"
      className="min-h-screen text-foreground"
    >
      <ResearchPortfolioHero
        eyebrow="Research & Discovery"
        title="Projects"
        body="Explore the questions Kisii University researchers are pursuing and the practical outcomes emerging from laboratories, field sites, communities, and partnerships."
        illustration="projects"
        imageSrc="/images/research/headers/innovation-week-8246.jpg"
        immersive
      />

      <ProjectEditorialLead
        featured={featuredProject.data ?? visibleProjects[0]}
        projectCount={getPortfolioStat(portfolioStats, "research_projects", projects.total)}
        programCount={getPortfolioStat(portfolioStats, "research_programmes", programs.total)}
        centerCount={getPortfolioStat(portfolioStats, "research_centres", centers.total)}
      />

      <ResearchPortfolioShell
        id="project-portfolio"
        title="Project Portfolio"
        body="Search, filter, sort, and open published research project stories."
        quickLinks={[]}
        controls={
          <ProjectFilters
            params={params}
            centers={centers.data}
            programs={programs.data}
            years={years}
            months={months}
            view={view}
          />
        }
        footer={
          visibleProjects.length > 0 ? (
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={projects.total}
              perPage={projects.perPage}
              path="/projects"
              params={params}
            />
          ) : null
        }
      >
        {[projects.error, projectFilterRecords.error, centers.error, programs.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleProjects.length > 0 ? (
          <ProjectResults projects={projectResultDtos} view={view} />
        ) : (
          <div className="mt-7">
            <StatusMessage>
              No published research projects match the current filters.
            </StatusMessage>
          </div>
        )}
      </ResearchPortfolioShell>

      <ResearchDiscoveryInteractive />
      <ProjectClosingCta />

    </ResearchBackground>
  );
}

function getPortfolioStat(stats: Awaited<ReturnType<typeof getResearchPortfolioStats>>, key: string, fallback: number) {
  const value = stats?.stats.find((item) => item.key === key)?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ProjectClosingCta() {
  return (
    <section className="border-t border-primary/10 bg-transparent px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white/70 px-6 py-8 shadow-[0_18px_50px_-42px_hsl(var(--primary)/0.65)] backdrop-blur-sm sm:px-8 lg:px-10 lg:py-10">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--secondary))_32%,hsl(var(--primary))_32%,hsl(var(--primary))_100%)]" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Continue the discovery</p>
              <h2 className="mt-3 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Connect individual projects to the programmes, people, and evidence behind them.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Follow the wider research portfolio or speak with the university research team about expertise and collaboration.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/programs" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-secondary/90">Explore programmes <ArrowUpRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/connect" className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5">Partner with us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectEditorialLead({
  featured,
  projectCount,
  programCount,
  centerCount,
}: {
  featured?: ResearchProject;
  projectCount: number;
  programCount: number;
  centerCount: number;
}) {
  const featureHref = featured?.slug ? `/projects/${featured.slug}` : "/projects";
  const featureImage = featured ? getProjectCoverImage(featured) : null;
  const facts = [
    { value: projectCount, label: "Published projects", icon: FlaskConical },
    { value: programCount, label: "Strategic programmes", icon: CalendarDays },
    { value: centerCount, label: "Research centres", icon: Building2 },
  ];

  return (
    <section className="relative overflow-hidden border-b border-primary/10 bg-white/[0.78] px-4 py-8 backdrop-blur-[2px] sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
      <div aria-hidden className="absolute inset-0 research-surface-grid opacity-40" />
      <div className="relative mx-auto max-w-[1680px]">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-2xl border border-primary/15 bg-white/75 shadow-[0_22px_60px_-46px_hsl(var(--primary)/0.65)] lg:grid-cols-[1.12fr_0.88fr]">
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-[390px]">
            <ResearchImage src={featureImage} fallback="/institutional-research-images/KSUInnovationWeek2025,April7,2026-8210.jpg" alt={featured?.title ?? "Kisii University research in action"} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition duration-700 hover:scale-[1.02]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--brand-overlay)/0.75)] via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 border-l-4 border-secondary bg-white/90 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-foreground backdrop-blur">Featured research</p>
          </div>
          <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-9">
            <span aria-hidden className="absolute left-0 top-10 hidden h-20 w-1 bg-secondary lg:block" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Inside the portfolio</p>
            <h2 className="mt-4 text-balance font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">{featured?.title ?? "Research grounded in regional priorities and global questions"}</h2>
            <p className="mt-5 line-clamp-4 text-sm leading-7 text-muted-foreground sm:text-base">{featured?.summary ?? "Discover multidisciplinary research connecting knowledge, innovation, policy, and community experience to produce useful evidence and lasting public value."}</p>
            {featured ? <div className="mt-5 flex flex-wrap gap-2"><Badge>{formatLabel(featured.project_type ?? "research")}</Badge><Badge>{formatLabel(featured.status ?? "ongoing")}</Badge></div> : null}
            <Link href={featureHref} className="mt-6 inline-flex w-fit items-center gap-2 border-b-2 border-secondary pb-1 text-sm font-bold text-primary transition hover:gap-3">Read the research story <ArrowUpRight aria-hidden className="h-4 w-4" /></Link>

            <dl className="mt-7 grid overflow-hidden rounded-xl border border-primary/[0.12] bg-primary/[0.025] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {facts.map(({ value, label, icon: Icon }, index) => (
                <div key={label} className={`flex items-center gap-3 px-3 py-3 ${index ? "border-t border-primary/10 sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t xl:border-l xl:border-t-0" : ""}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-primary"><Icon aria-hidden className="h-5 w-5" /></span>
                  <div><dt className="text-[0.62rem] font-bold uppercase leading-4 tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 font-display text-xl font-semibold leading-none text-foreground">{value}</dd></div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectFilters({
  params,
  centers,
  programs,
  years,
  months,
  view,
}: {
  params: ProjectSearchParams;
  centers: ResearchGenericRecord[];
  programs: Array<Record<string, any>>;
  years: string[];
  months: Array<{ value: string; label: string }>;
  view: ProjectListView;
}) {
  return (
    <ProgramTableControls
      action="/projects"
      resetHref="/projects"
      searchValue={params.q}
      searchPlaceholder="Search projects by title, summary, code..."
      filterTitle="Filter projects"
      sortTitle="Sort projects"
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: projectTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: projectStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
        ...(programs.length > 0
          ? [{
              name: "program",
              label: "Programme",
              value: params.program,
              options: programs.map((program) => ({
                value: program.id ?? program.code ?? program.slug ?? program.name ?? program.title ?? "",
                label: program.name ?? program.title ?? program.code ?? "Published programme",
              })),
            }]
          : []),
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
      viewControls={<ProjectViewSwitch params={params} view={view} />}
    />
  );
}

function ProjectViewSwitch({
  params,
  view,
}: {
  params: ProjectSearchParams;
  view: ProjectListView;
}) {
  const options: Array<{ value: ProjectListView; label: string; icon: typeof Rows3 }> = [
    { value: "table", label: "Rows", icon: Rows3 },
    { value: "cards", label: "Cards", icon: LayoutGrid },
  ];

  return (
    <div className="col-span-3 inline-flex rounded-md border border-border bg-white p-1 sm:col-span-1">
        {options.map((option) => {
          const Icon = option.icon;
          const active = view === option.value;
          return (
            <Link
              key={option.value}
              href={getListingHref("/projects", params, { view: option.value, page: undefined })}
              className={
                active
                  ? "inline-flex h-9 items-center gap-2 rounded bg-primary px-3 text-xs font-semibold text-white"
                  : "inline-flex h-9 items-center gap-2 rounded px-3 text-xs font-semibold text-muted-foreground transition hover:bg-surface-subtle hover:text-primary"
              }
            >
              <Icon aria-hidden className="h-4 w-4" />
              {option.label}
            </Link>
          );
        })}
    </div>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function getProjectListView(value?: string): ProjectListView {
  return value === "cards" ? "cards" : "table";
}

function getProjectCoverImage(project: ResearchProject) {
  const cover = (project as ResearchProject & {
    cover_image?: {
      url?: string | null;
      public_url?: string | null;
      thumbnail_url?: string | null;
      file_url?: string | null;
    } | null;
  }).cover_image;

  return compactText(cover?.thumbnail_url) || compactText(cover?.public_url) || compactText(cover?.url) || compactText(cover?.file_url) || compactText(project.cover_image_url);
}
