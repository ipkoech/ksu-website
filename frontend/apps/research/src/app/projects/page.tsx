import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
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
  getPrograms,
  getProjects,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import {
  filterProjectsByMonth,
  getProjectMonths,
  getProjectTimelineLabel,
  getProjectYears,
} from "./project-page-model";

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
};

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
  const sort = params.sort || "created_at";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [projects, allProjects, centers, programs] = await Promise.all([
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
        ...activeFlags,
      },
      page,
    ),
    getProjects(),
    getCenters(),
    getPrograms(),
  ]);
  const years = getProjectYears(allProjects.data);
  const months = getProjectMonths(allProjects.data, params.year);
  const visibleProjects = filterProjectsByMonth(projects.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visibleProjects.length : projects.total) / projects.perPage,
  );
  const featuredProject = visibleProjects.find((project) => project.is_featured);
  const rowProjects = featuredProject
    ? visibleProjects.filter((project) => project.id !== featuredProject.id)
    : visibleProjects;
  const centerNames = new Map(centers.data.map((center) => [center.id, center.name ?? center.title ?? center.code ?? ""]));
  const programNames = new Map(programs.data.map((program) => [program.id, program.name ?? program.title ?? program.code ?? ""]));

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResearchPortfolioHero
        eyebrow="Published project portfolio"
        title="Research Projects"
        body="Active research workstreams delivering evidence, outputs, field activity, and public value across Kisii University priority areas."
        primary={{ label: "Explore projects", href: "#project-portfolio" }}
        secondary={{ label: "View programmes", href: "/programs" }}
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
          />
        }
      >
        {[projects.error, centers.error, programs.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleProjects.length > 0 ? (
          <>
            {featuredProject ? (
              <div className="mt-6">
                <FeaturedProject
                  project={featuredProject}
                  centerName={centerNames.get(featuredProject.center_id ?? "")}
                  programName={programNames.get(featuredProject.program_id ?? "")}
                />
              </div>
            ) : null}
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(360px,1fr)_170px_150px_140px_130px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Project</span>
                <span>Program / Center</span>
                <span>Status</span>
                <span>Timeline</span>
                <span>Progress</span>
              </div>
              <div className="divide-y divide-slate-200">
              {rowProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  centerName={centerNames.get(project.center_id ?? "")}
                  programName={programNames.get(project.program_id ?? "")}
                />
              ))}
              </div>
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={projects.total}
              perPage={projects.perPage}
              baseHref="/projects"
            />
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
}: {
  params: ProjectSearchParams;
  centers: ResearchGenericRecord[];
  programs: Array<Record<string, any>>;
  years: string[];
  months: Array<{ value: string; label: string }>;
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
    />
  );
}

function FeaturedProject({
  project,
  centerName,
  programName,
}: {
  project: ResearchProject;
  centerName?: string;
  programName?: string;
}) {
  return (
    <Link
      href={project.slug ? `/projects/${project.slug}` : "/projects"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <ProjectRowContent project={project} centerName={centerName} programName={programName} featured />
    </Link>
  );
}

function ProjectRow({
  project,
  centerName,
  programName,
}: {
  project: ResearchProject;
  centerName?: string;
  programName?: string;
}) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const summary = compactText(project.summary) || compactText(project.abstract);
  const timeline = getProjectTimelineLabel(project);
  return (
    <Link
      href={href}
      className="group grid gap-3 px-4 py-4 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:grid-cols-[minmax(360px,1fr)_170px_150px_140px_130px] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
          <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
          {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-2 flex items-start gap-2 text-base font-semibold leading-6 text-slate-950">
          <span className="transition group-hover:text-primary">{project.title}</span>
          <ExternalLink aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
        </h2>
        {summary ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p> : null}
      </div>
      <div className="text-sm text-slate-600 lg:block">{programName || centerName || "-"}</div>
      <div className="text-sm font-medium text-slate-700 lg:block">{formatLabel(project.status ?? "ongoing")}</div>
      <div className="text-sm text-slate-600 lg:block">{timeline || "-"}</div>
      <div className="text-sm text-slate-600 lg:block">{project.progress_percentage ?? 0}%</div>
    </Link>
  );
}

function ProjectRowContent({
  project,
  centerName,
  programName,
  featured = false,
}: {
  project: ResearchProject;
  centerName?: string;
  programName?: string;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
          <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
          {featured || project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {project.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {compactText(project.summary) ||
            compactText(project.abstract) ||
            "Project summary has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Program / Center</dt>
          <dd className="mt-1 font-semibold text-slate-950">{programName || centerName || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Progress</dt>
          <dd className="mt-1 font-semibold text-slate-950">{project.progress_percentage ?? 0}%</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View project story
      </span>
    </>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
