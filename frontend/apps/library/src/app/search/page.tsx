import { Children } from "react";
import Link from "next/link";
import {
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibrarySearchData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Search",
  description: "Search Kisii University Library catalog and electronic resources.",
};

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    branch?: string;
  }>;
};

export default async function LibrarySearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const { branches, catalog, electronic, selectedLibraryId, query, errors } =
    await getLibrarySearchData({
      libraryId: params.branch,
      query: params.q,
    });
  const total = catalog.data.length + electronic.data.length;

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Search"
        title="Search catalog records and electronic resources together."
        body="Use a single query to discover branch catalog items and subscribed or recommended electronic platforms."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Search" },
        ]}
        actions={
          <>
            <PrimaryLink href="/catalog">Advanced catalog search</PrimaryLink>
            <SecondaryLink href="/electronic">Browse e-resources</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Combined results
          </p>
          <p className="mt-3 text-5xl font-bold">{total}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Catalog and e-resource records returned for the current query.
          </p>
        </div>
      </LibraryHero>

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibrarySection
        eyebrow="Search"
        title="Find library resources"
        body="For detailed filters, use the dedicated catalog and e-resource pages."
        tone="white"
      >
        <form
          action="/search"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-end"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="search-branch"
            >
              Catalog branch
            </label>
            <select
              id="search-branch"
              name="branch"
              defaultValue={selectedLibraryId}
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {branches.data.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="search-query"
            >
              Search terms
            </label>
            <input
              id="search-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Title, author, database, provider, subject"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </LibrarySection>

      <LibrarySection
        eyebrow="Results"
        title={query ? `Results for "${query}"` : "Current library records"}
        body={`${total} combined result${total === 1 ? "" : "s"} returned.`}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <ResultPanel title="Catalog records" href={`/catalog?q=${encodeURIComponent(query)}`}>
            {catalog.data.slice(0, 8).map((item) => (
              <ResultRow
                key={item.id}
                title={item.title}
                meta={[
                  item.authors,
                  formatLabel(item.resource_type),
                  formatLabel(item.status),
                ]}
              />
            ))}
          </ResultPanel>
          <ResultPanel
            title="Electronic resources"
            href={`/electronic?q=${encodeURIComponent(query)}`}
          >
            {electronic.data.slice(0, 8).map((item) => (
              <ResultRow
                key={item.id}
                title={item.name ?? "Untitled resource"}
                meta={[
                  item.provider,
                  formatLabel(item.resource_type),
                  formatLabel(item.access_type),
                ]}
              />
            ))}
          </ResultPanel>
        </div>
      </LibrarySection>
    </main>
  );
}

function ResultPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          Open advanced
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {Children.count(children) > 0 ? (
          children
        ) : (
          <p className="py-4 text-sm text-slate-600">No records available.</p>
        )}
      </div>
    </section>
  );
}

function ResultRow({
  title,
  meta,
}: {
  title: string;
  meta: Array<string | number | null | undefined>;
}) {
  const details = meta.map(compactText).filter(Boolean);
  return (
    <article className="py-4">
      <h3 className="text-sm font-semibold leading-6 text-slate-950">{title}</h3>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {details.join(" - ")}
        </p>
      ) : null}
    </article>
  );
}
