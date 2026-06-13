import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpenCheck, Database, FlaskConical } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
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
  getProjects,
  getPublications,
  getPublicationsFiltered,
} from "../../lib/research-public-data";
import type { ResearchPublication } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publications",
  description: "Browse Kisii University research publications and scholarly outputs.",
};

type PublicationSearchParams = {
  q?: string;
  type?: string;
  access?: string;
  center?: string;
  project?: string;
  year?: string;
  sort?: string;
};

const publicationTypes = [
  "journal_article",
  "conference_paper",
  "book",
  "book_chapter",
  "report",
  "thesis",
  "policy_brief",
];
const accessTypes = ["open", "restricted", "subscription", "embargoed"];

const outputLinks = [
  {
    label: "Publications",
    href: "/publications",
    description: "Articles, books, conference papers, reports, and policy briefs.",
    icon: BookOpenCheck,
  },
  {
    label: "Outputs",
    href: "/outputs",
    description: "Datasets, software, toolkits, prototypes, and deliverables.",
    icon: Database,
  },
  {
    label: "Impact Metrics",
    href: "/impact-metrics",
    description: "Public outcomes, reach, and performance indicators.",
    icon: BarChart3,
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Trace outputs back to the work that produced them.",
    icon: FlaskConical,
  },
];

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: Promise<PublicationSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [publications, allPublications, centers, projects] = await Promise.all([
    getPublicationsFiltered({
      search: params.q,
      publicationType: params.type,
      accessType: params.access,
      centerId: params.center,
      projectId: params.project,
      year: params.year,
      sort: params.sort || "publication_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getPublications(),
    getCenters(),
    getProjects(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Publications & Outputs"
        title="Scholarly publications and public research evidence."
        body="Find journal articles, conference papers, reports, books, policy briefs, and open access records."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Publications & Outputs", href: "/publications" },
          { label: "Publications" },
        ]}
        imageSrc="/images/research/research-hero-imagegen.png"
        imageAlt="Research publications, reports, datasets, and scholarly evidence"
        links={outputLinks}
        primaryAction={{ label: "View outputs", href: "/outputs" }}
        stats={[
          { label: "Publication results", value: publications.data.length },
          { label: "Published publications", value: allPublications.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Projects", value: projects.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Research Library"
        title="Publications"
        body="Publication records are served by the Research API with type, year, access, journal, DOI, project, and center metadata."
        tone="white"
      >
        <PublicationFilters
          params={params}
          years={getPublicationYears(allPublications.data)}
          centers={centers.data}
          projects={projects.data}
        />

        {[publications.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {publications.data.length > 0 ? (
          <div className="mt-7 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
            {publications.data.map((publication) => (
              <PublicationRow key={publication.id} publication={publication} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No publications match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function PublicationFilters({
  params,
  years,
  centers,
  projects,
}: {
  params: PublicationSearchParams;
  years: string[];
  centers: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/publications">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title, journal, DOI, abstract"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={publicationTypes} />
        <SelectField name="access" label="Access" value={params.access} options={accessTypes} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "publication_date"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="publication_date">Publication date</option>
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="created_at">Newest</option>
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Center</span>
          <select
            name="center"
            defaultValue={params.center ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name ?? center.title ?? center.code ?? center.id}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Project</span>
          <select
            name="project"
            defaultValue={params.project ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title ?? project.name ?? project.code ?? project.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/publications"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function PublicationRow({ publication }: { publication: ResearchPublication }) {
  return (
    <article className="grid gap-4 p-5 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(publication.publication_type ?? "publication")}</Badge>
          {publication.access_type ? <Badge>{formatLabel(publication.access_type)}</Badge> : null}
          {publication.is_open_access ? <FilledBadge>Open access</FilledBadge> : null}
        </div>
        <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
          <Link
            href={publication.slug ? `/publications/${publication.slug}` : "/publications"}
            className="transition hover:text-primary"
          >
            {publication.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(publication.abstract) ||
            [publication.journal_name, publication.publisher, publication.conference_name]
              .map(compactText)
              .filter(Boolean)
              .join(" · ") ||
            "Publication abstract is not published yet."}
        </p>
      </div>
      <dl className="grid gap-3 text-sm">
        <Fact label="Published in" value={publication.journal_name || publication.publisher || publication.conference_name || ""} />
        <Fact label="Year" value={compactText(publication.year)} />
        <Fact label="Date" value={formatDate(publication.publication_date)} />
        <Fact label="DOI" value={compactText(publication.doi)} />
      </dl>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">
        {value || "Not published"}
      </dd>
    </div>
  );
}

function getPublicationYears(publications: ResearchPublication[]) {
  const years = publications
    .map((publication) => publication.year ?? (publication.publication_date ? new Date(publication.publication_date).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
