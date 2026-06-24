import type { LibraryBranch, LibraryServiceRecord } from "@ksu/api-client";
import {
  IconCard,
  ExternalAnchor,
  LibraryBadge,
  LibraryHero,
  LibrarySection,
  PillNav,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryServicesData,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Library Services",
  description:
    "Kisii University Library branches, contacts, regulations, and service information.",
};

export const dynamic = "force-dynamic";

type PublishedService = LibraryServiceRecord & {
  branch: LibraryBranch;
};

export default async function LibraryServicesPage() {
  const { branches, groupedServices, regulations, errors } =
    await getLibraryServicesData();
  const allServices: PublishedService[] = groupedServices.flatMap(
    ({ branch, services }) =>
      services.map((service) => ({ ...service, branch })),
  );
  const serviceTypes = summarizeServices(allServices);
  const branchContacts = branches.data
    .filter((branch) => branch.phone || branch.email || branch.address)
    .slice(0, 4);
  const featuredRegulations = regulations.data.slice(0, 3);
  const supportService = allServices.find((item) =>
    ["reference", "training", "inter_library_loan"].includes(
      String(item.service_type ?? ""),
    ),
  );

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Library Services"
        title="Branch contacts, borrowing guidance, and library support."
        body="Use this page to identify the right branch, understand available services, review active regulations, and reach official support channels."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Services" },
        ]}
        actions={
          <>
            <PrimaryLink href="/catalog">Search catalog</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Public branches
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{branches.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Branch records with contacts and service listings.
          </p>
        </div>
      </LibraryHero>

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
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
        title="Common service journeys"
        body="Use these entry points for the library support tasks students, staff, and researchers usually need first."
        tone="white"
      >
        <div className="mb-6">
          <PillNav
            items={[
              { label: "Service snapshot", href: "#service-snapshot" },
              { label: "Branches", href: "#branches-heading" },
              { label: "Support areas", href: "#services-heading" },
              { label: "Regulations", href: "#regulations-heading" },
            ]}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <IconCard
            icon="book"
            title="Borrowing and circulation"
            body="Review borrowing support, item access, branch contacts, and active rules before visiting a service desk."
            href="#services-heading"
            action="View services"
          />
          <IconCard
            icon="file"
            title="Printing and scanning"
            body="Find branch services for document handling, copies, scans, and related service contacts."
            href="#services-heading"
            action="Find branch support"
          />
          <IconCard
            icon="help"
            title="Research help"
            body="Use reference support, training, and inter-library loan services for research and academic work."
            href="/ask"
            action="Ask a librarian"
          />
          <IconCard
            icon="shield"
            title="Rules and guidance"
            body="Read active access, conduct, borrowing, and fee guidance before using library services."
            href="#regulations-heading"
            action="Read regulations"
          />
        </div>
      </LibrarySection>

      <LibrarySection
        eyebrow="Service Snapshot"
        title="What support is currently published"
        body="A quick summary of service records, branch contacts, and active regulations available to library users."
      >
        <div id="service-snapshot" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Public branches" value={branches.data.length} />
            <SummaryCard label="Published services" value={allServices.length} />
            <SummaryCard
              label="Active regulations"
              value={regulations.data.length}
            />
          </div>
          <SidePanel title="Best starting point" eyebrow="Service route">
            <h3 className="text-lg font-semibold text-slate-950">
              {supportService?.name ?? "Contact a branch desk"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {compactText(supportService?.description) ||
                "Use the branch cards below to identify the most relevant library desk for service support."}
            </p>
            <dl className="mt-5 grid gap-3 text-sm text-slate-600">
              <Meta
                label="Branch"
                value={supportService?.branch?.name ?? branches.data[0]?.name}
              />
              <Meta label="Contact" value={supportService?.contact_info} />
              <Meta
                label="How to access"
                value={supportService?.how_to_access}
              />
            </dl>
          </SidePanel>
        </div>
      </LibrarySection>

      {serviceTypes.length > 0 ? (
        <LibrarySection
          eyebrow="Service Areas"
          title="Support categories across branches"
          body="Service categories help users scan the page before choosing a branch."
          tone="white"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {serviceTypes.map((item) => (
              <SummaryCard
                key={item.label}
                label={item.label}
                value={item.count}
                body={`${item.count} published service${
                  item.count === 1 ? "" : "s"
                }`}
              />
            ))}
          </div>
        </LibrarySection>
      ) : null}

      {branchContacts.length > 0 ? (
        <LibrarySection
          eyebrow="Contact Points"
          title="Branch contacts for service support"
          body="Use these public contacts when you need service confirmation before visiting a branch."
          tone="white"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {branchContacts.map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(branch.library_type ?? "library")}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                  {branch.name}
                </h3>
                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <Meta label="Phone" value={branch.phone} />
                  <Meta label="Email" value={branch.email} />
                  <Meta label="Location" value={branch.address} />
                </dl>
              </article>
            ))}
          </div>
        </LibrarySection>
      ) : null}

      <LibrarySection
        eyebrow="Branches"
        title="Library branches and contacts"
        body="Branch records are maintained in the Library service and reused across the public and admin interfaces."
        tone="white"
      >
        <div id="branches-heading" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5 lg:grid-cols-2">
          {branches.data.length === 0 && !branches.error ? (
            <StatusMessage>No public library branches are available yet.</StatusMessage>
          ) : (
            branches.data.map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <LibraryBadge>
                    {formatLabel(branch.library_type ?? "library")}
                  </LibraryBadge>
                  {branch.is_public ? (
                    <LibraryBadge tone="primary">Public</LibraryBadge>
                  ) : null}
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                  {branch.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(branch.description) ||
                    "Branch details are being updated by the library team."}
                </p>
                <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <Meta label="Address" value={branch.address} />
                  <Meta label="Phone" value={branch.phone} />
                  <Meta label="Email" value={branch.email} />
                  <Meta label="Short name" value={branch.short_name} />
                </dl>
                {safeExternalUrl(branch.website_url) ? (
                  <div className="mt-6">
                    <ExternalAnchor href={safeExternalUrl(branch.website_url)!}>
                      Open branch site
                    </ExternalAnchor>
                  </div>
                ) : null}
              </article>
            ))
          )}
          </div>
          <SidePanel title="Branch map" eyebrow="Library network">
            <div className="aspect-[4/3] rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-950">Kisii University Library Network</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Map coordinates can be connected when branch location data is published.
                  </p>
                </div>
              </div>
            </div>
          </SidePanel>
        </div>
      </LibrarySection>

      <LibrarySection
        eyebrow="Support Areas"
        title="Services by branch"
        body="These are branch-scoped service records, including borrowing, printing, scanning, reference support, inter-library loan, and training."
      >
        <div id="services-heading" className="flex flex-col gap-8">
          {groupedServices.length === 0 && !branches.error ? (
            <StatusMessage>No branch services are available yet.</StatusMessage>
          ) : (
            groupedServices.map(({ branch, services }) => (
              <section key={branch.id} aria-labelledby={`services-${branch.id}`}>
                <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                      Branch services
                    </p>
                    <h2
                      id={`services-${branch.id}`}
                      className="mt-1 text-2xl font-semibold text-slate-950"
                    >
                      {branch.name}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {services.length} service{services.length === 1 ? "" : "s"}
                  </p>
                </div>
                {services.length === 0 ? (
                  <StatusMessage>
                    No public service records are published for this branch yet.
                  </StatusMessage>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service) => (
                      <article
                        key={service.id}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                          {formatLabel(service.service_type ?? "service")}
                        </p>
                        <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                          {service.name ?? "Library service"}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {compactText(service.description) ||
                            "Contact the branch desk for service details."}
                        </p>
                        <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                          <Meta label="Branch" value={branch.name} />
                          <Meta label="Eligibility" value={service.eligibility} />
                          <Meta
                            label="How to access"
                            value={service.how_to_access}
                          />
                          <Meta label="Contact" value={service.contact_info} />
                        </dl>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </LibrarySection>

      <LibrarySection
        eyebrow="Regulations"
        title="Active library rules and guidance"
        body="Use active regulations to understand borrowing, access, conduct, and fee expectations."
        tone="white"
      >
        <div id="regulations-heading" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          {regulations.data.length === 0 && !regulations.error ? (
            <StatusMessage>No active library regulations are available yet.</StatusMessage>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {regulations.data.map((regulation) => (
                <article
                  key={regulation.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {formatLabel(regulation.category ?? "regulation")}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    {regulation.title ?? "Library regulation"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {compactText(regulation.content) ||
                      "Regulation details are being updated."}
                  </p>
                </article>
              ))}
            </div>
          )}
          <aside className="flex flex-col gap-5">
            <SidePanel title="Before you visit">
              <ul className="flex flex-col gap-3 text-sm leading-6 text-slate-600">
                <li>Confirm the branch that offers the service you need.</li>
                <li>Check eligibility and access notes on the service card.</li>
                <li>Use active regulations for borrowing, conduct, and fee guidance.</li>
              </ul>
            </SidePanel>
            {featuredRegulations.length > 0 ? (
              <SidePanel title="Key regulations">
                <div className="divide-y divide-slate-200">
                  {featuredRegulations.map((regulation) => (
                    <article key={regulation.id} className="py-3 first:pt-0">
                      <p className="text-sm font-semibold text-slate-950">
                        {regulation.title ?? "Library regulation"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {formatLabel(regulation.category ?? "regulation")}
                      </p>
                    </article>
                  ))}
                </div>
              </SidePanel>
            ) : null}
          </aside>
        </div>
      </LibrarySection>
    </main>
  );
}

function summarizeServices(services: PublishedService[]) {
  const counts = new Map<string, number>();
  for (const service of services) {
    const key = formatLabel(service.service_type ?? "other");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function SummaryCard({
  label,
  value,
  body,
}: {
  label: string;
  value: string | number;
  body?: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{value}</p>
      {body ? <p className="mt-2 text-sm text-slate-600">{body}</p> : null}
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
