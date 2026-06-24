import {
  CompactRecord,
  LibraryHero,
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
  getLibraryDownloadsData,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Downloads",
  description: "Kisii University Library public guides, forms, and documents.",
};

export const dynamic = "force-dynamic";

export default async function LibraryDownloadsPage() {
  const { groupedFiles, errors } = await getLibraryDownloadsData();
  const files = groupedFiles.flatMap(({ branch, files: branchFiles }) =>
    branchFiles.map((file) => ({ ...file, branch })),
  );

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Downloads"
        title="Public library documents, forms, and guides."
        body="Find public library files published for branch use, service guidance, and policy reference."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Downloads" },
        ]}
        actions={
          <>
            <PrimaryLink href="/services#regulations-heading">
              Read regulations
            </PrimaryLink>
            <SecondaryLink href="/services">View services</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Public files
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{files.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Documents attached to public branch records.
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

      <LibraryContentBand tone="soft">
        <LibrarySectionHeading
          eyebrow="Files"
          title="Available downloads"
          body="Download links use resolved media URLs when they are available from the shared media service."
        />
        {files.length === 0 ? (
          <StatusMessage>No public library downloads are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-4">
              {files.map((file) => (
                <CompactRecord
                  key={file.id}
                  icon="file"
                  eyebrow={formatLabel(file.file_category ?? "file")}
                  title={file.title}
                  body={compactText(file.description) || "Document details are being updated."}
                  meta={[file.branch.name, formatLabel(file.access_level), file.file_url ? "Download ready" : "Link pending"]}
                  href={file.file_url ?? undefined}
                  action="Download"
                />
              ))}
            </div>
            <SidePanel title="Most requested" eyebrow="Downloads">
              <div className="divide-y divide-slate-200">
                {files.slice(0, 5).map((file) => (
                  <article key={file.id} className="py-3 first:pt-0">
                    <p className="text-sm font-semibold text-slate-950">{file.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {formatLabel(file.file_category ?? "file")} · {file.branch.name}
                    </p>
                  </article>
                ))}
              </div>
            </SidePanel>
          </div>
        )}
      </LibraryContentBand>
    </main>
  );
}
