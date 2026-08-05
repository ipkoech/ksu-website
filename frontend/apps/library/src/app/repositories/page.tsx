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
  getLibraryWorkflowDetail,
  safeExternalUrl,
  shortText,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Repositories",
  description: "Kisii University Library repository and external access links.",
};

export const dynamic = "force-dynamic";

export default async function LibraryRepositoriesPage() {
  const [{ groupedLinks, errors: linkErrors }, workflowData] = await Promise.all([
    getLibraryLinksData(),
    getLibraryWorkflowDetail("repository_deposit"),
  ]);
  const errors = Array.from(new Set([...linkErrors, ...workflowData.errors]));
  const workflow = workflowData.workflow.data;
  const workflowSteps = workflow?.steps.filter((step) => step.is_active) ?? [];
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
            <SecondaryLink href="#repository-workflow">Deposit workflow</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Active links
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{repositoryLinks.length}</p>
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

      <LibraryContentBand>
        <form
          action="/repositories"
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end"
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Search repository links</span>
            <input
              name="q"
              type="search"
              placeholder="Repository, collection, OPAC, database"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Collection</span>
            <select
              name="type"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All links</option>
              <option value="repository">Repository</option>
              <option value="opac">OPAC</option>
              <option value="database">Databases</option>
            </select>
          </label>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            Search
          </button>
        </form>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <div id="repository-workflow" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <LibrarySectionHeading
              eyebrow="Repository Workflow"
              title={workflow?.title ?? "Repository deposit guidance"}
              body={
                compactText(workflow?.summary) ||
                "Published deposit steps will appear here when the library repository workflow is available."
              }
            />
            {!workflow ? (
              <StatusMessage>
                Repository deposit workflow details are not available yet.
              </StatusMessage>
            ) : workflowSteps.length === 0 ? (
              <StatusMessage>
                No repository deposit steps have been published yet.
              </StatusMessage>
            ) : (
              <div className="grid gap-4">
                {workflowSteps.map((step, index) => (
                  <CompactRecord
                    key={step.id}
                    icon="file"
                    eyebrow={`Step ${index + 1}`}
                    title={step.title}
                    body={shortText(step.instructions, "Instructions are being updated.", 260)}
                    meta={[
                      safeExternalUrl(step.link_url) ? "External link" : null,
                      step.file_id ? "File available" : null,
                    ]}
                    href={safeExternalUrl(step.link_url) ?? undefined}
                    action="Open step link"
                  />
                ))}
              </div>
            )}
          </div>
          <SidePanel title="Deposit support" eyebrow="Workflow">
            <p className="text-sm leading-7 text-slate-600">
              Repository deposit guidance is managed as a public library workflow.
              Use the access links below for repository platforms and related
              research systems.
            </p>
          </SidePanel>
        </div>
      </LibraryContentBand>

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
            <aside className="space-y-5">
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
