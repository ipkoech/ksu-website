import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";
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
  formatDate,
  formatLabel,
  getArticles,
  getArticlesFiltered,
  getCenters,
  getProjects,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research News",
  description: "Research news, updates, and articles.",
};

type NewsSearchParams = {
  q?: string;
  articleType?: string;
  category?: string;
  status?: string;
  active?: string;
  center?: string;
  project?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
};

const articleTypes = ["article", "feature", "opinion", "case_study", "research_story"];
const articleStatuses = ["published", "draft", "archived"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "published_at", label: "Published date" },
  { value: "created_at", label: "Newest record" },
  { value: "updated_at", label: "Recently updated" },
  { value: "view_count", label: "Most viewed" },
  { value: "title", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<NewsSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const sort = params.sort || "published_at";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [articles, allArticles, centers, projects] = await Promise.all([
    getArticlesFiltered(
      {
        search: params.q,
        articleType: params.articleType,
        category: params.category,
        status: params.status,
        centerId: params.center,
        projectId: params.project,
        year: params.year,
        sort: sortField,
        order,
        ...activeFlags,
      },
      page,
    ),
    getArticles(),
    getCenters(),
    getProjects(),
  ]);
  const categories = getCategories([...allArticles.data]);
  const years = getRecordYears(allArticles.data);
  const months = getRecordMonths(allArticles.data, params.year);
  const visibleArticles = filterRecordsByMonth(articles.data, params.year, params.month);
  const featuredArticle = visibleArticles.find((record) => record.is_featured);
  const rowArticles = featuredArticle
    ? visibleArticles.filter((record) => record.id !== featuredArticle.id)
    : visibleArticles;
  const totalPages = Math.ceil(
    (params.month ? visibleArticles.length : articles.total) / articles.perPage,
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <NewsMasthead
        resultCount={visibleArticles.length}
        publishedCount={allArticles.data.length}
        centersCount={centers.data.length}
        projectsCount={projects.data.length}
      />

      <ResearchSection
        eyebrow="Research Desk"
        title="News, updates, and feature articles"
        body="Search public research updates and use the filter menu for type, category, status, active state, center, project, year, month, and sort order."
        tone="white"
      >
        <NewsFilters
          params={params}
          categories={categories}
          years={years}
          months={months}
          centers={centers.data}
          projects={projects.data}
        />

        {[articles.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleArticles.length > 0 ? (
          <>
            {featuredArticle ? (
              <div className="mt-6">
                <FeaturedArticle record={featuredArticle} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowArticles.map((record) => (
                <ArticleRow key={record.id} record={record} />
              ))}
            </div>
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleArticles.length : articles.total}
              perPage={articles.perPage}
              path="/news"
              params={params}
            />
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published research articles match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function NewsMasthead({
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
    { label: "Article results", value: resultCount },
    { label: "Published articles", value: publishedCount },
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
            <Link href="/training" className="transition hover:text-primary">Learning</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">News</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Learning / Events / Updates
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Research news, updates, and feature articles
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Follow public research announcements, stories, milestones, and explanatory articles from published records.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/events">View events</PrimaryLink>
            <SecondaryLink href="/community-impact">Impact stories</SecondaryLink>
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

function NewsFilters({
  params,
  categories,
  years,
  months,
  centers,
  projects,
}: {
  params: NewsSearchParams;
  categories: string[];
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
  projects: ResearchProject[];
}) {
  return (
    <ResearchFilterForm
      action="/news"
      resetHref="/news"
      searchValue={params.q}
      searchPlaceholder="Title, author, story, announcement"
      selects={[
        { name: "articleType", label: "Article type", value: params.articleType, options: articleTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: articleStatuses },
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

function FeaturedArticle({ record }: { record: ResearchGenericRecord }) {
  return (
    <Link
      href={record.slug ? `/news/${record.slug}` : "/news"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <ArticleRowContent record={record} featured />
    </Link>
  );
}

function ArticleRow({ record }: { record: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={record.slug ? `/news/${record.slug}` : "/news"}
      title={getRecordTitle(record, "Research article")}
      description={
        getRecordSummary(record) ||
        compactText(record.excerpt) ||
        "This article is published without a public summary."
      }
      badges={[record.article_type ?? record.news_type, record.category, record.status]}
      filledBadges={[record.is_featured ? "Featured" : null]}
      facts={[
        { label: "Published", value: formatDate(record.published_at) },
        { label: "Author", value: compactText(record.author_name) },
        { label: "Reading", value: record.reading_time_minutes ? `${record.reading_time_minutes} min` : "" },
      ]}
    />
  );
}

function ArticleRowContent({
  record,
  featured = false,
}: {
  record: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(record.article_type ?? record.news_type) || "article")}</Badge>
          {record.reading_time_minutes ? <Badge>{record.reading_time_minutes} min read</Badge> : null}
          {featured || record.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(record, "Research article")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(record) ||
            compactText(record.excerpt) ||
            "This article is published without a public summary."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Published</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(record.published_at) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Author</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(record.author_name) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        Read update
      </span>
    </>
  );
}

function getCategories(records: ResearchGenericRecord[]) {
  return Array.from(
    new Set(records.map((record) => compactText(record.category)).filter(Boolean)),
  ).sort();
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
