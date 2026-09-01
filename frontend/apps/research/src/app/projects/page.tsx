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
  FilledBadge,
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
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import {
  getProjectMonths,
  getProjectYears,
} from "./project-page-model";
import { getListPageSize } from "../../lib/research-page-model";
import { ResearchImage } from "../../components/research-image";
import { ResearchDiscoveryInteractive } from "../../components/research-discovery-interactive";
import { ResearchBackground } from "../../components/research-background";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Projects",
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
        title="Ideas tested. Evidence created. Communities changed."
        body="Explore the questions Kisii University researchers are pursuing and the practical outcomes emerging from laboratories, field sites, communities, and partnerships."
        illustration="projects"
        imageSrc="/institutional-research-images/research-header.jpg"
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
          <>
            {view === "cards" ? (
              <ProjectCardGrid projects={visibleProjects} />
            ) : (
              <ProjectTable projects={visibleProjects} />
            )}
          </>
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

function ProjectTable({ projects }: { projects: ResearchProject[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-primary/15 bg-white/75 shadow-[0_16px_45px_-42px_hsl(var(--primary)/0.6)]">
      <div className="hidden grid-cols-[minmax(250px,1.35fr)_130px_minmax(150px,.8fr)_110px_100px_minmax(180px,1fr)] gap-4 border-b border-primary/10 bg-primary/[0.035] px-4 py-3 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground xl:grid">
        <span>Project</span>
        <span>Theme</span>
        <span>Lead / Centre</span>
        <span>Status</span>
        <span>Period</span>
        <span>Impact snapshot</span>
      </div>
      <div className="divide-y divide-border">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: ResearchProject }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const record = project as ResearchProject & Record<string, unknown>;
  const lead = compactText(String(record.principal_investigator_name ?? "")) || compactText(String(record.lead_researcher ?? "")) || compactText(String(record.center_name ?? "")) || "Kisii University";
  const startYear = compactText(String(record.start_date ?? "")).slice(0, 4);
  const endYear = compactText(String(record.end_date ?? "")).slice(0, 4);
  const period = [startYear, endYear].filter(Boolean).join("–") || "Current";
  return (
    <Link
      href={href}
      className="group grid gap-2 border-l-2 border-transparent px-4 py-3.5 transition hover:border-secondary hover:bg-primary/[0.025] xl:grid-cols-[minmax(250px,1.35fr)_130px_minmax(150px,.8fr)_110px_100px_minmax(180px,1fr)] xl:items-center xl:gap-4"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">
          {project.title}
        </h2>
        {project.code ? (
          <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{project.code}</p>
        ) : null}
      </div>
      <div className="text-xs font-semibold text-primary">
        {project.project_type ? formatLabel(project.project_type) : "Research"}
      </div>
      <p className="truncate text-xs leading-5 text-muted-foreground">{lead}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <p className="text-xs font-medium text-muted-foreground">{period}</p>
      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{compactText(project.summary) || "Research activity and outputs in progress."}</p>
    </Link>
  );
}

function ProjectCardGrid({ projects }: { projects: ResearchProject[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: ResearchProject }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const image = getProjectCoverImage(project);
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      {image ? (
        <div
          className="aspect-[4/3] bg-surface-muted bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--brand-overlay))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,hsl(var(--success)/0.42),transparent_28%),linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--success)))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" />
          <div className="absolute bottom-3 left-3 right-3 h-10 rounded-md border border-white/20 bg-white/10" />
        </div>
      )}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {formatLabel(project.status ?? "ongoing")}
          </span>
          {project.is_featured ? (
            <span className="rounded-md bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary">
              Featured
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-foreground transition group-hover:text-primary sm:text-sm">
          {project.title}
        </h2>
        {project.summary ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
            {project.summary}
          </p>
        ) : null}
      </div>
    </Link>
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

  return (
    compactText(cover?.thumbnail_url) ||
    compactText(cover?.public_url) ||
    compactText(cover?.url) ||
    compactText(cover?.file_url) ||
    compactText(project.cover_image_url)
  );
}
