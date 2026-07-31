import type { Blog, Event, News } from "@ksu/api-client";
import {
  LibraryFilterSubmit,
  LibraryFilterTextInput,
  LibraryHero,
  LibrarySection,
  LibraryShell,
  RecordListItem,
  StatusMessage,
} from "../../components/library-ui";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import Link from "next/link";
import {
  formatDate,
  getLibraryArticlesData,
  getLibraryEventsData,
  getLibraryNewsData,
  isLibraryUpdateType,
  shortText,
  type LibraryContentData,
  type LibraryUpdateType,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Updates",
  description:
    "Kisii University Library news, events, and articles: service notices, trainings, and research guidance.",
};

export const dynamic = "force-dynamic";

const UPDATE_TABS: { type: LibraryUpdateType; label: string }[] = [
  { type: "news", label: "News" },
  { type: "events", label: "Events" },
  { type: "articles", label: "Articles" },
];

const PER_PAGE = 18;

type UpdatesPageProps = {
  searchParams?: Promise<{ q?: string; page?: string; type?: string }>;
};

export default async function LibraryUpdatesPage({
  searchParams,
}: UpdatesPageProps) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const type: LibraryUpdateType =
    params.type && isLibraryUpdateType(params.type) ? params.type : "news";

  const options = { query: params.q, perPage: PER_PAGE, page };
  const result: LibraryContentData<News | Event | Blog> =
    type === "news"
      ? await getLibraryNewsData(options)
      : type === "events"
        ? await getLibraryEventsData(options)
        : await getLibraryArticlesData(options);
  const { records, query, errors } = result;

  const totalPages = records.meta
    ? Math.ceil(records.meta.total / records.meta.per_page)
    : 1;
  const activeLabel = UPDATE_TABS.find((tab) => tab.type === type)?.label ?? "News";

  return (
    <LibraryShell>
      <LibraryHero
        eyebrow="Library Updates"
        title="News, events, and articles from the Library."
        body="Service notices, resource and access updates, information literacy trainings, and research guidance published by Kisii University Library."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Updates" },
        ]}
      />

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibrarySection
        eyebrow="Browse"
        title={
          query
            ? `${activeLabel} matching "${query}"`
            : `Latest library ${activeLabel.toLowerCase()}`
        }
        body="Switch between news, events, and articles, or search within the selected type."
        tone="white"
      >
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="navigation"
          aria-label="Update type"
        >
          {UPDATE_TABS.map((tab) => (
            <Link
              key={tab.type}
              href={buildUpdatesHref({ type: tab.type, q: query })}
              aria-current={tab.type === type ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
                tab.type === type
                  ? "bg-primary text-white"
                  : "bg-surface-subtle text-primary hover:bg-primary/10"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form
          action="/updates"
          className="grid gap-4 rounded-lg border border-border bg-surface-subtle p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <input type="hidden" name="type" value={type} />
          <LibraryFilterTextInput
            name="q"
            label={`Search ${activeLabel}`}
            value={query}
            placeholder="Resource update, training, repository, access"
          />
          <LibraryFilterSubmit>Search {activeLabel}</LibraryFilterSubmit>
        </form>

        <div className="mt-8">
          {records.data.length === 0 ? (
            <StatusMessage>
              No published library {activeLabel.toLowerCase()} are available yet.
            </StatusMessage>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                {records.data.map((item) => (
                  <RecordListItem
                    key={item.id}
                    eyebrow={("category" in item ? item.category : null) ?? activeLabel}
                    title={item.title}
                    body={shortText(
                      item.summary ??
                        ("excerpt" in item ? item.excerpt : null) ??
                        item.plain_text ??
                        item.rich_text ??
                        item.content,
                    )}
                    meta={updateMeta(type, item)}
                    href={`/updates/${type}/${item.slug}`}
                    action={type === "events" ? "View event" : "Read more"}
                  />
                ))}
              </div>
              <ListPagination
                page={page}
                totalPages={totalPages}
                total={records.meta?.total ?? records.data.length}
                perPage={records.meta?.per_page ?? PER_PAGE}
                baseHref={buildUpdatesHref({ type, q: query })}
              />
            </>
          )}
        </div>
      </LibrarySection>
    </LibraryShell>
  );
}

function updateMeta(type: LibraryUpdateType, item: News | Event | Blog) {
  if (type === "events") {
    const event = item as Event;
    return [
      formatDate(event.start_date ?? event.published_at ?? event.created_at),
      event.is_virtual ? "Virtual" : (event.venue ?? event.location ?? null),
    ];
  }
  return [formatDate(item.published_at ?? item.created_at)];
}

function buildUpdatesHref({ type, q }: { type: LibraryUpdateType; q?: string }) {
  const search = new URLSearchParams();
  if (type !== "news") search.set("type", type);
  if (q) search.set("q", q);
  const qs = search.toString();
  return qs ? `/updates?${qs}` : "/updates";
}
