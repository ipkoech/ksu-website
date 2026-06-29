import type { Metadata } from "next";
import Link from "next/link";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  getCenters,
  getProjects,
  getPublications,
  getPublicationsFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordTimelineLabel,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

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
  active?: string;
  year?: string;
  month?: string;
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
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "publication_date", label: "Publication date" },
  { value: "year", label: "Year" },
  { value: "created_at", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: Promise<PublicationSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const sort = params.sort || "publication_date";
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [publications, allPublications, centers, projects] = await Promise.all([
    getPublicationsFiltered(
      {
        search: params.q,
        publicationType: params.type,
        accessType: params.access,
        centerId: params.center,
        projectId: params.project,
        year: params.year,
        sort,
        order,
        ...activeFlags,
      },
      page,
    ),
    getPublications(),
    getCenters(),
    getProjects(),
  ]);
  const totalPages = Math.ceil(publications.total / publications.perPage);
  const years = getRecordYears(allPublications.data);
  const months = getRecordMonths(allPublications.data, params.year);
  const visiblePublications = filterRecordsByMonth(publications.data, params.year, params.month);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <PublicationsMasthead
        resultCount={visiblePublications.length}
        publishedCount={allPublications.data.length}
        centersCount={centers.data.length}
        projectsCount={projects.data.length}
      />

      <ResearchSection
        eyebrow="Research Library"
        title="Publications"
        body="Search first, then use the filter menu for type, access, active state, year, month, project, center, and sort order."
        tone="white"
      >
        <PublicationFilters
          params={params}
          years={years}
          months={months}
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

        {visiblePublications.length > 0 ? (
          <>
            <div className="mt-7 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {visiblePublications.map((publication) => (
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
                    { label: "Date", value: formatDate(publication.publication_date) || getRecordTimelineLabel(publication) },
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

function PublicationsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  projectsCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  projectsCount: number;
}) {
  const stats = [
    { label: "Publication results", value: resultCount },
    { label: "Published publications", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Projects", value: projectsCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Publications</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Publications & Outputs</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Scholarly publications, reports, policy briefs, books, and public research evidence</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse publication records by type, access, DOI, journal, project, center, and publication window.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/outputs">View outputs</PrimaryLink>
            <SecondaryLink href="/projects">Trace to projects</SecondaryLink>
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

function PublicationFilters({
  params,
  years,
  months,
  centers,
  projects,
}: {
  params: PublicationSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
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
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
