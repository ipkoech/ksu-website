import Link from "next/link";
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
    type?: string;
    access?: string;
    featured?: string;
  }>;
};

const resourceTypeOptions = [
  { label: "All types", value: "" },
  { label: "Databases", value: "database" },
  { label: "E-book platforms", value: "ebook_platform" },
  { label: "E-journal aggregators", value: "ejournal_aggregator" },
  { label: "News", value: "news" },
  { label: "Reference", value: "reference" },
  { label: "Other", value: "other" },
];

const accessLevelOptions = [
  { label: "All audiences", value: "" },
  { label: "All users", value: "all" },
  { label: "Students", value: "students" },
  { label: "Staff", value: "staff" },
  { label: "Postgraduate", value: "postgraduate" },
  { label: "Academic staff", value: "academic_staff" },
];

export default async function ElectronicResourcesPage({
  searchParams,
}: ElectronicResourcesPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const resourceType = params.type?.trim() ?? "";
  const accessLevel = params.access?.trim() ?? "";
  const featuredOnly = params.featured === "true";
  const resources = await getElectronicResources(query, {
    resourceType,
    accessLevel,
    featured: featuredOnly || undefined,
  });
  const featured = resources.data.filter((item) => item.is_featured).slice(0, 3);
  const grouped = groupByLetter(resources.data);
  const vpnCount = resources.data.filter((item) => item.requires_vpn).length;
  const registrationCount = resources.data.filter(
    (item) => item.requires_registration,
  ).length;
  const offCampusCount = resources.data.filter(
    (item) => item.access_type === "off_campus" || item.access_type === "both",
  ).length;
  const hasFilters = Boolean(query || resourceType || accessLevel || featuredOnly);

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
        body="Search by database name, provider, subject, access level, or platform type."
        tone="white"
      >
        <form
          action="/electronic"
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto_auto] xl:items-end"
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

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-900"
              htmlFor="electronic-type"
            >
              Resource type
            </label>
            <select
              id="electronic-type"
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
              htmlFor="electronic-access"
            >
              Audience
            </label>
            <select
              id="electronic-access"
              name="access"
              defaultValue={accessLevel}
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {accessLevelOptions.map((option) => (
                <option key={option.value || "all-access"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={featuredOnly}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-ring"
            />
            Featured only
          </label>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Search resources
          </button>
        </form>

        {hasFilters ? (
          <div className="mt-4">
            <Link
              href="/electronic"
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
        body={resultSummary({
          count: resources.data.length,
          resourceType,
          accessLevel,
          featuredOnly,
        })}
        tone="white"
      >
        {resources.data.length === 0 && !resources.error ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <StatusMessage>
              {query
                ? `No electronic resources matched "${query}". Try a database name, provider, subject area, or broader filter.`
                : "No electronic resources are available yet."}
            </StatusMessage>
            <AccessHelp />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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

            <aside className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Access at a glance
                </h2>
                <dl className="mt-5 grid gap-3 text-sm">
                  <SummaryRow label="Returned resources" value={resources.data.length} />
                  <SummaryRow label="Off-campus access" value={offCampusCount} />
                  <SummaryRow label="VPN required" value={vpnCount} />
                  <SummaryRow
                    label="Registration required"
                    value={registrationCount}
                  />
                </dl>
              </section>
              <AccessHelp />
            </aside>
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
  const notes = compactText(resource.notes);

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
        {featured ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Featured
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
        <Meta label="Audience" value={formatLabel(resource.access_level)} />
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
      {notes ? (
        <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          {notes}
        </p>
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

function AccessHelp() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Access help</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <li>Use your university network or approved off-campus access method.</li>
        <li>Check resource badges for VPN or registration requirements.</li>
        <li>Contact the library team when a subscription link does not open.</li>
      </ul>
      <div className="mt-5">
        <Link
          href="/services#services-heading"
          className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Get access support
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
  resourceType,
  accessLevel,
  featuredOnly,
}: {
  count: number;
  resourceType: string;
  accessLevel: string;
  featuredOnly: boolean;
}) {
  const filters = [
    resourceType ? `type: ${formatLabel(resourceType)}` : null,
    accessLevel ? `audience: ${formatLabel(accessLevel)}` : null,
    featuredOnly ? "featured resources" : null,
  ].filter(Boolean);

  return `${count} electronic resource record${
    count === 1 ? "" : "s"
  } available${filters.length ? ` for ${filters.join(", ")}` : ""}.`;
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
