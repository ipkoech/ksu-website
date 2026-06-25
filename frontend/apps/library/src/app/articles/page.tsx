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
import {
  formatDate,
  getLibraryArticlesData,
  shortText,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Articles",
  description: "Kisii University Library articles and research support guidance.",
};

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function LibraryArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) ?? {};
  const { records, query, errors } = await getLibraryArticlesData({
    query: params.q,
    perPage: 18,
  });

  return (
    <LibraryShell>
      <LibraryHero
        eyebrow="Library Articles"
        title="Guides and articles for better research work."
        body="Read library articles on finding sources, using databases, citing publications, repository submissions, and responsible information use."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "Articles" }]}
        actions={
          <>
            <PrimaryLink href="/electronic">Browse databases</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
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
        title="Find articles"
        body="Search article records by title, author, category, or topic."
        tone="white"
      >
        <form
          action="/articles"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <LibraryFilterTextInput
            name="q"
            label="Search Articles"
            value={query}
            placeholder="Citation, databases, repository, research"
          />
          <LibraryFilterSubmit>Search Articles</LibraryFilterSubmit>
        </form>
      </LibrarySection>

      <LibrarySection
        eyebrow="Guidance"
        title={query ? `Articles matching "${query}"` : "Latest articles"}
        body="Use articles as practical guides for library, study, and research workflows."
      >
        {records.data.length === 0 ? (
          <StatusMessage>No published article records are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {records.data.map((item) => (
              <RecordListItem
                key={item.id}
                eyebrow={item.category ?? "Article"}
                title={item.title}
                body={shortText(item.summary ?? item.excerpt ?? item.plain_text ?? item.rich_text ?? item.content)}
                meta={[formatDate(item.published_at ?? item.created_at), item.author_name]}
                href={`/articles/${item.slug}`}
                action="Read article"
              />
            ))}
          </div>
        )}
      </LibrarySection>
    </LibraryShell>
  );
}
