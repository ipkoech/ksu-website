import Link from "next/link";
import type { LibraryResource } from "@ksu/api-client";
import {
  CompactRecord,
  LibraryActionLink,
  LibraryHero,
  MetricStrip,
  LibraryContentBand,
  LibrarySectionHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import { LibraryFilterToolbar } from "../../components/library-filter-toolbar";
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
      />

      <LibraryContentBand>
        <LibraryFilterToolbar
          actionUrl="/catalog"
          resetHref="/catalog"
          searchValue={query}
          searchPlaceholder="Title, author, ISBN, call number, or subject"
          searchLabel="Search Terms"
          selects={[
            {
              name: "branch",
              label: "Library Branch",
              value: selectedLibraryId,
              options: branches.data.map((branch) => ({ value: branch.id, label: branch.name })),
              allLabel: branches.data.length === 0 ? "No branches available" : "All branches",
            },
            {
              name: "type",
              label: "Resource Type",
              value: resourceType,
              options: resourceTypeOptions,
              allLabel: "All types",
            },
            {
              name: "status",
              label: "Availability",
              value: status,
              options: statusOptions,
              allLabel: "All statuses",
            },
          ]}
        />

        {resources.error ? (
          <div className="mt-5">
            <StatusMessage tone="error">{resources.error}</StatusMessage>
          </div>
        ) : null}
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          eyebrow="Results"
          title={query ? `Catalog results for "${query}"` : "Current catalog records"}
          body={resultSummary({
            count: resources.data.length,
            branchName: selectedBranch?.name,
            resourceType,
            status,
          })}
        />
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
          <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
            <SidePanel title="Refine results" eyebrow="Filters">
              <div className="flex flex-col gap-3 text-sm leading-6 text-slate-600">
                <p>Branch: {selectedBranch?.name ?? "All branches"}</p>
                <p>Type: {resourceType ? formatLabel(resourceType) : "All types"}</p>
                <p>Status: {status ? formatLabel(status) : "All statuses"}</p>
                <Link href="/ask" className="inline-flex text-sm font-semibold text-primary">
                  Ask for catalog help
                </Link>
              </div>
            </SidePanel>
            <div className="grid gap-4">
              {resources.data.map((resource) => (
                <CatalogCard key={resource.id} resource={resource} />
              ))}
            </div>

            <aside className="flex flex-col gap-5">
              <MetricStrip
                items={[
                  { label: "Available now", value: availableCount },
                  { label: "Loanable", value: loanableCount },
                  { label: "Reference only", value: referenceCount },
                ]}
              />
              <SearchTips />
              {selectedBranch ? (
                <SidePanel title={selectedBranch.name} eyebrow="Selected branch">
                  <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                    <Meta label="Location" value={selectedBranch.address} />
                    <Meta label="Phone" value={selectedBranch.phone} />
                    <Meta label="Email" value={selectedBranch.email} />
                  </dl>
                </SidePanel>
              ) : null}
            </aside>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}

function CatalogCard({ resource }: { resource: LibraryResource }) {
  return (
    <CompactRecord
      icon="book"
      eyebrow={formatLabel(resource.resource_type ?? "resource")}
      title={resource.title}
      body={compactText(resource.description) || resource.subtitle}
      meta={[
        resource.authors,
        resource.publisher,
        resource.publication_year,
        resource.call_number,
        resource.location_shelf,
        `${resource.available_copies ?? 0} of ${resource.total_copies ?? 0} available`,
        formatLabel(resource.status ?? "status unknown"),
        resource.is_reference_only ? "Reference only" : null,
        resource.is_loanable === false ? "In-library use" : null,
      ]}
    />
  );
}

function SearchTips() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Search tips</h2>
      <ul className="mt-4 flex flex-col gap-3 text-sm leading-6 text-slate-600">
        <li>Use shorter phrases when an exact title does not return results.</li>
        <li>Search by author, ISBN, ISSN, call number, publisher, or subject.</li>
        <li>Change the branch selector if the item may be held elsewhere.</li>
      </ul>
      <div className="mt-5">
        <LibraryActionLink href="/services#services-heading">
          Ask for catalog help
        </LibraryActionLink>
      </div>
    </section>
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
