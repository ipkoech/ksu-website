import {
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
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
          <p className="mt-3 text-5xl font-bold">{files.length}</p>
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

      <LibrarySection
        eyebrow="Files"
        title="Available downloads"
        body="Download links depend on media records published by the library team. File metadata is shown when public files are available."
        tone="white"
      >
        {files.length === 0 ? (
          <StatusMessage>No public library downloads are available yet.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
              <article
                key={file.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(file.file_category ?? "file")}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {file.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(file.description) ||
                    "Document details are being updated."}
                </p>
                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <Meta label="Branch" value={file.branch.name} />
                  <Meta label="Access" value={formatLabel(file.access_level)} />
                </dl>
                <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  File delivery is managed by the media service. Contact the
                  branch desk if a document link is not yet visible.
                </p>
              </article>
            ))}
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
