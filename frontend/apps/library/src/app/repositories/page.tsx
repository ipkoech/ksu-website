import {
  CompactRecord,
  ExternalAnchor,
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
  getLibraryLinksData,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Repositories",
  description: "Kisii University Library repository and external access links.",
};

export const dynamic = "force-dynamic";

export default async function LibraryRepositoriesPage() {
  const { groupedLinks, errors } = await getLibraryLinksData();
  const links = groupedLinks.flatMap(({ branch, links: branchLinks }) =>
    branchLinks.map((link) => ({ ...link, branch })),
  );
  const repositoryLinks = links.filter((link) =>
    ["repository", "opac", "myloft", "database", "ejournal"].includes(
      link.link_type,
    ),
  );

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Repositories"
        title="Open repository, OPAC, and external research access points."
        body="Use verified library links for repository content, OPAC records, databases, e-journals, and off-campus access tools."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Repositories" },
        ]}
        actions={
          <>
            <PrimaryLink href="/electronic">Browse e-resources</PrimaryLink>
            <SecondaryLink href="/catalog">Search catalog</SecondaryLink>
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

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          eyebrow="Access Links"
          title="Repository and research platforms"
          body="These links are managed per branch so the public site can reflect current access arrangements."
        />
        {repositoryLinks.length === 0 ? (
          <StatusMessage>No repository or external access links are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-4">
              {repositoryLinks.map((link) => (
                <CompactRecord
                  key={link.id}
                  icon="database"
                  eyebrow={formatLabel(link.link_type)}
                  title={link.label}
                  body={compactText(link.description) || "Access link details are maintained by the library team."}
                  meta={[link.branch.name, safeExternalUrl(link.url) ? "Verified URL" : "Link pending"]}
                  href={safeExternalUrl(link.url) ?? undefined}
                  action="Open link"
                />
              ))}
            </div>
            <aside className="flex flex-col gap-5">
              <MetricStrip
                items={[
                  { label: "Repository", value: repositoryLinks.filter((link) => link.link_type === "repository").length },
                  { label: "OPAC", value: repositoryLinks.filter((link) => link.link_type === "opac").length },
                  { label: "Research links", value: repositoryLinks.length },
                ]}
              />
              <SidePanel title="Repository access" eyebrow="Integration">
                <p className="text-sm leading-7 text-slate-600">
                  The portal currently links to verified repository and research platforms.
                  A deeper repository model can later mirror collections and submissions.
                </p>
                {safeExternalUrl(repositoryLinks[0]?.url) ? (
                  <div className="mt-5">
                    <ExternalAnchor href={safeExternalUrl(repositoryLinks[0]?.url)!}>
                      Open primary repository
                    </ExternalAnchor>
                  </div>
                ) : null}
              </SidePanel>
            </aside>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}
