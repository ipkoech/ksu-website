import Link from "next/link";
import type { ComponentProps } from "react";
import type { LibrarySearchResult } from "@ksu/api-client";
import {
  CompactRecord,
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

type CompactRecordIcon = ComponentProps<typeof CompactRecord>["icon"];

export default async function LibrarySearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const {
    branches,
    catalog,
    electronic,
    unified,
    editorial,
    selectedLibraryId,
    query,
    errors,
  } =
    await getLibrarySearchData({
      libraryId: params.branch,
      query: params.q,
    });
  const groupedResults = groupUnifiedResults(unified?.results ?? []);
  const total =
    (unified?.total ?? catalog.data.length + electronic.data.length) +
    editorial.data.length;
  const catalogResults: LibrarySearchResult[] =
    groupedResults.catalog.length > 0
      ? groupedResults.catalog
      : catalog.data.map((item) => ({
          id: item.id,
          type: "catalog",
          title: item.title,
          description: compactText(item.authors),
          metadata: {
            resource_type: item.resource_type,
            status: item.status,
          },
        }));
  const electronicResults: LibrarySearchResult[] =
    groupedResults.electronic.length > 0
      ? groupedResults.electronic
      : electronic.data.map((item) => ({
          id: item.id,
          type: "database",
          title: item.name ?? "Untitled resource",
          description: item.provider ?? item.description,
          url: item.access_url ?? undefined,
          metadata: {
            resource_type: item.resource_type,
            access_type: item.access_type,
          },
        }));

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
              { label: "Guides", href: "/guides" },
              { label: "Specialists", href: "/specialists" },
              { label: "Services", href: "/services" },
              { label: "Policies", href: "/policies" },
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
                <option value="">All branches</option>
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
            <UnifiedResultPanel title="Catalog records" href={`/catalog?q=${encodeURIComponent(query)}`} results={catalogResults} />
            <UnifiedResultPanel title="Electronic resources" href={`/electronic?q=${encodeURIComponent(query)}`} results={electronicResults} />
            <UnifiedResultPanel title="Guides" href={`/guides?q=${encodeURIComponent(query)}`} results={groupedResults.guides} />
            <UnifiedResultPanel title="Specialists" href={`/specialists?q=${encodeURIComponent(query)}`} results={groupedResults.specialists} />
            <UnifiedResultPanel title="Workflows" href="/services" results={groupedResults.workflows} />
            <UnifiedResultPanel title="Policies" href="/policies" results={groupedResults.policies} />
            <UnifiedResultPanel title="Editorial content" href="/news" results={editorial.data} />
          </div>
          <SidePanel title="Quick access" eyebrow="Search">
            <div className="grid gap-3 text-sm">
              <Link href="/catalog" className="font-semibold text-primary">Advanced catalog</Link>
              <Link href="/electronic" className="font-semibold text-primary">Browse e-resources</Link>
              <Link href="/guides" className="font-semibold text-primary">Browse guides</Link>
              <Link href="/policies" className="font-semibold text-primary">Read policies</Link>
              <Link href="/ask" className="font-semibold text-primary">Ask a librarian</Link>
            </div>
          </SidePanel>
        </div>
      </LibraryContentBand>
    </main>
  );
}

function UnifiedResultPanel({
  title,
  href,
  results,
}: {
  title: string;
  href: string;
  results: LibrarySearchResult[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          Open
        </Link>
      </div>
      <div className="mt-4 grid gap-3">
        {results.length > 0 ? (
          results.slice(0, 6).map((item) => (
            <CompactRecord
              key={`${item.type}-${item.id}`}
              icon={iconForType(item.type)}
              eyebrow={formatLabel(item.type)}
              title={item.title}
              body={compactText(item.description) || "Result details are being updated."}
              meta={[
                item.library_name,
                formatMetadataValue(item.metadata.resource_type),
                formatMetadataValue(item.metadata.status),
              ]}
              href={resultHref(item)}
              action="Open result"
            />
          ))
        ) : (
          <p className="py-4 text-sm text-slate-600">No records available.</p>
        )}
      </div>
    </section>
  );
}

function groupUnifiedResults(results: LibrarySearchResult[]) {
  return {
    catalog: results.filter((item) => item.type === "catalog"),
    electronic: results.filter((item) =>
      ["database", "e_resource", "electronic"].includes(item.type),
    ),
    guides: results.filter((item) => item.type === "guide"),
    specialists: results.filter((item) => item.type === "specialist"),
    workflows: results.filter((item) => item.type === "workflow"),
    policies: results.filter((item) => item.type === "policy"),
  };
}

function resultHref(item: LibrarySearchResult) {
  if (item.type === "workflow") {
    return workflowHref(item.metadata.workflow_type) ?? item.url ?? null;
  }
  if (item.url) return item.url;
  const slug = rawMetadataString(item.metadata.slug);
  if (item.type === "guide" && slug) return `/guides/${slug}`;
  if (item.type === "policy" && slug) return `/policies/${slug}`;
  return null;
}

function workflowHref(workflowType: unknown) {
  const type = rawMetadataString(workflowType);
  if (type === "borrowing_access") return "/borrowing";
  if (type === "remote_access") return "/remote-access";
  if (type === "repository_deposit") return "/repositories";
  if (type === "digital_scholarship") return "/digital-scholarship";
  return null;
}

function iconForType(type: string): CompactRecordIcon {
  if (type === "catalog" || type === "guide") return "book";
  if (["database", "e_resource", "electronic", "workflow"].includes(type)) {
    return "database";
  }
  if (type === "specialist") return "users";
  if (type === "policy") return "shield";
  return "file";
}

function formatMetadataValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return formatLabel(String(value));
  }
  return null;
}

function rawMetadataString(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return compactText(value);
  }
  return null;
}
