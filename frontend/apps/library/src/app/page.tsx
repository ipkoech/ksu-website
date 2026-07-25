import { Children } from "react";
import {
  CompactRecord,
  IconCard,
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryOverviewData,
} from "../lib/library-public-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { branches, catalog, electronic, services, regulations, errors } =
    await getLibraryOverviewData();
  const primaryBranch = branches.data[0];
  const branchContacts = branches.data
    .filter((branch) => branch.phone || branch.email || branch.address)
    .slice(0, 3);
  const featuredElectronic = electronic.data
    .filter((item) => item.is_featured)
    .slice(0, 3);
  const missionItems = [
    { label: "Mission", value: primaryBranch?.mission },
    { label: "Vision", value: primaryBranch?.vision },
    { label: "Objectives", value: primaryBranch?.objectives },
  ].filter((item) => compactText(item.value));
  const supportRows = [
    ...services.data.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.name ?? "Library service",
      meta: [formatLabel(item.service_type), "Service"],
    })),
    ...regulations.data.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.title ?? "Library regulation",
      meta: [formatLabel(item.category), formatLabel(item.status)],
    })),
  ];

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Kisii University Library"
        title="Search, access, borrow, and get research support from one place."
        body="Use the library portal to find branch services, print collections, electronic databases, guides, regulations, and the right support channel for your study or research task."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library" }]}
        actions={
          <>
            <PrimaryLink href="/catalog">Search catalog</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
          </>
        }
      />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <LibrarySection
        eyebrow="Start Here"
        title="Core library workflows"
        body="The Library portal is organized around the tasks students, staff, and researchers repeat most often."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <IconCard
            icon="search"
            title="Search the catalog"
            body="Find books, journals, theses, reports, and other branch-held resources by title, author, publisher, or subject."
            href="/catalog"
            action="Open catalog"
          />
          <IconCard
            icon="database"
            title="Use e-resources"
            body="Access subscribed databases, e-book platforms, reference collections, and off-campus access notes."
            href="/electronic"
            action="Browse databases"
          />
          <IconCard
            icon="building"
            title="Find branch services"
            body="Check library branches, contacts, borrowing support, training, printing, scanning, and help channels."
            href="/services"
            action="View services"
          />
          <IconCard
            icon="shield"
            title="Read regulations"
            body="Review active library conduct, borrowing, access, and fee guidance before using branch services."
            href="/services#regulations-heading"
            action="Read rules"
          />
        </div>
      </LibrarySection>

      <LibrarySection
        eyebrow="Quick Access"
        title="Go straight to the resource you need"
        body="These entry points keep common library journeys visible without changing the current public site design system."
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-5 md:grid-cols-2">
            <IconCard
              icon="book"
              title="New and current records"
              body="Start with recently published catalog records, active databases, and branch services maintained by the library team."
              href="#latest-records"
              action="View records"
            />
            <IconCard
              icon="help"
              title="Ask for support"
              body="Send a question to the library team for catalog, access, borrowing, research, or training support."
              href="/ask"
              action="Ask a librarian"
            />
          </div>
          <SidePanel title="Library contact point" eyebrow="Support desk">
            <h3 className="text-xl font-semibold text-foreground">
              {primaryBranch?.name ?? "Kisii University Library"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {compactText(primaryBranch?.description) ||
                "Branch and service information is maintained by the library team."}
            </p>
            <dl className="mt-5 grid gap-3 text-sm text-muted-foreground">
              <Meta label="Location" value={primaryBranch?.address} />
              <Meta label="Phone" value={primaryBranch?.phone} />
              <Meta label="Email" value={primaryBranch?.email} />
            </dl>
          </SidePanel>
        </div>
      </LibrarySection>

      {missionItems.length > 0 ? (
        <LibrarySection
          eyebrow="Library Direction"
          title="How the library supports teaching, learning, and research"
          body="The overview surfaces branch-level mission and planning content when it has been published by the library team."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {missionItems.map((item) => (
              <CompactRecord
                key={item.label}
                icon="library"
                eyebrow={item.label}
                title={`Library ${item.label.toLowerCase()}`}
                body={compactText(item.value)}
              />
            ))}
          </div>
        </LibrarySection>
      ) : null}

      <LibrarySection
        eyebrow="Branches"
        title="Library access points"
        body="Public branch records show the access points available to students, staff, researchers, and visitors."
      >
        {branches.data.length === 0 && !branches.error ? (
          <StatusMessage>No public library branches are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {branches.data.slice(0, 6).map((branch) => (
              <CompactRecord
                key={branch.id}
                icon="building"
                eyebrow={formatLabel(branch.library_type ?? "library")}
                title={branch.name ?? "Library branch"}
                body={
                  compactText(branch.description) ||
                  "Branch information is being updated by the library team."
                }
                meta={[branch.address, branch.phone, branch.email]}
              />
            ))}
          </div>
        )}
      </LibrarySection>

      {featuredElectronic.length > 0 || branchContacts.length > 0 ? (
        <LibrarySection
          eyebrow="Featured Access"
          title="Frequently used access points"
          body="A compact overview of featured platforms and branch contact points."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <OverviewList
              title="Featured e-resources"
              empty="No featured electronic resources are published yet."
            >
              {featuredElectronic.map((item) => (
                <RecordRow
                  key={item.id}
                  title={item.name ?? "Untitled resource"}
                  meta={[
                    item.provider,
                    formatLabel(item.resource_type),
                    formatLabel(item.access_type),
                  ]}
                />
              ))}
            </OverviewList>
            <OverviewList
              title="Branch contacts"
              empty="Branch contact details are being updated."
            >
              {branchContacts.map((branch) => (
                <RecordRow
                  key={branch.id}
                  title={branch.name}
                  meta={[branch.phone, branch.email, branch.address]}
                />
              ))}
            </OverviewList>
          </div>
        </LibrarySection>
      ) : null}

      <LibrarySection
        eyebrow="Latest Records"
        title="What is currently published"
        body="Recently published library records help users move from discovery to access without leaving the public portal."
        tone="white"
      >
        <div id="latest-records" className="grid gap-5 xl:grid-cols-3">
          <RecordPanel title="Catalog highlights" href="/catalog">
            {catalog.data.slice(0, 4).map((item) => (
              <RecordRow
                key={item.id}
                title={item.title}
                meta={[
                  item.authors,
                  formatLabel(item.resource_type),
                  item.status,
                ]}
              />
            ))}
          </RecordPanel>
          <RecordPanel title="Electronic resources" href="/electronic">
            {electronic.data.slice(0, 4).map((item) => (
              <RecordRow
                key={item.id}
                title={item.name ?? "Untitled resource"}
                meta={[
                  item.provider,
                  formatLabel(item.resource_type),
                  formatLabel(item.access_type),
                ]}
              />
            ))}
          </RecordPanel>
          <RecordPanel title="Support and rules" href="/services">
            {supportRows.map((item) => (
              <RecordRow key={item.id} title={item.title} meta={item.meta} />
            ))}
          </RecordPanel>
        </div>
      </LibrarySection>
    </main>
  );
}

function RecordPanel({
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
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <a href={href} className="text-sm font-semibold text-primary">
          Open
        </a>
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

function OverviewList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-4 divide-y divide-slate-200">
        {Children.count(children) > 0 ? (
          children
        ) : (
          <p className="py-4 text-sm text-muted-foreground">{empty}</p>
        )}
      </div>
    </section>
  );
}

function RecordRow({
  title,
  meta,
}: {
  title: string;
  meta: Array<string | number | null | undefined>;
}) {
  const details = meta.map(compactText).filter(Boolean);

  return (
    <article className="py-4">
      <h4 className="text-sm font-semibold leading-6 text-foreground">{title}</h4>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {details.join(" · ")}
        </p>
      ) : null}
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
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
