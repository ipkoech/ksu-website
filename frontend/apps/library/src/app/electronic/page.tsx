import type { LibraryElectronicResource } from "@ksu/api-client";
import {
  LibraryHero,
  LibraryContentBand,
  LibrarySectionHeading,
  PrimaryLink,
  SearchPanel,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import { LibraryFilterToolbar } from "../../components/library-filter-toolbar";
import { pageFromSearchParams } from "@ksu/ui/components";
import {
  getElectronicResources,
  getLibraryDownloadsData,
  getLibraryLinksData,
} from "../../lib/library-public-data";
import { ElectronicResourcesDisplay } from "./electronic-resources-display";

export const metadata = {
  title: "Electronic Resources",
  description:
    "Browse Kisii University Library databases and electronic resources.",
};

export const revalidate = 300;

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
  const page = pageFromSearchParams(params);
  const [resources, linksData, downloadsData] = await Promise.all([
    getElectronicResources(query, {
      resourceType,
      accessLevel,
      featured: featuredOnly || undefined,
      page,
    }),
    getLibraryLinksData(),
    getLibraryDownloadsData(),
  ]);
  const externalLinks = linksData.groupedLinks
    .flatMap(({ branch, links }) => links.map((link) => ({ ...link, branch })))
    .filter((link) =>
      ["repository", "opac", "myloft", "database", "ejournal"].includes(
        link.link_type,
      ),
    );
  const downloadFiles = downloadsData.groupedFiles.flatMap(({ branch, files }) =>
    files.map((file) => ({ ...file, branch })),
  );
  const featured = resources.data.filter((item) => item.is_featured).slice(0, 3);
  const grouped = groupByLetter(resources.data);
  const vpnCount = resources.data.filter((item) => item.requires_vpn).length;
  const registrationCount = resources.data.filter(
    (item) => item.requires_registration,
  ).length;
  const offCampusCount = resources.data.filter(
    (item) => item.access_type === "off_campus" || item.access_type === "both",
  ).length;
  const totalPages = resources.meta
    ? Math.ceil(resources.meta.total / resources.meta.per_page)
    : 1;
  const electronicBaseHref = buildBaseHref("/electronic", params);

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <LibraryHero
        imageSrc="/images/library/shelves.jpg"
        imageAlt="Rows of shelved books in the Kisii University Library"
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

      <ElectronicResourcesDisplay
        resources={resources.data}
        featured={featured}
        grouped={grouped}
        externalLinks={externalLinks}
        downloadFiles={downloadFiles}
        query={query}
        resourceType={resourceType}
        accessLevel={accessLevel}
        featuredOnly={featuredOnly}
        offCampusCount={offCampusCount}
        vpnCount={vpnCount}
        registrationCount={registrationCount}
        page={page}
        totalPages={totalPages}
        total={resources.meta?.total ?? resources.data.length}
        perPage={resources.meta?.per_page ?? 100}
        baseHref={electronicBaseHref}
      />
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

function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function buildBaseHref(
  path: string,
  params: Record<string, string | string[] | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    if (typeof value === "string" && value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
