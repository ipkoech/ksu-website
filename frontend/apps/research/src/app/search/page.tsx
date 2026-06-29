import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Grid2X2,
  HelpCircle,
  Info,
  Leaf,
  List,
  Mail,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { researchServiceApi } from "@ksu/api-client";
import {
  RESEARCH_SEARCH_GROUPS,
  SEARCH_TABS,
  buildBackendSearchResult,
  buildSearchResult,
  filterResultsByTab,
  getSelectedSearchGroups,
  pickTopMatch,
  popularSearches,
  relatedResearchAreas,
  sortSearchResults,
  suggestedSearches,
  type ResearchSearchGroup,
  type ResearchSearchResult,
  type SearchRecord,
  type SearchTabKey,
} from "./search-model";

export const metadata = {
  title: "Search | KSU Research",
  description:
    "Search public Kisii University research projects, publications, funding, innovations, partners, resources, news, and events.",
};

export const revalidate = 300;

const PER_GROUP = 8;

type SearchParams = {
  q?: string;
  type?: string | string[];
  tab?: string;
  sort?: string;
  status?: string;
  yearFrom?: string;
  yearTo?: string;
  center?: string;
  openAccess?: string;
  featured?: string;
  view?: string;
};

type SearchGroupResponse = {
  group: ResearchSearchGroup;
  results: ResearchSearchResult[];
  total: number;
  error: string | null;
};

