import type { Metadata } from "next";
import { BarChart3, BookOpenCheck, Database, FlaskConical } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
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
  const page = pageFromSearchParams(params);
  const [publications, allPublications, centers, projects] = await Promise.all([
    getPublicationsFiltered(
      {
        search: params.q,
        publicationType: params.type,
        accessType: params.access,
        centerId: params.center,
        projectId: params.project,
        year: params.year,
        sort: params.sort || "publication_date",
        order: params.sort === "title" ? "asc" : "desc",
      },
      page,
    ),
    getPublications(),
    getCenters(),
    getProjects(),
  ]);
  const totalPages = Math.ceil(publications.total / publications.perPage);

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
        imageSrc="/images/research/research-home-hero.svg"
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
        body="Browse publications by type, year, access, journal, DOI, project, and center."
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
          <>
            <div className="mt-7 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {publications.data.map((publication) => (
                <ResearchRecordRow
                  key={publication.id}
                  href={publication.slug ? `/publications/${publication.slug}` : "/publications"}
                  title={publication.title}
                  description={
                    compactText(publication.abstract) ||
                    [publication.journal_name, publication.publisher, publication.conference_name]
                      .map(compactText)
                      .filter(Boolean)
                      .join(" · ") ||
                    "Publication abstract is not published yet."
                  }
                  badges={[publication.publication_type, publication.access_type]}
                  filledBadges={[publication.is_open_access ? "Open access" : null]}
                  facts={[
                    { label: "Published in", value: publication.journal_name || publication.publisher || publication.conference_name || "" },
                    { label: "Year", value: compactText(publication.year) },
                    { label: "Date", value: formatDate(publication.publication_date) },
                    { label: "DOI", value: compactText(publication.doi) },
                  ]}
                />
              ))}
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={publications.total}
              perPage={publications.perPage}
              baseHref="/publications"
            />
          </>
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
    <ResearchFilterForm
      action="/publications"
      resetHref="/publications"
      searchValue={params.q}
      searchPlaceholder="Title, journal, DOI, abstract"
      selects={[
        { name: "type", label: "Type", value: params.type, options: publicationTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={[
        { value: "publication_date", label: "Publication date" },
        { value: "year", label: "Year" },
        { value: "title", label: "Title" },
        { value: "created_at", label: "Newest" },
      ]}
    />
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
