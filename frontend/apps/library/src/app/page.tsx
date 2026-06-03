import {
  IconCard,
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryOverviewData,
} from "../lib/library-public-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { branches, catalog, electronic, services, regulations, stats, errors } =
    await getLibraryOverviewData();
  const topStats = stats?.stats?.slice(0, 4) ?? [];

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
            <SecondaryLink href="/electronic">Browse e-resources</SecondaryLink>
          </>
        }
      >
        <div className="grid gap-3 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Library snapshot
          </p>
          {topStats.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {topStats.map((item) => (
                <div
                  key={item.key}
                  className="rounded-md border border-white/15 bg-white/10 p-4"
                >
                  <p className="text-3xl font-bold">
                    {item.value}
                    {item.suffix}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-white/75">
              Branch, catalog, and e-resource statistics appear here when the
              Library API is available.
            </p>
          )}
        </div>
      </LibraryHero>

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
        eyebrow="Branches"
        title="Library access points"
        body="Public branch records are served directly from the Library API."
      >
        {branches.data.length === 0 && !branches.error ? (
          <StatusMessage>No public library branches are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {branches.data.slice(0, 6).map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(branch.library_type ?? "library")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  {branch.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(branch.description) ||
                    "Branch information is being updated by the library team."}
                </p>
                <dl className="mt-5 grid gap-2 text-sm text-slate-600">
                  {branch.address ? (
                    <div>
                      <dt className="font-semibold text-slate-900">Location</dt>
                      <dd>{branch.address}</dd>
                    </div>
                  ) : null}
                  {branch.email ? (
                    <div>
                      <dt className="font-semibold text-slate-900">Email</dt>
                      <dd>{branch.email}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        )}
      </LibrarySection>

      <LibrarySection
        eyebrow="Latest Records"
        title="What is currently published"
        body="Seeded and API-backed records below help the Library interface stay testable as the service grows."
        tone="white"
      >
        <div className="grid gap-5 xl:grid-cols-3">
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
            {[...services.data.slice(0, 2), ...regulations.data.slice(0, 2)].map(
              (item) => (
                <RecordRow
                  key={item.id}
                  title={item.title ?? item.name ?? "Library record"}
                  meta={[
                    formatLabel(item.service_type ?? item.category),
                    formatLabel(item.status),
                  ]}
                />
              ),
            )}
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <a href={href} className="text-sm font-semibold text-primary">
          Open
        </a>
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {children || (
          <p className="py-4 text-sm text-slate-600">No records available.</p>
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
      <h4 className="text-sm font-semibold leading-6 text-slate-950">{title}</h4>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {details.join(" · ")}
        </p>
      ) : null}
    </article>
  );
}
