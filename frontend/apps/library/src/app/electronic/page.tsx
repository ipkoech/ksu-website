import type { LibraryElectronicResource } from "@ksu/api-client";
import {
  ExternalAnchor,
  LibraryActionLink,
  LibraryBadge,
  LibraryHero,
  LibrarySection,
  MetricStrip,
  LibraryContentBand,
  LibrarySectionHeading,
  PrimaryLink,
  SearchPanel,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import { LibraryFilterToolbar } from "../../components/library-filter-toolbar";
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
      />

      <LibraryContentBand>
        <SearchPanel>
          <LibrarySectionHeading
            eyebrow="Search"
            title="Find an electronic resource"
            body="Search by database name, provider, subject, access level, or platform type."
          />
        <LibraryFilterToolbar
          actionUrl="/electronic"
          resetHref="/electronic"
          searchValue={query}
          searchPlaceholder="Database, provider, subject, or access type"
          searchLabel="Search Resources"
          selects={[
            {
              name: "type",
              label: "Resource Type",
              value: resourceType,
              options: resourceTypeOptions,
              allLabel: "All types",
            },
            {
              name: "access",
              label: "Audience",
              value: accessLevel,
              options: accessLevelOptions,
              allLabel: "All audiences",
            },
          ]}
          checkbox={{
            name: "featured",
            label: "Featured",
            checked: featuredOnly,
            filterLabel: "Featured only",
          }}
        />
        </SearchPanel>

        {resources.error ? (
          <div className="mt-5">
            <StatusMessage tone="error">{resources.error}</StatusMessage>
          </div>
        ) : null}
      </LibraryContentBand>

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

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          eyebrow="A-Z Listing"
          title={query ? `Results for "${query}"` : "Browse all e-resources"}
          body={resultSummary({
          count: resources.data.length,
          resourceType,
          accessLevel,
          featuredOnly,
          })}
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary/30 hover:text-primary"
            >
              {letter}
            </a>
          ))}
        </div>
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
            <div className="flex flex-col gap-8">
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

            <aside className="flex flex-col gap-5">
              <MetricStrip
                items={[
                  { label: "Returned", value: resources.data.length },
                  { label: "Off campus", value: offCampusCount },
                  { label: "VPN required", value: vpnCount },
                ]}
              />
              <SidePanel title="Remote access" eyebrow="Support">
                <p className="text-sm leading-7 text-slate-600">
                  Some platforms require campus network access, VPN, or a personal account.
                  Use the access notes on each record before opening the provider site.
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {registrationCount} resources require registration.
                </p>
              </SidePanel>
              <AccessHelp />
            </aside>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}

function groupByLetter(items: LibraryElectronicResource[]) {
  const groups = new Map<string, LibraryElectronicResource[]>();
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
  resource: LibraryElectronicResource;
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
        <LibraryBadge>
          {formatLabel(resource.resource_type ?? "database")}
        </LibraryBadge>
        <LibraryBadge tone={resource.requires_vpn ? "secondary" : "primary"}>
          {resource.requires_vpn
            ? "VPN required"
            : formatLabel(resource.access_level ?? "library access")}
        </LibraryBadge>
        {resource.requires_registration ? (
          <LibraryBadge tone="muted">Registration</LibraryBadge>
        ) : null}
        {featured ? (
          <LibraryBadge tone="primary">Featured</LibraryBadge>
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
            <LibraryBadge key={subject}>{subject}</LibraryBadge>
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
      <ul className="mt-4 flex flex-col gap-3 text-sm leading-6 text-slate-600">
        <li>Use your university network or approved off-campus access method.</li>
        <li>Check resource badges for VPN or registration requirements.</li>
        <li>Contact the library team when a subscription link does not open.</li>
      </ul>
      <div className="mt-5">
        <LibraryActionLink href="/services#services-heading">
          Get access support
        </LibraryActionLink>
      </div>
    </section>
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
