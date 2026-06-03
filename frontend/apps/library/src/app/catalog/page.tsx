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
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const { branches, resources, selectedLibraryId, query } =
    await getCatalogSearchData({
      libraryId: params.branch,
      query: params.q,
    });
  const selectedBranch = branches.data.find(
    (branch) => branch.id === selectedLibraryId,
  );

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
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-end"
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
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Search catalog
          </button>
        </form>

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
        body={`${resources.data.length} resource record${
          resources.data.length === 1 ? "" : "s"
        } returned for the selected branch.`}
      >
        {resources.data.length === 0 && !resources.error ? (
          <StatusMessage>
            {query
              ? `No catalog resources matched "${query}". Try a different title, author, ISBN, or subject.`
              : "No catalog resources are available for this branch yet."}
          </StatusMessage>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {resources.data.map((resource) => (
              <article
                key={resource.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
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
                  <Meta
                    label="Copies"
                    value={`${resource.available_copies ?? 0} of ${
                      resource.total_copies ?? 0
                    } available`}
                  />
                </dl>
                {compactText(resource.description) ? (
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {compactText(resource.description)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </LibrarySection>
    </main>
  );
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
