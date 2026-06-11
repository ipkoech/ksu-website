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
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Active links
          </p>
          <p className="mt-3 text-5xl font-bold">{repositoryLinks.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Public external access links across library branches.
          </p>
        </div>
      </LibraryHero>

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ))}

      <LibrarySection
        eyebrow="Access Links"
        title="Repository and research platforms"
        body="These links are managed per branch so the public site can reflect current access arrangements."
        tone="white"
      >
        {repositoryLinks.length === 0 ? (
          <StatusMessage>No repository or external access links are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {repositoryLinks.map((link) => {
              const href = safeExternalUrl(link.url);
              return (
                <article
                  key={link.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {formatLabel(link.link_type)}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">
                    {link.label}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {compactText(link.description) ||
                      "Access link details are maintained by the library team."}
                  </p>
                  <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                    <Meta label="Branch" value={link.branch.name} />
                  </dl>
                  {href ? (
                    <div className="mt-6">
                      <ExternalAnchor href={href}>Open link</ExternalAnchor>
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-slate-500">
                      Link pending verification.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
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
