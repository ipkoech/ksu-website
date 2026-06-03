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
  getLibraryServicesData,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Library Services",
  description:
    "Kisii University Library branches, contacts, regulations, and service information.",
};

export const dynamic = "force-dynamic";

export default async function LibraryServicesPage() {
  const { branches, groupedServices, regulations, errors } =
    await getLibraryServicesData();

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
            <SecondaryLink href="/electronic">Open e-resources</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Public branches
          </p>
          <p className="mt-3 text-5xl font-bold">{branches.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Branch records with contacts and service listings.
          </p>
        </div>
      </LibraryHero>

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px] space-y-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <LibrarySection
        eyebrow="Branches"
        title="Library branches and contacts"
        body="Branch records are maintained in the Library service and reused across the public and admin interfaces."
        tone="white"
      >
        <div id="branches-heading" className="grid gap-5 lg:grid-cols-2">
          {branches.data.length === 0 && !branches.error ? (
            <StatusMessage>No public library branches are available yet.</StatusMessage>
          ) : (
            branches.data.map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatLabel(branch.library_type ?? "library")}
                  </span>
                  {branch.is_public ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      Public
                    </span>
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
      </LibrarySection>

      <LibrarySection
        eyebrow="Support Areas"
        title="Services by branch"
        body="These are branch-scoped service records, including borrowing, printing, scanning, reference support, inter-library loan, and training."
      >
        <div id="services-heading" className="space-y-8">
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
        <div id="regulations-heading">
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
        </div>
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
