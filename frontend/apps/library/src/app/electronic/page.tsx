import {
  ExternalAnchor,
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getElectronicResources,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Electronic Resources",
  description:
    "Browse Kisii University Library databases and electronic resources.",
};

export const dynamic = "force-dynamic";

type ElectronicResourcesPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function ElectronicResourcesPage({
  searchParams,
}: ElectronicResourcesPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const resources = await getElectronicResources(query);
  const featured = resources.data.filter((item) => item.is_featured).slice(0, 3);
  const grouped = groupByLetter(resources.data);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Electronic Resources"
        title="Access databases, e-books, journals, and research tools."
        body="Browse the A-Z list of subscribed and recommended electronic resources. Records include provider, access conditions, registration notes, VPN requirements, and direct access links."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Electronic Resources" },
        ]}
        actions={
          <>
            <PrimaryLink href="/catalog">Search print catalog</PrimaryLink>
            <SecondaryLink href="/services">Access support</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            E-resource records
          </p>
          <p className="mt-3 text-5xl font-bold">{resources.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Active databases and online platforms returned by the Library API.
          </p>
        </div>
      </LibraryHero>

      <LibrarySection
        eyebrow="Search"
        title="Find an electronic resource"
        body="Search by database name, provider, subject, or access requirement."
        tone="white"
      >
        <form
          action="/electronic"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="electronic-query"
            >
              Search resources
            </label>
            <input
              id="electronic-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Database, provider, subject, or access type"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Search resources
          </button>
        </form>

        {resources.error ? (
          <div className="mt-5">
            <StatusMessage tone="error">{resources.error}</StatusMessage>
          </div>
        ) : null}
      </LibrarySection>

      {featured.length > 0 ? (
        <LibrarySection
          eyebrow="Featured"
          title="Frequently used platforms"
          body="These resources are marked as featured by the library team."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {featured.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} featured />
            ))}
          </div>
        </LibrarySection>
      ) : null}

      <LibrarySection
        eyebrow="A-Z Listing"
        title={query ? `Results for "${query}"` : "Browse all e-resources"}
        body={`${resources.data.length} electronic resource record${
          resources.data.length === 1 ? "" : "s"
        } available.`}
        tone="white"
      >
        {resources.data.length === 0 && !resources.error ? (
          <StatusMessage>
            {query
              ? `No electronic resources matched "${query}". Try a database name, provider, or subject area.`
              : "No electronic resources are available yet."}
          </StatusMessage>
        ) : (
          <div className="space-y-8">
            {grouped.map(([letter, items]) => (
              <section key={letter} aria-labelledby={`letter-${letter}`}>
                <h2
                  id={`letter-${letter}`}
                  className="mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-950"
                >
                  {letter}
                </h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {items.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </LibrarySection>
    </main>
  );
}

function groupByLetter(items: Record<string, any>[]) {
  const groups = new Map<string, Record<string, any>[]>();
  for (const item of items) {
    const letter =
      compactText(item.section_letter || item.name?.charAt(0) || "#")
        .charAt(0)
        .toUpperCase() || "#";
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function ResourceCard({
  resource,
  featured = false,
}: {
  resource: Record<string, any>;
  featured?: boolean;
}) {
  const accessUrl = safeExternalUrl(resource.access_url);
  const subjects = Array.isArray(resource.subjects) ? resource.subjects : [];

  return (
    <article
      className={
        featured
          ? "rounded-lg border border-primary/30 bg-white p-5 shadow-sm"
          : "rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {formatLabel(resource.resource_type ?? "database")}
        </span>
        <span
          className={
            resource.requires_vpn
              ? "rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white"
              : "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
          }
        >
          {resource.requires_vpn
            ? "VPN required"
            : formatLabel(resource.access_level ?? "library access")}
        </span>
        {resource.requires_registration ? (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            Registration
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {resource.name ?? "Untitled resource"}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(resource.description) ||
          compactText(resource.provider) ||
          "Access details are managed by the library team."}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Meta label="Provider" value={resource.provider} />
        <Meta label="Access" value={formatLabel(resource.access_type)} />
        <Meta label="Coverage" value={resource.coverage_dates} />
        <Meta label="Users" value={resource.simultaneous_users} />
      </dl>
      {subjects.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {subjects.slice(0, 5).map((subject: string) => (
            <span
              key={subject}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {subject}
            </span>
          ))}
        </div>
      ) : null}
      {accessUrl ? (
        <div className="mt-6">
          <ExternalAnchor href={accessUrl}>Open resource</ExternalAnchor>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          Access link pending library verification.
        </p>
      )}
    </article>
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
