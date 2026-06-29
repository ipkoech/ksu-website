import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Building2, FlaskConical, GraduationCap, Sprout } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm } from "../../components/research-listing";
import { ResearchFact } from "../../components/research-detail";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getPrograms,
  getProjects,
} from "../../lib/research-public-data";
import type { ResearchProject } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Projects",
  description: "Browse Kisii University research projects and active research work.",
};

type ProjectSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  center?: string;
  year?: string;
  sort?: string;
};

const projectTypes = ["basic", "applied", "action", "collaborative", "commissioned"];
const projectStatuses = ["proposal", "approved", "ongoing", "completed", "suspended", "cancelled"];
const sortOptions = [
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Start date", value: "start_date" },
  { label: "Progress", value: "progress_percentage" },
  { label: "Title", value: "title" },
];

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<ProjectSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const [projects, allProjects, centers, programs] = await Promise.all([
    getProjects(
      {
        search: params.q,
        projectType: params.type,
        status: params.status,
        centerId: params.center,
        year: params.year,
        sort: params.sort || "created_at",
        order: params.sort === "title" ? "asc" : "desc",
      },
      page,
    ),
    getProjects(),
    getCenters(),
    getPrograms(),
  ]);
  const totalPages = Math.ceil(projects.total / projects.perPage);
  const years = getProjectYears(allProjects.data);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Discovery"
        title="Research work across Kisii University."
        body="Browse public research projects by year, type, status, center, and current progress."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Discovery", href: "/projects" },
          { label: "Projects" },
        ]}
        imageSrc="/images/research/research-home-hero.svg"
        imageAlt="Researchers collaborating across laboratory, field, and data work"
        links={discoveryLinks}
        primaryAction={{ label: "Browse programs", href: "/programs" }}
        stats={[
          { label: "Project results", value: projects.data.length },
          { label: "Published projects", value: allProjects.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Programs", value: programs.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Project Registry"
        title="Projects"
        body="Use the filters to narrow the project catalogue by topic, status, year, and center."
        tone="white"
      >
        <ProjectFilters
          params={params}
          centers={centers.data}
          years={years}
        />

        {[projects.error, centers.error, programs.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {projects.data.length > 0 ? (
          <>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.data.map((project) => (
                <ProjectCard key={project.id} project={project} />
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

      <ResearchSection
        eyebrow="Research Pathways"
        title="Programs and centers connected to project work"
        body="Programs and centers provide the public architecture behind project discovery."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RelationshipPanel
            title="Programs"
            href="/programs"
            records={programs.data}
            empty="No research programs are currently published."
          />
          <RelationshipPanel
            title="Centers"
            href="/centers"
            records={centers.data}
            empty="No research centers are currently published."
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function ProjectFilters({
  params,
  centers,
  years,
}: {
  params: ProjectSearchParams;
  centers: Array<Record<string, any>>;
  years: string[];
}) {
  return (
    <ResearchFilterForm
      action="/projects"
      resetHref="/projects"
      searchValue={params.q}
      searchPlaceholder="Project title, summary, code"
      selects={[
        { name: "type", label: "Type", value: params.type, options: projectTypes },
        { name: "status", label: "Status", value: params.status, options: projectStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function ProjectCard({ project }: { project: ResearchProject }) {
  const href = project.slug ? `/projects/${project.slug}` : undefined;
  const dateRange = [formatDate(project.start_date), formatDate(project.end_date)]
    .filter(Boolean)
    .join(" - ");

  const content = (
    <>
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
        <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {project.title}
      </h2>
      {compactText(project.summary) ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(project.summary)}
        </p>
      ) : null}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <ResearchFact label="Progress" value={`${project.progress_percentage ?? 0}%`} />
        <ResearchFact label="Timeline" value={dateRange || formatDate(project.updated_at)} />
      </dl>
      <span className="mt-5 inline-flex text-sm font-semibold text-primary">
        View project
      </span>
    </>
  );

  return href ? (
    <Link
      href={href}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

function RelationshipPanel({
  title,
  href,
  records,
  empty,
}: {
  title: string;
  href: string;
  records: Array<Record<string, any>>;
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          View all
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-slate-950">
              {record.slug ? (
                <Link href={`${href}/${record.slug}`} className="transition hover:text-primary">
                  {record.name ?? record.title}
                </Link>
              ) : (
                record.name ?? record.title
              )}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {compactText(record.summary) ||
                compactText(record.about) ||
                compactText(record.description) ||
                "Relationship details are available when published by the research office."}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">{empty}</p>
        ) : null}
      </div>
    </section>
  );
}

function getProjectYears(projects: ResearchProject[]) {
  const years = projects
    .flatMap((project) => [project.start_date, project.end_date, project.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
