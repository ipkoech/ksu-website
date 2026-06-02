import Link from "next/link";
import {
  ArrowRight,
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
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicSearchForm } from "@/components/public/search-form";
import { searchApi, type SearchPayload } from "@ksu/api-client";

type SearchKind =
  | "all"
  | "news"
  | "blogs"
  | "programmes"
  | "schools"
  | "departments"
  | "events"
  | "persons"
  | "announcements";

type SearchResult = {
  kind: Exclude<SearchKind, "all">;
  label: string;
  title: string;
  excerpt: string;
  href: string;
  Icon: LucideIcon;
};

const searchTypeOptions: { value: SearchKind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "programmes", label: "Programmes" },
  { value: "schools", label: "Schools" },
  { value: "departments", label: "Departments" },
  { value: "persons", label: "People" },
  { value: "news", label: "News" },
  { value: "events", label: "Events" },
  { value: "announcements", label: "Notices" },
  { value: "blogs", label: "Blogs" },
];

function searchType(value?: string): SearchKind {
  return searchTypeOptions.some((option) => option.value === value)
    ? (value as SearchKind)
    : "all";
}

function searchHref(query: string, type: SearchKind) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return fallback;
  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
}

function result(
  kind: SearchResult["kind"],
  label: string,
  title: string,
  excerpt: string,
  href: string,
  Icon: LucideIcon,
): SearchResult {
  return { kind, label, title, excerpt, href, Icon };
}

function mapResults(payload?: SearchPayload | null): SearchResult[] {
  const data = payload?.results;
  if (!data) return [];

  return [
    ...(data.news ?? []).map((item) =>
      result(
        "news",
        "News",
        item.title,
        cleanText(
          item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
          "Published university news item.",
        ),
        `/news/${item.slug}`,
        Newspaper,
      ),
    ),
    ...(data.blogs ?? []).map((item) =>
      result(
        "blogs",
        "Blog",
        item.title,
        cleanText(
          item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
          "Published university blog post.",
        ),
        `/blogs/${item.slug}`,
        FileText,
      ),
    ),
    ...(data.events ?? []).map((item) =>
      result(
        "events",
        "Event",
        item.title,
        cleanText(
          item.summary ??
            item.plain_text ??
            item.rich_text ??
            item.content ??
            item.location,
          "Published university event.",
        ),
        `/events/${item.slug}`,
        CalendarDays,
      ),
    ),
    ...(data.announcements ?? []).map((item) =>
      result(
        "announcements",
        "Notice",
        item.title,
        cleanText(
          item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
          "Published university notice.",
        ),
        `/announcements/${item.slug}`,
        Megaphone,
      ),
    ),
    ...(data.schools ?? []).map((item) =>
      result(
        "schools",
        "School",
        item.name,
        cleanText(
          item.about ?? item.description ?? item.mandate,
          "Academic school record.",
        ),
        `/academics/schools/${item.slug}`,
        GraduationCap,
      ),
    ),
    ...(data.departments ?? []).map((item) => {
      const href =
        item.department_type === "academic"
          ? `/academics/departments/${item.slug}`
          : `/administration/units/${item.slug}`;
      return result(
        "departments",
        "Department",
        item.name,
        cleanText(
          item.about ?? item.mandate ?? item.service_charter,
          "Department record.",
        ),
        href,
        Building2,
      );
    }),
    ...(data.persons ?? []).map((item) =>
      result(
        "persons",
        "People",
        item.full_name ||
          [item.first_name, item.last_name].filter(Boolean).join(" ") ||
          "Staff profile",
        cleanText(
          item.bio ?? item.specialization ?? item.department_name,
          "University staff profile.",
        ),
        `/staff/${item.id}`,
        UserRound,
      ),
    ),
  ];
}

type SearchResponseState =
  | { status: "idle"; payload: null }
  | { status: "available"; payload: SearchPayload }
  | { status: "unavailable"; payload: null };

async function getSearchPayload(query: string): Promise<SearchResponseState> {
  if (query.length < 2) return { status: "idle", payload: null };

  try {
    const response = await searchApi.query({ q: query, limit_per_type: 8 });
    return { status: "available", payload: response.data };
  } catch (error) {
    console.error("Failed to load public search results:", error);
    return { status: "unavailable", payload: null };
  }
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
        <span className="text-xs font-semibold uppercase text-secondary">
          {item.label}
        </span>
        <span className="mt-1 block text-lg font-semibold leading-6 text-slate-950">
          {item.title}
        </span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">
          {item.excerpt}
        </span>
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
  const activeType = searchType(params.type);
  const searchState = await getSearchPayload(query);
  const allResults = mapResults(searchState.payload);
  const results =
    activeType === "all"
      ? allResults
      : allResults.filter((item) => item.kind === activeType);
  const resultCount = results.length;

  return (
    <PageShell>
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <BreadcrumbTrail
            items={[{ label: "Home", href: "/" }, { label: "Search" }]}
          />
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Search Kisii University
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Find news, programmes, schools, departments, events, people, and
              public notices.
            </p>
          </div>

          <PublicSearchForm initialQuery={query} className="mt-5" />
          <nav
            aria-label="Search result categories"
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
          >
            {searchTypeOptions.map((option) => {
              const isActive = option.value === activeType;

              return (
                <Link
                  key={option.value}
                  href={searchHref(query, option.value)}
                  className={
                    isActive
                      ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
                      : "inline-flex min-h-11 shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <ScrollReveal
        as="section"
        className="bg-white px-4 py-7 sm:px-6 lg:px-8 lg:py-9"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Search Results
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
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
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex gap-3">
                <Search aria-hidden className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    Start typing above to search.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Try a school name, programme, department, person, event, or
                    public notice.
                  </p>
                </div>
              </div>
            </div>
          ) : query.length < 2 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
              Search terms must include at least two characters.
            </div>
          ) : searchState.status === "unavailable" ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 p-5"
              role="status"
            >
              <p className="text-base font-semibold text-amber-950">
                Search is temporarily unavailable.
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Live search records could not be loaded. Try again shortly, or
                use the main navigation and contact page.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={searchHref(query, activeType)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
                >
                  Retry search
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
                >
                  Contact support
                </Link>
              </div>
            </div>
          ) : results.length ? (
            <div className="space-y-3">
              {results.map((item) => (
                <ResultRow
                  key={`${item.kind}-${item.href}-${item.title}`}
                  item={item}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-base font-semibold text-slate-950">
                No results found.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Check spelling or try a broader term such as admissions,
                agriculture, school, news, or research.
              </p>
            </div>
          )}
        </div>
      </ScrollReveal>
    </PageShell>
  );
}
