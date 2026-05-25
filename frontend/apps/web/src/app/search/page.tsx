import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Megaphone,
  Newspaper,
  Search,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicSearchForm } from "@/components/public/search-form";
import { searchApi, type SearchPayload } from "@ksu/api-client";

type SearchKind = "all" | "news" | "blogs" | "programmes" | "schools" | "departments" | "events" | "persons" | "announcements";

type SearchResult = {
  kind: Exclude<SearchKind, "all">;
  label: string;
  title: string;
  excerpt: string;
  href: string;
  path: string;
  Icon: LucideIcon;
};

const filters: { kind: SearchKind; label: string }[] = [
  { kind: "all", label: "All" },
  { kind: "news", label: "News" },
  { kind: "programmes", label: "Programmes" },
  { kind: "schools", label: "Schools" },
  { kind: "departments", label: "Departments" },
  { kind: "events", label: "Events" },
  { kind: "persons", label: "People" },
  { kind: "announcements", label: "Notices" },
];

const popularLinks = [
  { label: "Admissions", href: "/admissions" },
  { label: "Programmes", href: "/academics/programmes" },
  { label: "Schools", href: "/academics/schools" },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "A-Z Index", href: "/az-index" },
];

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
}

function pathFromHref(href: string) {
  return href.startsWith("/") ? `kisiiuniversity.ac.ke${href}` : href;
}

function result(kind: SearchResult["kind"], label: string, title: string, excerpt: string, href: string, Icon: LucideIcon): SearchResult {
  return { kind, label, title, excerpt, href, path: pathFromHref(href), Icon };
}

function mapResults(payload?: SearchPayload | null): SearchResult[] {
  const data = payload?.results;
  if (!data) return [];

  return [
    ...(data.news ?? []).map((item) =>
      result("news", "News", item.title, cleanText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content, "Published university news item."), `/news/${item.slug}`, Newspaper),
    ),
    ...(data.blogs ?? []).map((item) =>
      result("blogs", "Blog", item.title, cleanText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content, "Published university blog post."), `/blogs/${item.slug}`, FileText),
    ),
    ...(data.events ?? []).map((item) =>
      result("events", "Event", item.title, cleanText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content ?? item.location, "Published university event."), `/events/${item.slug}`, CalendarDays),
    ),
    ...(data.announcements ?? []).map((item) =>
      result("announcements", "Notice", item.title, cleanText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content, "Published university notice."), `/announcements/${item.slug}`, Megaphone),
    ),
    ...(data.schools ?? []).map((item) =>
      result("schools", "School", item.name, cleanText(item.about ?? item.description ?? item.mandate, "Academic school record."), `/academics/schools/${item.slug}`, GraduationCap),
    ),
    ...(data.departments ?? []).map((item) => {
      const href = item.department_type === "academic" ? `/academics/departments/${item.slug}` : `/administration/units/${item.slug}`;
      return result("departments", "Department", item.name, cleanText(item.about ?? item.mandate ?? item.service_charter, "Department record."), href, Building2);
    }),
    ...(data.persons ?? []).map((item) =>
      result(
        "persons",
        "People",
        item.full_name || [item.first_name, item.last_name].filter(Boolean).join(" ") || "Staff profile",
        cleanText(item.bio ?? item.specialization ?? item.department_name, "University staff profile."),
        "/m/staff",
        UserRound,
      ),
    ),
  ];
}

async function getSearchPayload(query: string) {
  if (query.length < 2) return null;

  try {
    const response = await searchApi.query({ q: query, limit_per_type: 8 });
    return response.data;
  } catch (error) {
    console.error("Failed to load public search results:", error);
    return null;
  }
}

function filterHref(kind: SearchKind, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (kind !== "all") params.set("type", kind);
  const suffix = params.toString();
  return suffix ? `/search?${suffix}` : "/search";
}

function ResultRow({ item }: { item: SearchResult }) {
  const Icon = item.Icon;

  return (
    <Link
      href={item.href}
      className="group grid gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-[0_16px_45px_-34px_rgba(15,23,42,0.55)] sm:grid-cols-[48px_minmax(0,1fr)_24px]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="text-xs font-semibold uppercase text-secondary">{item.label}</span>
        <span className="mt-1 block text-lg font-semibold leading-6 text-slate-950">{item.title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">{item.excerpt}</span>
        <span className="mt-2 block truncate text-xs font-medium text-slate-500">{item.path}</span>
      </span>
      <span className="hidden items-center justify-center text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary sm:flex">
        <ArrowRight aria-hidden className="h-5 w-5" />
      </span>
    </Link>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeKind = filters.some((item) => item.kind === params.type) ? (params.type as SearchKind) : "all";
  const payload = await getSearchPayload(query);
  const allResults = mapResults(payload);
  const results = activeKind === "all" ? allResults : allResults.filter((item) => item.kind === activeKind);
  const resultCount = results.length;

  return (
    <PageShell>
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase text-secondary">Search</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Search Kisii University
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Find news, programmes, schools, departments, events, people, and public notices.
            </p>
          </div>

          <PublicSearchForm initialQuery={query} className="mt-7 max-w-5xl" />

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = filter.kind === activeKind;
              return (
                <Link
                  key={filter.kind}
                  href={filterHref(filter.kind, query)}
                  className={
                    active
                      ? "inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
                      : "inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                  }
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">Search Results</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {query ? `Results for "${query}"` : "Start with a search"}
                </h2>
              </div>
              {query.length >= 2 ? (
                <p className="text-sm font-medium text-slate-500">
                  {resultCount} {resultCount === 1 ? "result" : "results"}
                </p>
              ) : null}
            </div>

            {query.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <Search aria-hidden className="h-8 w-8 text-primary" />
                <p className="mt-4 text-lg font-semibold text-slate-950">Enter a search term to begin.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Try a school name, programme, department, person, event, or public notice.
                </p>
              </div>
            ) : query.length < 2 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-600">
                Search terms must include at least two characters.
              </div>
            ) : results.length ? (
              <div className="space-y-3">
                {results.map((item) => (
                  <ResultRow key={`${item.kind}-${item.href}-${item.title}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-lg font-semibold text-slate-950">No results found.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Check spelling or try a broader term such as admissions, agriculture, school, news, or research.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-semibold uppercase text-secondary">Popular Links</h2>
              <div className="mt-4 space-y-2">
                {popularLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                  >
                    {item.label}
                    <ArrowRight aria-hidden className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase text-secondary">Refine By Section</h2>
              <div className="mt-4 grid gap-2">
                {filters.slice(1).map((filter) => (
                  <Link
                    key={filter.kind}
                    href={filterHref(filter.kind, query)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                  >
                    {filter.label}
                    <span className="text-xs text-slate-400">
                      {allResults.filter((item) => item.kind === filter.kind).length}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
