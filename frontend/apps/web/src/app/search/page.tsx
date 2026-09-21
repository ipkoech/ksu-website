import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicSearchForm } from "@/components/public/search-form";
import { SearchResults, type SearchResultDto } from "@/components/public/search-results";
import { searchApi, type SearchPayload } from "@ksu/api-client/server";

type SearchKind =
  | "news"
  | "blogs"
  | "programmes"
  | "schools"
  | "departments"
  | "events"
  | "persons"
  | "announcements";

type SearchResult = {
  kind: SearchKind;
  label: string;
  title: string;
  excerpt: string;
  href: string;
};

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
): SearchResult {
  return { kind, label, title, excerpt, href };
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
        `/media/news/${item.slug}`,
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
        `/media/articles/${item.slug}`,
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
        `/media/events/${item.slug}`,
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
        `/media/announcements/${item.slug}`,
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
      ),
    ),
  ];
}

type SearchResponseState =
  | { status: "idle"; payload: null }
  | { status: "available"; payload: SearchPayload }
  | { status: "unavailable"; payload: null };

const searchFieldParams = {
  news_fields: "id,title,slug,summary,plain_text,rich_text,content",
  blogs_fields: "id,title,slug,summary,plain_text,rich_text,content",
  events_fields: "id,title,slug,summary,plain_text,rich_text,content,location",
  announcements_fields: "id,title,slug,summary,plain_text,rich_text,content",
  schools_fields: "id,name,slug,about,description,mandate",
  departments_fields:
    "id,name,slug,department_type,about,mandate,service_charter",
  persons_fields:
    "id,full_name,first_name,last_name,bio,specialization,department_name",
};

async function getSearchPayload(query: string): Promise<SearchResponseState> {
  if (query.length < 2) return { status: "idle", payload: null };

  try {
    const response = await searchApi.query({
      q: query,
      limit_per_type: 8,
      ...searchFieldParams,
    });
    return { status: "available", payload: response.data };
  } catch (error) {
    console.error("Failed to load public search results:", error);
    return { status: "unavailable", payload: null };
  }
}

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const searchState = await getSearchPayload(query);
  const results: SearchResultDto[] = mapResults(searchState.payload);

  return (
    <PageShell>
      <section className="border-b border-border bg-surface-subtle px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <BreadcrumbTrail
            items={[{ label: "Home", href: "/" }, { label: "Search" }]}
          />
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Search Kisii University
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Find news, programmes, schools, departments, events, people, and
              public notices.
            </p>
          </div>

          <PublicSearchForm initialQuery={query} className="mt-5" />
        </div>
      </section>

      <SearchResults query={query} status={searchState.status} results={results} />
    </PageShell>
  );
}
