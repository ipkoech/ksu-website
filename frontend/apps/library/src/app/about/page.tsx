import {
  LibraryHero,
  MetricStrip,
  LibraryContentBand,
  LibrarySectionHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryAboutData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "About",
  description: "About Kisii University Library branches, mission, and mandate.",
};

export const dynamic = "force-dynamic";

export default async function LibraryAboutPage() {
  const { branches, primaryBranch, errors } = await getLibraryAboutData();
  const directionItems = [
    { label: "Mission", value: primaryBranch?.mission },
    { label: "Vision", value: primaryBranch?.vision },
    { label: "Objectives", value: primaryBranch?.objectives },
    { label: "Regulations", value: primaryBranch?.regulations },
  ].filter((item) => compactText(item.value));

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="About the Library"
        title="A library network built around access, scholarship, and support."
        body="Learn about the public library branches, their mandate, and the guidance published by the library team."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "About" },
        ]}
        actions={
          <>
            <PrimaryLink href="/catalog">Search catalog</PrimaryLink>
            <SecondaryLink href="/services">View services</SecondaryLink>
          </>
        }
      />

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibraryContentBand>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <LibrarySectionHeading
              eyebrow="Overview"
              title={primaryBranch?.name ?? "Kisii University Library"}
              body={compactText(primaryBranch?.description) || "Library overview content is being updated by the library team."}
            />
            <div className="grid gap-5 lg:grid-cols-3">
          {directionItems.length > 0 ? (
            directionItems.map((item) => (
              <article
                key={item.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {item.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(item.value)}
                </p>
              </article>
            ))
          ) : (
            <StatusMessage>
              Mission, vision, objectives, and regulations will appear here once
              published.
            </StatusMessage>
          )}
            </div>
          </div>
          <SidePanel title="Library contact" eyebrow="Main desk">
            <dl className="grid gap-3 text-sm text-slate-600">
              <Meta label="Location" value={primaryBranch?.address} />
              <Meta label="Phone" value={primaryBranch?.phone} />
              <Meta label="Email" value={primaryBranch?.email} />
            </dl>
          </SidePanel>
        </div>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <MetricStrip
          items={[
            { label: "Access points", value: branches.data.length },
            { label: "Public branch", value: primaryBranch ? 1 : 0 },
            { label: "Contacts", value: branches.data.filter((branch) => branch.phone || branch.email).length },
          ]}
        />
        <LibrarySectionHeading
          eyebrow="Branches"
          title="Library access points"
          body="Each branch record is maintained by the library team and reused across the public pages."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {branches.data.map((branch) => (
            <article
              key={branch.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                {formatLabel(branch.library_type ?? "library")}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                {branch.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(branch.description) ||
                  "Branch details are being updated."}
              </p>
              <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                <Meta label="Location" value={branch.address} />
                <Meta label="Phone" value={branch.phone} />
                <Meta label="Email" value={branch.email} />
              </dl>
            </article>
          ))}
        </div>
      </LibraryContentBand>
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
