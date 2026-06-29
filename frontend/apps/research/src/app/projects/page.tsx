import type { Metadata } from "next";
import Link from "next/link";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
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
  getPrograms,
  getProjects,
} from "../../lib/research-public-data";
import type { ResearchProject } from "@ksu/api-client";
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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ProjectsMasthead
        resultCount={visibleProjects.length}
        publishedCount={allProjects.data.length}
        centersCount={centers.data.length}
        programsCount={programs.data.length}
      />

      <ResearchSection
        eyebrow="Project Registry"
        title="Projects"
        body="Search public projects and use the filter menu for years, months, active states, status, center, and programme."
        tone="white"
      >
        <ProjectFilters
          params={params}
          centers={centers.data}
          programs={programs.data}
          years={years}
          months={months}
        />

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
                <FeaturedProject project={featuredProject} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
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
      </ResearchSection>

    </main>
  );
}

function ProjectsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  programsCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  programsCount: number;
}) {
  const stats = [
    { label: "Project results", value: resultCount },
    { label: "Published projects", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Programmes", value: programsCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/projects" className="transition hover:text-primary">Research</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Projects</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Research Projects
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Research work across Kisii University
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Browse public projects by title, active state, status, programme, center, year, month, and current progress.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/programs">Explore programmes</PrimaryLink>
            <SecondaryLink href="/partners">Partner with research</SecondaryLink>
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

function ProjectFilters({
  params,
  centers,
  programs,
  years,
  months,
}: {
  params: ProjectSearchParams;
  centers: Array<Record<string, any>>;
  programs: Array<Record<string, any>>;
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ResearchFilterForm
      action="/projects"
      resetHref="/projects"
      searchValue={params.q}
      searchPlaceholder="Project title, summary, code"
      selects={[
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

function FeaturedProject({ project }: { project: ResearchProject }) {
  return (
    <Link
      href={project.slug ? `/projects/${project.slug}` : "/projects"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <ProjectRowContent project={project} featured />
    </Link>
  );
}

function ProjectRow({ project }: { project: ResearchProject }) {
  return (
    <ResearchRecordRow
      href={project.slug ? `/projects/${project.slug}` : "/projects"}
      title={project.title}
      description={
        compactText(project.summary) ||
        compactText(project.abstract) ||
        "Project summary has not been published yet."
      }
      badges={[project.project_type, project.status]}
      filledBadges={[project.is_featured ? "Featured" : null]}
      facts={[
        { label: "Timeline", value: getProjectTimelineLabel(project) },
        { label: "Progress", value: `${project.progress_percentage ?? 0}%` },
        { label: "Active", value: project.is_active === false ? "Inactive" : "Active" },
      ]}
    />
  );
}

function ProjectRowContent({ project, featured = false }: { project: ResearchProject; featured?: boolean }) {
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
          <dt className="text-xs font-semibold uppercase text-slate-500">Timeline</dt>
          <dd className="mt-1 font-semibold text-slate-950">{getProjectTimelineLabel(project)}</dd>
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
