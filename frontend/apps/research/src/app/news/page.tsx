import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
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
const passthroughImageLoader = ({ src }: { src: string }) => src;

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

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
      <ResearchClusterHero
        eyebrow="Learning / Events / Updates"
        title="Research news, updates, and feature articles."
        body="Follow public research announcements, stories, milestones, and explanatory articles from the Research Directorate and connected research units."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Learning / Events / Updates", href: "/training" },
          { label: "News" },
        ]}
        imageSrc="/images/research/research-hero-imagegen.webp"
        imageAlt="Research news desk with updates, stories, and event coverage"
        links={learningLinks}
        primaryAction={{ label: "View events", href: "/events" }}
        stats={[
          { label: "Update results", value: updates.data.length },
          { label: "Article results", value: articles.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Projects", value: projects.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Research Desk"
        title="Browse updates and articles"
        body="Browse updates by type, category, related center, project, year, and publication date."
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
    <ResearchFilterForm
      action="/news"
      resetHref="/news"
      searchValue={params.q}
      searchPlaceholder="Title, author, story, announcement"
      selects={[
        { name: "kind", label: "Content", value: params.kind, options: ["updates", "articles"] },
        { name: "newsType", label: "Update type", value: params.newsType, options: newsTypes },
        { name: "articleType", label: "Article type", value: params.articleType, options: articleTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={[
        { value: "published_at", label: "Published date" },
        { value: "created_at", label: "Newest record" },
        { value: "title", label: "Title" },
        { value: "view_count", label: "Most viewed" },
      ]}
    />
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
      <div className="flex flex-col gap-3 text-sm">
        <ResearchFact label="Author" value={compactText(record.author_name)} />
        <ResearchFact label="Source" value={compactText(record.source)} />
      </div>
    </article>
  );
}

function ArticleCard({ record }: { record: ResearchGenericRecord }) {
  const href = record.slug ? `/news/${record.slug}` : "/news";
  const imageUrl = compactText(record.cover_image_url) || compactText(record.photo_url);
  return (
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      {imageUrl ? (
        <Image
          loader={passthroughImageLoader}
          unoptimized
          src={imageUrl}
          alt=""
          width={1200}
          height={675}
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
          <ResearchFact label="Published" value={formatDate(record.published_at)} />
          <ResearchFact label="Author" value={compactText(record.author_name)} />
        </div>
      </div>
    </article>
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
