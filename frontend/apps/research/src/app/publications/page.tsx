import type { Metadata } from "next";
import type { ResearchPublication } from "@ksu/api-client";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ArrowRight } from "lucide-react";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { ResearchFilterForm } from "../../components/research-listing";
import { ResearchPortfolioHero, ResearchPortfolioQuickLinks } from "../../components/research-portfolio";
import { Badge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
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
import { PublicationDetailSheet } from "./publication-detail-sheet";

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
  page?: string;
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
  const years = getRecordYears(allPublications.data);
  const months = getRecordMonths(allPublications.data, params.year);
  const visiblePublications = filterRecordsByMonth(publications.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visiblePublications.length : publications.total) / publications.perPage,
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPortfolioHero
        eyebrow="Research publications"
        title="Publications"
        body="Browse peer-reviewed scholarship, reports, policy briefs, books, and public evidence from Kisii University research work."
        illustration="publications"
      />

      <section id="publication-catalogue" className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0">
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
              <div className="pt-1">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground">
                  Publication Catalogue
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Search, filter, sort, and inspect publication records without leaving the catalogue.
                </p>
              </div>
              <PublicationFilters
                params={params}
                years={years}
                months={months}
                centers={centers.data}
                projects={projects.data}
              />
            </div>

            {[publications.error, centers.error, projects.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-5">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}

            {visiblePublications.length > 0 ? (
              <>
                <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                  <div className="hidden grid-cols-[minmax(0,1fr)_160px_170px_150px] border-b border-border bg-surface-subtle px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
                    <span>Publication</span>
                    <span>Type</span>
                    <span>Access</span>
                    <span>Published</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {visiblePublications.map((publication) => (
                      <PublicationRow key={publication.id} publication={publication} />
                    ))}
                  </div>
                </div>
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={params.month ? visiblePublications.length : publications.total}
                  perPage={publications.perPage}
                  path="/publications"
                  params={params}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="mt-7">
                <StatusMessage>No publications match the current filters.</StatusMessage>
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <ResearchPortfolioQuickLinks
              links={[
                { label: "Projects", href: "/projects", body: "Trace evidence to active work" },
                { label: "Programs", href: "/programs", body: "Browse strategic umbrellas" },
                { label: "Outputs", href: "/outputs", body: "Datasets, tools, and briefs" },
                { label: "Resources & tools", href: "/resources-tools", body: "Access reusable research tools" },
              ]}
            />
            <aside className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">How to read publications</p>
              <div className="mt-3 divide-y divide-slate-200">
                {["Evidence", "Access", "Related work"].map((label, index) => (
                  <div key={label} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {index === 0
                          ? "Start with the abstract, venue, and year."
                          : index === 1
                            ? "Use DOI, PDF, or open access links where published."
                            : "Follow linked projects and centers for context."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
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

function PublicationRow({ publication }: { publication: ResearchPublication }) {
  const venue = [publication.journal_name, publication.publisher, publication.conference_name]
    .map(compactText)
    .filter(Boolean)
    .join(" / ");
  const published = formatDate(publication.publication_date) || getRecordTimelineLabel(publication);

  return (
    <PublicationDetailSheet publication={publication}>
      <button
        type="button"
        className="group grid w-full gap-3 px-4 py-3 text-left transition hover:bg-surface-subtle/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 lg:grid-cols-[minmax(0,1fr)_160px_170px_150px] lg:items-center"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-6 text-foreground group-hover:text-primary">
            {publication.title}
          </span>
          <span className="mt-1 line-clamp-1 block text-xs leading-5 text-muted-foreground">
            {[venue, compactText(publication.doi)].filter(Boolean).join(" · ") || compactText(publication.abstract)}
          </span>
        </span>
        <span className="flex flex-wrap gap-2">
          {publication.publication_type ? <Badge>{formatLabel(publication.publication_type)}</Badge> : null}
        </span>
        <span className="flex flex-wrap gap-2">
          {publication.access_type ? <Badge>{formatLabel(publication.access_type)}</Badge> : null}
          {publication.is_open_access ? (
            <span className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase text-primary">
              Open
            </span>
          ) : null}
        </span>
        <span className="flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
          {published || compactText(publication.year)}
          <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary" />
        </span>
      </button>
    </PublicationDetailSheet>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
