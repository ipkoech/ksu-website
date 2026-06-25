import {
  LibraryFilterSubmit,
  LibraryFilterTextInput,
  LibraryHero,
  LibrarySection,
  LibraryShell,
  PrimaryLink,
  RecordListItem,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import {
  formatDate,
  getLibraryNewsData,
  shortText,
} from "../../lib/library-public-data";

export const metadata = {
  title: "News",
  description: "Kisii University Library news and updates.",
};

export const dynamic = "force-dynamic";

type NewsPageProps = {
  searchParams?: Promise<{ q?: string; page?: string }>;
};

export default async function LibraryNewsPage({ searchParams }: NewsPageProps) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const { records, query, errors } = await getLibraryNewsData({
    query: params.q,
    perPage: 18,
    page,
  });

  const totalPages = records.meta
    ? Math.ceil(records.meta.total / records.meta.per_page)
    : 1;
  const newsBaseHref = buildBaseHref("/news", params);

  return (
    <LibraryShell>
      <LibraryHero
        eyebrow="Library News"
        title="Updates from Kisii University Library."
        body="Follow library service notices, resource updates, training announcements, repository highlights, and access guidance."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "News" }]}
        actions={
          <>
            <PrimaryLink href="/events">View events</PrimaryLink>
            <SecondaryLink href="/articles">Read articles</SecondaryLink>
          </>
        }
      />

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibrarySection
        eyebrow="Search"
        title="Find library updates"
        body="Search news by title, summary, category, or tag."
        tone="white"
      >
        <form
          action="/news"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <LibraryFilterTextInput
            name="q"
            label="Search News"
            value={query}
            placeholder="Resource update, training, repository, access"
          />
          <LibraryFilterSubmit>Search News</LibraryFilterSubmit>
        </form>
      </LibrarySection>

      <LibrarySection
        eyebrow="Updates"
        title={query ? `News matching "${query}"` : "Latest library news"}
        body="News records are sourced from the main public content service."
      >
        {records.data.length === 0 ? (
          <StatusMessage>No published news records are available yet.</StatusMessage>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {records.data.map((item) => (
                <RecordListItem
                  key={item.id}
                  eyebrow={item.category ?? "News"}
                  title={item.title}
                  body={shortText(item.summary ?? item.plain_text ?? item.rich_text ?? item.content)}
                  meta={[formatDate(item.published_at ?? item.created_at), item.is_featured ? "Featured" : null]}
                  href={`/news/${item.slug}`}
                  action="Read update"
                />
              ))}
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={records.meta?.total ?? records.data.length}
              perPage={records.meta?.per_page ?? 18}
              baseHref={newsBaseHref}
            />
          </>
        )}
      </LibrarySection>
    </LibraryShell>
  );
}

function buildBaseHref(
  path: string,
  params: Record<string, string | string[] | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    if (typeof value === "string" && value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
