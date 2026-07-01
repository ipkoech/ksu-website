import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, Rows3 } from "lucide-react";
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
  getProjectFilterRecords,
  getPrograms,
  getProjects,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import {
  filterProjectsByMonth,
  getProjectMonths,
  getProjectYears,
} from "./project-page-model";
import { getListPageSize } from "../../lib/research-page-model";

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
const quickLinks = [
  { label: "Programs", href: "/programs", body: "Strategic research umbrellas" },
  { label: "Centers", href: "/centers", body: "Institutional research anchors" },
  { label: "Publications", href: "/publications", body: "Scholarly evidence" },
  { label: "Outputs", href: "/outputs", body: "Data, tools, and reports" },
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
  const [projects, projectFilterRecords, centers, programs] = await Promise.all([
    getProjects(
      {
        search: params.q,
        projectType: params.type,
        status: params.status,
        centerId: params.center,
        programId: params.program,
        year: params.year,
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
  ]);
  const years = getProjectYears(projectFilterRecords.data);
  const months = getProjectMonths(projectFilterRecords.data, params.year);
  const monthProjectIds = params.month
    ? new Set(
        filterProjectsByMonth(projectFilterRecords.data, params.year, params.month)
          .map((project) => project.id)
          .filter(Boolean),
      )
    : null;
  const visibleProjects = monthProjectIds
    ? projects.data.filter((project) => monthProjectIds.has(project.id))
    : projects.data;
  const totalPages = Math.ceil(
    (params.month ? visibleProjects.length : projects.total) / projects.perPage,
  );

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResearchPortfolioHero
        eyebrow="Published project portfolio"
        title="Research Projects"
        body="Active research workstreams delivering evidence, outputs, field activity, and public value across Kisii University priority areas."
        primary={{ label: "Explore projects", href: "#project-portfolio" }}
        secondary={{ label: "View programmes", href: "/programs" }}
        illustration="projects"
      />

      <ResearchPortfolioShell
        id="project-portfolio"
        title="Project Portfolio"
        body="Search, filter, sort, and open published research project stories."
        quickLinks={quickLinks}
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
              total={params.month ? visibleProjects.length : projects.total}
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

    </main>
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
    <div className="col-span-3 inline-flex rounded-md border border-slate-200 bg-white p-1 sm:col-span-1">
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
                  : "inline-flex h-9 items-center gap-2 rounded px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-primary"
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
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
        <span>Project</span>
        <span>Type</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-slate-200">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: ResearchProject }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  return (
    <Link
      href={href}
      className="group grid gap-2 px-4 py-3 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-slate-950 transition group-hover:text-primary">
          {project.title}
        </h2>
        {project.code ? (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{project.code}</p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-slate-600 md:text-sm">
        {project.project_type ? formatLabel(project.project_type) : "Research"}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
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
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {image ? (
        <div
          className="aspect-[4/3] bg-slate-100 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-[#071b34]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(16,185,129,0.42),transparent_28%),linear-gradient(135deg,#071b34,#0f766e)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" />
          <div className="absolute bottom-3 left-3 right-3 h-10 rounded-md border border-white/20 bg-white/10" />
        </div>
      )}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {formatLabel(project.status ?? "ongoing")}
          </span>
          {project.is_featured ? (
            <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary">
              Featured
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-slate-950 transition group-hover:text-primary sm:text-sm">
          {project.title}
        </h2>
        {project.summary ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
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
