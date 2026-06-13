import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import {
  Badge,
  FilledBadge,
  ResearchPageIntro,
  ResearchSection,
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
  getUpdates,
  getUpdatesFiltered,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research News",
  description: "Research news, updates, and articles.",
};

type NewsSearchParams = {
  q?: string;
  kind?: "updates" | "articles";
  newsType?: string;
  articleType?: string;
  category?: string;
  center?: string;
  project?: string;
  year?: string;
  sort?: string;
};

const newsTypes = ["news", "announcement", "press_release", "notice", "achievement"];
const articleTypes = ["article", "feature", "opinion", "case_study", "research_story"];

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<NewsSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "published_at";
  const order = sort === "title" ? "asc" : "desc";
  const [updates, articles, allUpdates, allArticles, centers, projects] = await Promise.all([
    params.kind === "articles"
      ? Promise.resolve({ data: [], error: null })
      : getUpdatesFiltered({
          search: params.q,
          newsType: params.newsType,
          category: params.category,
          centerId: params.center,
          projectId: params.project,
          year: params.year,
          sort,
          order,
        }),
    params.kind === "updates"
      ? Promise.resolve({ data: [], error: null })
      : getArticlesFiltered({
          search: params.q,
          articleType: params.articleType,
          category: params.category,
          centerId: params.center,
          projectId: params.project,
          year: params.year,
          sort,
          order,
        }),
    getUpdates(),
    getArticles(),
    getCenters(),
    getProjects(),
  ]);
  const categories = getCategories([...allUpdates.data, ...allArticles.data]);
  const years = getYears([...allUpdates.data, ...allArticles.data]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Learning / Events / Updates"
        title="Research news, updates, and feature articles."
        body="Follow public research announcements, stories, milestones, and explanatory articles from the Research Directorate and connected research units."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Learning / Events / Updates", href: "/training" },
          { label: "News" },
        ]}
      />

      <ResearchSection
        eyebrow="Research Desk"
        title="Browse updates and articles"
        body="The list is filtered through the Research content endpoints using public fields such as type, category, related center, project, year, and publication date."
        tone="white"
      >
        <NewsFilters
          params={params}
          categories={categories}
          years={years}
          centers={centers.data}
          projects={projects.data}
        />

        {[updates.error, articles.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {params.kind !== "articles" ? (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Updates
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Announcements and research notices
                </h2>
              </div>
              <Badge>{updates.data.length} published</Badge>
            </div>
            {updates.data.length > 0 ? (
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                {updates.data.map((record) => (
                  <UpdateRow key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <StatusMessage>No research updates match the current filters.</StatusMessage>
            )}
          </div>
        ) : null}

        {params.kind !== "updates" ? (
          <div className="mt-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Articles
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Feature stories and explainers
                </h2>
              </div>
              <Badge>{articles.data.length} published</Badge>
            </div>
            {articles.data.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-3">
                {articles.data.map((record) => (
                  <ArticleCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <StatusMessage>No research articles match the current filters.</StatusMessage>
            )}
          </div>
        ) : null}
      </ResearchSection>
    </main>
  );
}

function NewsFilters({
  params,
  categories,
  years,
  centers,
  projects,
}: {
  params: NewsSearchParams;
  categories: string[];
  years: string[];
  centers: ResearchGenericRecord[];
  projects: ResearchProject[];
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/news">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title, author, story, announcement"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Content</span>
          <select
            name="kind"
            defaultValue={params.kind ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Updates and articles</option>
            <option value="updates">Updates only</option>
            <option value="articles">Articles only</option>
          </select>
        </label>
        <SelectField name="newsType" label="Update type" value={params.newsType} options={newsTypes} />
        <SelectField name="articleType" label="Article type" value={params.articleType} options={articleTypes} />
        <SelectField name="category" label="Category" value={params.category} options={categories} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "published_at"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="published_at">Published date</option>
            <option value="created_at">Newest record</option>
            <option value="title">Title</option>
            <option value="view_count">Most viewed</option>
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
                {project.title ?? project.code ?? project.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/news"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function UpdateRow({ record }: { record: ResearchGenericRecord }) {
  const href = record.slug ? `/news/${record.slug}` : "/news";
  return (
    <article className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_220px]">
      <div className="rounded-md bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">Published</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          {formatDate(record.published_at) || "Not dated"}
        </p>
        {record.is_pinned ? <div className="mt-3"><FilledBadge>Pinned</FilledBadge></div> : null}
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(record.news_type ?? "news")}</Badge>
          {record.category ? <Badge>{formatLabel(record.category)}</Badge> : null}
        </div>
        <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
          <Link href={href} className="transition hover:text-primary">
            {record.title ?? "Research update"}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(record.summary) ||
            compactText(record.excerpt) ||
            "This update is published without a public summary."}
        </p>
      </div>
      <div className="space-y-3 text-sm">
        <Fact label="Author" value={compactText(record.author_name)} />
        <Fact label="Source" value={compactText(record.source)} />
      </div>
    </article>
  );
}

function ArticleCard({ record }: { record: ResearchGenericRecord }) {
  const href = record.slug ? `/news/${record.slug}` : "/news";
  return (
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      {compactText(record.cover_image_url) || compactText(record.photo_url) ? (
        <img
          src={compactText(record.cover_image_url) || compactText(record.photo_url)}
          alt=""
          className="aspect-[16/9] w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(record.article_type ?? "article")}</Badge>
          {record.reading_time_minutes ? <Badge>{record.reading_time_minutes} min read</Badge> : null}
        </div>
        <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
          <Link href={href} className="transition hover:text-primary">
            {record.title ?? "Research article"}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(record.summary) ||
            compactText(record.excerpt) ||
            "This article is published without a public summary."}
        </p>
        <div className="mt-auto grid gap-2 pt-5 text-sm sm:grid-cols-2">
          <Fact label="Published" value={formatDate(record.published_at)} />
          <Fact label="Author" value={compactText(record.author_name)} />
        </div>
      </div>
    </article>
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</p>
    </div>
  );
}

function getCategories(records: ResearchGenericRecord[]) {
  return Array.from(
    new Set(records.map((record) => compactText(record.category)).filter(Boolean)),
  ).sort();
}

function getYears(records: ResearchGenericRecord[]) {
  return Array.from(
    new Set(
      records
        .map((record) => compactText(record.published_at ?? record.created_at).slice(0, 4))
        .filter((year) => /^\d{4}$/.test(year)),
    ),
  ).sort((a, b) => Number(b) - Number(a));
}
