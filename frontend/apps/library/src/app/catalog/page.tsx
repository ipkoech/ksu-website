import Link from "next/link";
import type { LibraryResource } from "@ksu/api-client";
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
  getCatalogSearchData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Catalog",
  description:
    "Search Kisii University Library print and digital catalog resources.",
};

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams?: Promise<{
    branch?: string;
    q?: string;
    type?: string;
    status?: string;
  }>;
};

const resourceTypeOptions = [
  { label: "All types", value: "" },
  { label: "Books", value: "book" },
  { label: "Journals", value: "journal" },
  { label: "Theses", value: "thesis" },
  { label: "Reports", value: "report" },
  { label: "Magazines", value: "magazine" },
  { label: "Newspapers", value: "newspaper" },
  { label: "Multimedia", value: "multimedia" },
  { label: "Maps", value: "map" },
  { label: "Other", value: "other" },
];

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Available", value: "available" },
  { label: "On loan", value: "on_loan" },
  { label: "Reserved", value: "reserved" },
  { label: "Processing", value: "processing" },
];

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const { branches, resources, selectedLibraryId, query, resourceType, status } =
    await getCatalogSearchData({
      libraryId: params.branch,
      query: params.q,
      resourceType: params.type,
      status: params.status,
    });
  const selectedBranch = branches.data.find(
    (branch) => branch.id === selectedLibraryId,
  );
  const availableCount = resources.data.filter(
    (resource) => resource.status === "available",
  ).length;
  const referenceCount = resources.data.filter(
    (resource) => resource.is_reference_only,
  ).length;
  const loanableCount = resources.data.filter(
    (resource) => resource.is_loanable,
  ).length;
  const hasFilters = Boolean(query || resourceType || status);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Catalog"
        title="Find print and digital items held by library branches."
        body="Search by title, author, publisher, ISBN, call number, or subject. Use the branch selector to narrow results to the location you plan to visit."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Catalog" },
        ]}
        actions={
          <>
            <PrimaryLink href="/electronic">Browse e-resources</PrimaryLink>
            <SecondaryLink href="/services">Need help?</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Current scope
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {selectedBranch?.name ?? "No branch selected"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            {selectedBranch?.description ??
              "Choose a branch below to search branch-held catalog resources."}
          </p>
        </div>
      </LibraryHero>

      <LibrarySection
        eyebrow="Search"
        title="Catalog search"
        body="Results come from the Library resources endpoint and reflect current branch-scoped resource records."
        tone="white"
      >
        <form
          action="/catalog"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm xl:grid-cols-[240px_minmax(240px,1fr)_190px_190px_auto] xl:items-end"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="catalog-branch"
            >
              Library branch
            </label>
            <select
              id="catalog-branch"
              name="branch"
              defaultValue={selectedLibraryId}
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {branches.data.length === 0 ? (
                <option value="">No branches available</option>
              ) : null}
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
              htmlFor="catalog-query"
            >
              Search terms
            </label>
            <input
              id="catalog-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Title, author, ISBN, call number, or subject"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="catalog-type"
            >
              Resource type
            </label>
            <select
              id="catalog-type"
              name="type"
              defaultValue={resourceType}
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {resourceTypeOptions.map((option) => (
                <option key={option.value || "all-types"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="catalog-status"
            >
              Availability
            </label>
            <select
              id="catalog-status"
              name="status"
              defaultValue={status}
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all-statuses"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Search catalog
          </button>
        </form>

        {hasFilters ? (
          <div className="mt-4">
            <Link
              href="/catalog"
              className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Clear search and filters
            </Link>
          </div>
        ) : null}

        {resources.error ? (
          <div className="mt-5">
            <StatusMessage tone="error">{resources.error}</StatusMessage>
          </div>
        ) : null}
      </LibrarySection>

      <LibrarySection
        eyebrow="Results"
        title={
          query ? `Catalog results for "${query}"` : "Current catalog records"
        }
        body={resultSummary({
          count: resources.data.length,
          branchName: selectedBranch?.name,
          resourceType,
          status,
        })}
      >
        {resources.data.length === 0 && !resources.error ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <StatusMessage>
              {query
                ? `No catalog resources matched "${query}". Try a different title, author, ISBN, call number, or subject.`
                : "No catalog resources are available for this branch yet."}
            </StatusMessage>
            <SearchTips />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5 lg:grid-cols-2">
              {resources.data.map((resource) => (
                <CatalogCard key={resource.id} resource={resource} />
              ))}
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Results at a glance
                </h2>
                <dl className="mt-5 grid gap-3 text-sm">
                  <SummaryRow label="Returned records" value={resources.data.length} />
                  <SummaryRow label="Available now" value={availableCount} />
                  <SummaryRow label="Loanable" value={loanableCount} />
                  <SummaryRow label="Reference only" value={referenceCount} />
                </dl>
              </section>
              <SearchTips />
              {selectedBranch ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Selected branch
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-slate-950">
                    {selectedBranch.name}
                  </h2>
                  <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                    <Meta label="Location" value={selectedBranch.address} />
                    <Meta label="Phone" value={selectedBranch.phone} />
                    <Meta label="Email" value={selectedBranch.email} />
                  </dl>
                </section>
              ) : null}
            </aside>
          </div>
        )}
      </LibrarySection>
    </main>
  );
}

function CatalogCard({ resource }: { resource: LibraryResource }) {
  const subjects = Array.isArray(resource.subject_tags)
    ? resource.subject_tags.filter(Boolean)
    : [];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {formatLabel(resource.resource_type ?? "resource")}
        </span>
        <span
          className={
            resource.status === "available"
              ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
              : "rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
          }
        >
          {formatLabel(resource.status ?? "status unknown")}
        </span>
        {resource.is_reference_only ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
            Reference only
          </span>
        ) : null}
        {resource.is_loanable === false ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            In-library use
          </span>
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {resource.title}
      </h2>
      {resource.subtitle ? (
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {resource.subtitle}
        </p>
      ) : null}

      <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Meta label="Author" value={resource.authors} />
        <Meta label="Publisher" value={resource.publisher} />
        <Meta label="Year" value={resource.publication_year} />
        <Meta label="Call number" value={resource.call_number} />
        <Meta label="ISBN" value={resource.isbn} />
        <Meta label="ISSN" value={resource.issn} />
        <Meta label="Shelf" value={resource.location_shelf} />
        <Meta
          label="Copies"
          value={`${resource.available_copies ?? 0} of ${
            resource.total_copies ?? 0
          } available`}
        />
      </dl>

      {subjects.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {subjects.slice(0, 5).map((subject) => (
            <span
              key={subject}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {subject}
            </span>
          ))}
        </div>
      ) : null}

      {compactText(resource.description) ? (
        <p className="mt-5 text-sm leading-7 text-slate-600">
          {compactText(resource.description)}
        </p>
      ) : null}
    </article>
  );
}

function SearchTips() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Search tips</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <li>Use shorter phrases when an exact title does not return results.</li>
        <li>Search by author, ISBN, ISSN, call number, publisher, or subject.</li>
        <li>Change the branch selector if the item may be held elsewhere.</li>
      </ul>
      <div className="mt-5">
        <Link
          href="/services#services-heading"
          className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Ask for catalog help
        </Link>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function resultSummary({
  count,
  branchName,
  resourceType,
  status,
}: {
  count: number;
  branchName?: string;
  resourceType: string;
  status: string;
}) {
  const filters = [
    branchName ? `branch: ${branchName}` : null,
    resourceType ? `type: ${formatLabel(resourceType)}` : null,
    status ? `availability: ${formatLabel(status)}` : null,
  ].filter(Boolean);

  return `${count} resource record${
    count === 1 ? "" : "s"
  } returned${filters.length ? ` for ${filters.join(", ")}` : ""}.`;
}

function Meta({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!compactText(value)) return null;

  return (
    <div>
      <dt className="font-semibold text-slate-950">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
