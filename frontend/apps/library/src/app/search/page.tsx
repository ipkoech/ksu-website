import { Children } from "react";
import Link from "next/link";
import {
  LibraryContentBand,
  LibrarySectionHeading,
  PillNav,
  SearchPanel,
  SidePanel,
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
      <LibraryContentBand>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Library Search
          </p>
          <h1 className="mt-3 max-w-4xl text-wrap font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
            Search catalog records, e-resources, downloads, services, and staff.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Use a single query to discover branch catalog items, subscribed platforms,
            public files, support services, and library contacts.
          </p>
        </div>
        <SearchPanel>
          <PillNav
            items={[
              { label: "All", href: "/search" },
              { label: "Catalog", href: "/catalog" },
              { label: "E-resources", href: "/electronic" },
              { label: "Services", href: "/services" },
              { label: "Downloads", href: "/downloads" },
              { label: "Staff", href: "/staff" },
            ]}
          />
          <form
            action="/search"
            className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-end"
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
        </SearchPanel>
      </LibraryContentBand>

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          eyebrow="Results"
          title={query ? `Results for "${query}"` : "Current library records"}
          body={`${total} combined result${total === 1 ? "" : "s"} returned.`}
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
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
          <SidePanel title="Quick access" eyebrow="Search">
            <div className="grid gap-3 text-sm">
              <Link href="/catalog" className="font-semibold text-primary">Advanced catalog</Link>
              <Link href="/electronic" className="font-semibold text-primary">Browse e-resources</Link>
              <Link href="/ask" className="font-semibold text-primary">Ask a librarian</Link>
            </div>
          </SidePanel>
        </div>
      </LibraryContentBand>
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
