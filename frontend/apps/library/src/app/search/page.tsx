import { Children } from "react";
import Link from "next/link";
import {
  LibraryContentBand,
  LibraryFilterSelect,
  LibraryFilterSubmit,
  LibraryFilterTextInput,
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
    type?: string;
  }>;
};

export default async function LibrarySearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const { branches, catalog, electronic, unified, selectedLibraryId, query, errors } =
    await getLibrarySearchData({
      libraryId: params.branch,
      query: params.q,
      type: params.type,
    });
  const total = catalog.data.length + electronic.data.length;

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <LibraryContentBand>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Library Search
          </p>
          <h1 className="mt-3 max-w-4xl text-wrap font-[family-name:var(--app-font-display)] text-3xl font-normal leading-tight tracking-tight text-foreground sm:text-5xl">
            Search catalog records, e-resources, downloads, services, and staff.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
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
              { label: "Downloads", href: "/electronic#downloads" },
              { label: "Staff", href: "/about#staff" },
            ]}
          />
          <form
            action="/search"
            className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-end"
          >
            <LibraryFilterSelect
              name="branch"
              label="Catalog Branch"
              value={selectedLibraryId}
              options={branches.data.map((branch) => ({ value: branch.id, label: branch.name }))}
              allLabel="All branches"
            />
            <LibraryFilterTextInput
              name="q"
              label="Search Terms"
              value={query}
              placeholder="Title, author, database, provider, subject"
            />
            <LibraryFilterSubmit>Search Library</LibraryFilterSubmit>
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
          {unified && query ? (
            <UnifiedResults results={unified.results} />
          ) : null}
          {!unified && (
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
          )}
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

function UnifiedResults({
  results,
}: {
  results: Array<{
    id: string;
    type: string;
    title: string;
    description?: string | null;
    url?: string | null;
    library_name?: string | null;
  }>;
}) {
  return (
    <section className="border-y border-border bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-border py-4">
        <h2 className="text-lg font-semibold text-foreground">Unified library results</h2>
        <span className="text-sm text-muted-foreground">{results.length} shown</span>
      </div>
      {results.length === 0 ? (
        <p className="py-5 text-sm text-muted-foreground">No matching library records were found.</p>
      ) : (
        results.slice(0, 40).map((result) => (
          <article key={`${result.type}-${result.id}`} className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{formatLabel(result.type)}</p>
              <h3 className="mt-2 text-base font-semibold text-foreground">{result.title}</h3>
              {result.description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{result.description}</p> : null}
              {result.library_name ? <p className="mt-2 text-xs text-muted-foreground">{result.library_name}</p> : null}
            </div>
            {result.url ? <a href={result.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center text-sm font-semibold text-primary hover:text-secondary">Open result</a> : null}
          </article>
        ))
      )}
    </section>
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
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          Open advanced
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {Children.count(children) > 0 ? (
          children
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No records available.</p>
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
      <h3 className="text-sm font-semibold leading-6 text-foreground">{title}</h3>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {details.join(" - ")}
        </p>
      ) : null}
    </article>
  );
}
