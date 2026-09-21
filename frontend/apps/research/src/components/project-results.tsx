"use client";

import Link from "next/link";
import { Badge, FilledBadge } from "./research-ui";
import { compactText, formatLabel } from "../lib/research-formatters";

export type ProjectResultDto = {
  id: string;
  title: string;
  slug: string;
  code?: string | null;
  project_type?: string | null;
  status?: string | null;
  is_featured?: boolean;
  summary?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  cover_image_url?: string | null;
  principal_investigator_name?: string | null;
  lead_researcher?: string | null;
  center_name?: string | null;
  cover_image?: {
    url?: string | null;
    public_url?: string | null;
    thumbnail_url?: string | null;
    file_url?: string | null;
  } | null;
};

type ProjectResultProps = {
  projects: ProjectResultDto[];
  view: "table" | "cards";
};

export function ProjectResults({ projects, view }: ProjectResultProps) {
  return (
    <div data-server-data-display="research-projects">
      {view === "cards" ? <ProjectCardGrid projects={projects} /> : <ProjectTable projects={projects} />}
    </div>
  );
}

function ProjectTable({ projects }: { projects: ProjectResultDto[] }) {
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
        {projects.map((project) => <ProjectRow key={project.id} project={project} />)}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectResultDto }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const lead = compactText(project.principal_investigator_name) || compactText(project.lead_researcher) || compactText(project.center_name) || "Kisii University";
  const startYear = compactText(project.start_date).slice(0, 4);
  const endYear = compactText(project.end_date).slice(0, 4);
  const period = [startYear, endYear].filter(Boolean).join("–") || "Current";

  return (
    <Link
      href={href}
      className="group grid gap-2 border-l-2 border-transparent px-4 py-3.5 transition hover:border-secondary hover:bg-primary/[0.025] xl:grid-cols-[minmax(250px,1.35fr)_130px_minmax(150px,.8fr)_110px_100px_minmax(180px,1fr)] xl:items-center xl:gap-4"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">{project.title}</h2>
        {project.code ? <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{project.code}</p> : null}
      </div>
      <div className="text-xs font-semibold text-primary">{project.project_type ? formatLabel(project.project_type) : "Research"}</div>
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

function ProjectCardGrid({ projects }: { projects: ProjectResultDto[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectResultDto }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const image = getProjectCoverImage(project);

  return (
    <Link href={href} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      {image ? (
        <div className="aspect-[4/3] bg-surface-muted bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--brand-overlay))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,hsl(var(--success)/0.42),transparent_28%),linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--success)))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" />
          <div className="absolute bottom-3 left-3 right-3 h-10 rounded-md border border-white/20 bg-white/10" />
        </div>
      )}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">{formatLabel(project.status ?? "ongoing")}</span>
          {project.is_featured ? <span className="rounded-md bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary">Featured</span> : null}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-foreground transition group-hover:text-primary sm:text-sm">{project.title}</h2>
        {project.summary ? <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{project.summary}</p> : null}
      </div>
    </Link>
  );
}

function getProjectCoverImage(project: ProjectResultDto) {
  const cover = project.cover_image;
  return compactText(cover?.thumbnail_url) || compactText(cover?.public_url) || compactText(cover?.url) || compactText(cover?.file_url) || compactText(project.cover_image_url);
}