export default async function ResearchSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedGroups = getSelectedSearchGroups(params.type);
  const activeTab = getActiveTab(params.tab);
  const sort = params.sort || "relevance";
  const view = params.view === "grid" ? "grid" : "list";

  const [groupResponses, centerOptions, relatedAreas] = await Promise.all([
    query ? runResearchSearch(query, selectedGroups) : Promise.resolve([]),
    loadCenterOptions(),
    loadRelatedAreas(),
  ]);

  const rawResults = groupResponses.flatMap((group) => group.results);
  const filteredResults = applyResultFilters(rawResults, params);
  const sortedResults = sortSearchResults(filteredResults, sort);
  const visibleResults = filterResultsByTab(sortedResults, activeTab);
  const topMatch = pickTopMatch(sortedResults);
  const total = filteredResults.length;
  const errors = groupResponses.map((group) => group.error).filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <SearchHero query={query} />

      {!query ? (
        <EmptySearchStart />
      ) : (
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <ResultsToolbar
              query={query}
              total={total}
              sort={sort}
              view={view}
              params={params}
            />

            {errors.length > 0 ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Some research result groups are temporarily unavailable. Showing
                the records that could be loaded.
              </div>
            ) : null}

            <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
              <SearchFilters
                params={params}
                counts={buildGroupCounts(groupResponses)}
                centers={centerOptions}
              />

              <section aria-label="Research search results" className="min-w-0">
                <ResultTabs
                  activeTab={activeTab}
                  results={filteredResults}
                  params={params}
                />

                {topMatch && activeTab === "all" ? (
                  <TopMatchCard query={query} result={topMatch} />
                ) : null}

                {visibleResults.length > 0 ? (
                  <div
                    className={
                      view === "grid"
                        ? "mt-5 grid gap-4 lg:grid-cols-2"
                        : "mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white"
                    }
                  >
                    {visibleResults.map((result) =>
                      view === "grid" ? (
                        <GridResultCard
                          key={`${result.groupKey}-${result.id}`}
                          query={query}
                          result={result}
                        />
                      ) : (
                        <ResultRow
                          key={`${result.groupKey}-${result.id}`}
                          query={query}
                          result={result}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <NoResults query={query} />
                )}

              </section>

              <SearchSupportRail
                relatedAreas={relatedAreas}
                params={params}
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function SearchHero({ query }: { query: string }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-[1920px] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
        <div className="flex min-h-[460px] flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <p className="text-sm font-semibold text-primary">Research Search</p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Find research records across Kisii University.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Search projects, publications, grants, innovations, partners,
            centers, facilities, outputs, resources, training, news, and events
            from the REIRM public portfolio.
          </p>

          <form action="/search" className="mt-7 max-w-3xl">
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search research records</span>
                <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search climate, agriculture, public health, innovation..."
                  autoComplete="off"
                  className="h-12 w-full rounded-md border border-transparent bg-white pl-12 pr-4 text-base text-slate-950 outline-none ring-primary/20 placeholder:text-slate-400 focus:border-primary focus:ring-4"
                />
              </label>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                Search
                <Search aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Suggested:</span>
            {suggestedSearches.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
              >
                {term}
              </Link>
            ))}
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
            <Info aria-hidden className="h-4 w-4 text-primary" />
            Research-only results from published public records.
          </p>
        </div>

        <div className="relative min-h-[320px] bg-slate-100 lg:min-h-[460px]">
          <div className="absolute inset-0 bg-[url('/images/research/research-demo-imagegen.webp')] bg-cover bg-center" />
          <div className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-white to-transparent lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function EmptySearchStart() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-3">
        <IntroPanel
          title="Search the research portfolio"
          body="Start with a topic, investigator theme, grant area, center name, innovation, or publication keyword."
          icon={Search}
        />
        <IntroPanel
          title="Filter by record type"
          body="Narrow results to projects, publications, funding, innovations, partners, resources, news, or events."
          icon={SlidersHorizontal}
        />
        <IntroPanel
          title="Need help finding records?"
          body="The REIRM office can help connect your search to the right research pathway."
          icon={HelpCircle}
          href="/connect"
        />
      </div>
    </section>
  );
}

function ResultsToolbar({
  query,
  total,
  sort,
  view,
  params,
}: {
  query: string;
  total: number;
  sort: string;
  view: string;
  params: SearchParams;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
          {total} research results for <span className="text-primary">"{query}"</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Results are grouped from public REIRM records only.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <form action="/search" className="flex items-center gap-2">
          <HiddenParams params={params} omit={["sort"]} />
          <label className="text-sm font-semibold text-slate-600" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="title">Title</option>
          </select>
          <button className="sr-only">Apply sort</button>
        </form>
        <div className="flex rounded-md border border-slate-200 bg-white p-1">
          <ViewToggle href={buildSearchHref(params, { view: "grid" })} active={view === "grid"} label="Grid view" icon={Grid2X2} />
          <ViewToggle href={buildSearchHref(params, { view: "list" })} active={view !== "grid"} label="List view" icon={List} />
        </div>
      </div>
    </div>
  );
}

function SearchFilters({
  params,
  counts,
  centers,
}: {
  params: SearchParams;
  counts: Record<string, number>;
  centers: Array<{ id: string; label: string }>;
}) {
  const selectedTypes = new Set(arrayParam(params.type));

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">Filter results</h2>
        <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <RotateCcw aria-hidden className="h-3.5 w-3.5" />
          Reset
        </Link>
      </div>
      <form action="/search" className="mt-5 space-y-6">
        {params.q ? <input type="hidden" name="q" value={params.q} /> : null}

        <fieldset>
          <legend className="text-xs font-semibold uppercase text-slate-500">Record type</legend>
          <div className="mt-3 space-y-2">
            {RESEARCH_SEARCH_GROUPS.map((group) => (
              <label key={group.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="type"
                  value={group.key}
                  defaultChecked={selectedTypes.size === 0 || selectedTypes.has(group.key)}
                  className="h-4 w-4 rounded border-slate-300 text-primary"
                />
                <span className="min-w-0 flex-1">{group.label}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {counts[group.key] ?? 0}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <SelectField
          name="status"
          label="Status"
          value={params.status}
          options={["", "published", "ongoing", "completed", "open", "upcoming"]}
        />

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Year</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              name="yearFrom"
              defaultValue={params.yearFrom ?? ""}
              placeholder="From"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            />
            <input
              name="yearTo"
              defaultValue={params.yearTo ?? ""}
              placeholder="To"
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            />
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500">Center / Unit</span>
          <select
            name="center"
            defaultValue={params.center ?? ""}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">All centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.label}>
                {center.label}
              </option>
            ))}
          </select>
        </label>

        <ToggleField name="openAccess" label="Open access only" checked={params.openAccess === "1"} />
        <ToggleField name="featured" label="Featured only" checked={params.featured === "1"} />

        <button className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Apply filters
        </button>
      </form>
    </aside>
  );
}

function ResultTabs({
  activeTab,
  results,
  params,
}: {
  activeTab: SearchTabKey;
  results: ResearchSearchResult[];
  params: SearchParams;
}) {
  return (
    <nav aria-label="Search result groups" className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex min-w-max gap-1">
        {SEARCH_TABS.map((tab) => {
          const count = filterResultsByTab(results, tab.key).length;
          const active = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildSearchHref(params, { tab: tab.key })}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {tab.label}
              <span className={active ? "ml-2 text-white/75" : "ml-2 text-slate-400"}>{count}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TopMatchCard({
  query,
  result,
}: {
  query: string;
  result: ResearchSearchResult;
}) {
  return (
    <article className="mt-5 overflow-hidden rounded-lg border border-primary/20 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-primary px-4 py-2 text-xs font-semibold uppercase text-white">
        Top match
      </div>
      <Link href={result.href} className="grid gap-5 p-5 transition hover:bg-primary/5 md:grid-cols-[260px_minmax(0,1fr)_auto]">
        <ResultThumb result={result} />
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <ResultBadge result={result} />
            {result.isFeatured ? <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-white">Featured</span> : null}
          </div>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {result.title}
          </h3>
          <HighlightedText query={query} text={result.description} className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600" />
          <ResultMeta result={result} />
        </div>
        <ArrowRight aria-hidden className="mt-2 h-5 w-5 text-primary" />
      </Link>
    </article>
  );
}

function ResultRow({ query, result }: { query: string; result: ResearchSearchResult }) {
  return (
    <Link href={result.href} className="grid gap-4 border-b border-slate-200 p-4 transition last:border-b-0 hover:bg-primary/5 md:grid-cols-[170px_minmax(0,1fr)_auto]">
      <ResultThumb result={result} />
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <ResultBadge result={result} />
          {result.isOpenAccess ? <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Open access</span> : null}
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
          {result.title}
        </h3>
        <HighlightedText query={query} text={result.description} className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600" />
        <ResultMeta result={result} />
      </div>
      <ArrowRight aria-hidden className="mt-2 h-5 w-5 text-primary" />
    </Link>
  );
}

function GridResultCard({ query, result }: { query: string; result: ResearchSearchResult }) {
  return (
    <Link href={result.href} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <ResultThumb result={result} large />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <ResultBadge result={result} />
          {result.isFeatured ? <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-white">Featured</span> : null}
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
          {result.title}
        </h3>
        <HighlightedText query={query} text={result.description} className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600" />
        <ResultMeta result={result} />
      </div>
    </Link>
  );
}

function SearchSupportRail({
  relatedAreas,
  params,
}: {
  relatedAreas: string[];
  params: SearchParams;
}) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
      <RailPanel title="Explore related research areas" icon={Leaf}>
        <div className="space-y-2">
          {relatedAreas.slice(0, 6).map((area) => (
            <Link key={area} href={`/search?q=${encodeURIComponent(area)}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/30 hover:text-primary">
              {area}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </RailPanel>

      <RailPanel title="Popular searches" icon={TrendingUp}>
        <div className="space-y-2">
          {popularSearches.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="flex items-center justify-between text-sm text-slate-600 transition hover:text-primary">
              {term}
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Search</span>
            </Link>
          ))}
        </div>
      </RailPanel>

      <RailPanel title="Need help?" icon={HelpCircle}>
        <p className="text-sm leading-6 text-slate-600">
          Can't find what you're looking for? Our research team can help you
          find the right information.
        </p>
        <Link href="/connect" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5">
          Contact REIRM
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Mail aria-hidden className="h-4 w-4 text-primary" />
          research@kisiiuniversity.ac.ke
        </p>
      </RailPanel>

      <RailPanel title="Search tips" icon={Info}>
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          <li>Use specific keywords for better results.</li>
          <li>Try synonyms or related research themes.</li>
          <li>Use filters to narrow your search.</li>
          <li>Search grant, project, or center names directly.</li>
        </ul>
        {params.q ? (
          <Link href={buildSearchHref(params, { q: params.q })} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Search help guide
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : null}
      </RailPanel>
    </aside>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <Search aria-hidden className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        No public research records matched your search.
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        No records matched "{query}". Try a broader term, remove filters, or
        search by project, publication, center, or partner name.
      </p>
      <Link href="/search" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/25 px-4 py-2 text-sm font-semibold text-primary">
        Clear filters and try again
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

function IntroPanel({
  title,
  body,
  icon: Icon,
  href,
}: {
  title: string;
  body: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href?: string;
}) {
  const content = (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

async function runResearchSearch(
  query: string,
  groups: ResearchSearchGroup[],
): Promise<SearchGroupResponse[]> {
  const researchGroups = groups.filter((group) => group.key !== "news" && group.key !== "events");
  const contentGroups = groups.filter((group) => group.key === "news" || group.key === "events");
  const responses = new Map<string, SearchGroupResponse>();

  try {
    if (researchGroups.length > 0) {
      const response = await researchServiceApi.search({
        q: query,
        types: researchGroups.map((group) => group.key).join(","),
        limit: Math.max(PER_GROUP, PER_GROUP * researchGroups.length),
      });
      const results = (response.data?.results ?? [])
        .map((record) => buildBackendSearchResult(record))
        .filter((result): result is ResearchSearchResult => Boolean(result));

      for (const group of researchGroups) {
        const groupResults = results.filter((result) => result.groupKey === group.key);
        responses.set(group.key, {
          group,
          results: groupResults,
          total: response.data?.by_type?.[group.key] ?? groupResults.length,
          error: null,
        });
      }
    }
  } catch {
    for (const group of researchGroups) {
      responses.set(group.key, {
        group,
        results: [],
        total: 0,
        error: "Research search is temporarily unavailable.",
      });
    }
  }

  await Promise.all(
    contentGroups.map(async (group) => {
      try {
        const response =
          group.key === "news"
            ? await researchServiceApi.articles.list({
                search: query,
                is_published: true,
                per_page: PER_GROUP,
              })
            : await researchServiceApi.events.list({
                search: query,
                is_published: true,
                per_page: PER_GROUP,
              });
        const data = (response.data ?? []) as SearchRecord[];
        responses.set(group.key, {
          group,
          results: data.map((record) => buildSearchResult(record, group)),
          total: response.meta?.total ?? data.length,
          error: null,
        });
      } catch {
        responses.set(group.key, {
          group,
          results: [],
          total: 0,
          error: `${group.label} are temporarily unavailable.`,
        });
      }
    }),
  );

  return groups.map(
    (group) =>
      responses.get(group.key) ?? {
        group,
        results: [],
        total: 0,
        error: null,
      },
  );
}
async function loadCenterOptions() {
  try {
    const response = await researchServiceApi.centers.list({
      fields: "id,name,title",
      is_active: true,
      is_public: true,
      per_page: 100,
    });
    return (response.data ?? [])
      .map((center) => ({
        id: center.id,
        label: String(center.name ?? center.title ?? center.id),
      }))
      .filter((center) => center.label);
  } catch {
    return [];
  }
}

async function loadRelatedAreas() {
  try {
    const response = await researchServiceApi.expertiseTags.list({
      fields: "id,name,title",
      is_active: true,
      is_public: true,
      per_page: 8,
    });
    const areas = (response.data ?? [])
      .map((item) => String(item.name ?? item.title ?? ""))
      .filter(Boolean);
    return areas.length ? areas : relatedResearchAreas;
  } catch {
    return relatedResearchAreas;
  }
}

function applyResultFilters(results: ResearchSearchResult[], params: SearchParams) {
  const status = params.status?.toLowerCase();
  const yearFrom = parseYear(params.yearFrom);
  const yearTo = parseYear(params.yearTo);
  const center = params.center?.toLowerCase();
  const openAccessOnly = params.openAccess === "1";
  const featuredOnly = params.featured === "1";

  return results.filter((result) => {
    if (status && result.status.toLowerCase() !== status) return false;
    const resultYear = result.timestamp ? new Date(result.timestamp).getFullYear() : undefined;
    if (yearFrom && (!resultYear || resultYear < yearFrom)) return false;
    if (yearTo && (!resultYear || resultYear > yearTo)) return false;
    if (center && !result.chips.join(" ").toLowerCase().includes(center)) return false;
    if (openAccessOnly && !result.isOpenAccess) return false;
    if (featuredOnly && !result.isFeatured) return false;
    return true;
  });
}

function buildGroupCounts(groups: SearchGroupResponse[]) {
  return Object.fromEntries(groups.map((group) => [group.group.key, group.results.length]));
}

function getActiveTab(value?: string): SearchTabKey {
  return SEARCH_TABS.some((tab) => tab.key === value) ? (value as SearchTabKey) : "all";
}

function parseYear(value?: string) {
  if (!value) return undefined;
  const year = Number(value);
  return Number.isInteger(year) ? year : undefined;
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
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {option ? option.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "All status"}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
      <span>{label}</span>
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          name={name}
          value="1"
          defaultChecked={checked}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-primary" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function ViewToggle({
  href,
  active,
  label,
  icon: Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded ${
        active ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <Icon aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function ResultThumb({
  result,
  large = false,
}: {
  result: ResearchSearchResult;
  large?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-slate-100 ${
        large ? "aspect-[16/9]" : "min-h-28"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${result.image}")` }}
      />
    </div>
  );
}

function ResultBadge({ result }: { result: ResearchSearchResult }) {
  return (
    <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white">
      {result.label}
    </span>
  );
}

function ResultMeta({ result }: { result: ResearchSearchResult }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {result.date ? <MetaChip>{result.date}</MetaChip> : null}
      {result.chips.map((chip) => (
        <MetaChip key={chip}>{chip}</MetaChip>
      ))}
    </div>
  );
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
      <Check aria-hidden className="h-3 w-3 text-primary" />
      {children}
    </span>
  );
}

function HighlightedText({
  query,
  text,
  className,
}: {
  query: string;
  text: string;
  className: string;
}) {
  const fragments = splitHighlight(text || "Details will appear when published.", query);
  return (
    <p className={className}>
      {fragments.map((fragment, index) =>
        fragment.match ? (
          <mark key={`${fragment.text}-${index}`} className="rounded bg-secondary/15 px-1 text-slate-950">
            {fragment.text}
          </mark>
        ) : (
          <span key={`${fragment.text}-${index}`}>{fragment.text}</span>
        ),
      )}
    </p>
  );
}

function RailPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Icon aria-hidden className="h-4 w-4 text-primary" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function HiddenParams({
  params,
  omit = [],
}: {
  params: SearchParams;
  omit?: string[];
}) {
  const omitted = new Set(omit);
  return (
    <>
      {Object.entries(params).flatMap(([key, value]) => {
        if (omitted.has(key) || value === undefined) return [];
        const values = Array.isArray(value) ? value : [value];
        return values.map((item) => (
          <input key={`${key}-${item}`} type="hidden" name={key} value={item} />
        ));
      })}
    </>
  );
}

function buildSearchHref(params: SearchParams, patch: Partial<SearchParams>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...patch })) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) next.append(key, item);
    } else {
      next.set(key, value);
    }
  }
  return `/search?${next.toString()}`;
}

function arrayParam(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function splitHighlight(text: string, query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const needle = cleanQuery.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + cleanQuery.length), match: true },
    { text: text.slice(index + cleanQuery.length), match: false },
  ].filter((fragment) => fragment.text);
}
