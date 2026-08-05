import {
  CompactRecord,
  LibraryContentBand,
  LibraryHero,
  LibrarySectionHeading,
  PrimaryLink,
  SearchPanel,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  getLibrarySpecialistsData,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Library Specialists",
  description: "Find Kisii University Library subject and research support specialists.",
};

export const dynamic = "force-dynamic";

type SpecialistsPageProps = {
  searchParams?: Promise<{
    q?: string;
    subject?: string;
    school?: string;
    department?: string;
    supportArea?: string;
  }>;
};

export default async function LibrarySpecialistsPage({ searchParams }: SpecialistsPageProps) {
  const params = (await searchParams) ?? {};
  const { specialists, query, subject, school, department, supportArea, errors } =
    await getLibrarySpecialistsData({
      query: params.q,
      subject: params.subject,
      school: params.school,
      department: params.department,
      supportArea: params.supportArea,
    });
  const supportAreas = Array.from(
    new Set(specialists.data.flatMap((specialist) => specialist.support_areas)),
  ).filter(Boolean);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Specialists"
        title="Find specialist library support by subject and department."
        body="Browse public subject specialists for research help, resource guidance, training, and specialist support areas."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Specialists" },
        ]}
        actions={
          <>
            <PrimaryLink href="/guides">Browse guides</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Published specialists
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{specialists.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Filter by subject, school, department, or support area.
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
        <SearchPanel>
          <form
            action="/specialists"
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_180px_auto] lg:items-end"
          >
            <Field label="Search support areas" name="q" defaultValue={query} placeholder="Training, citation, data" />
            <Field label="Subject" name="subject" defaultValue={subject} placeholder="Education" />
            <Field label="School" name="school" defaultValue={school} placeholder="School name" />
            <Field label="Department" name="department" defaultValue={department} placeholder="Department" />
            <Field label="Support area" name="supportArea" defaultValue={supportArea} placeholder="Citation" />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Filter
            </button>
          </form>
        </SearchPanel>
      </LibraryContentBand>

      <LibraryContentBand tone="soft">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <LibrarySectionHeading
              eyebrow="People"
              title="Published specialist records"
              body={`${specialists.data.length} specialist${specialists.data.length === 1 ? "" : "s"} matched the current filters.`}
            />
            {specialists.data.length === 0 ? (
              <StatusMessage>No specialists are available for these filters yet.</StatusMessage>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {specialists.data.map((specialist) => (
                  <CompactRecord
                    key={specialist.id}
                    icon="users"
                    eyebrow={specialist.schools.join(", ") || "Library specialist"}
                    title={specialist.subjects.join(", ") || "Subject support"}
                    body={specialist.support_areas.join(", ") || "Support areas are being updated."}
                    meta={[specialist.departments.join(", ")]}
                    href={safeExternalUrl(specialist.booking_url) ?? undefined}
                    action="Book support"
                  />
                ))}
              </div>
            )}
          </div>
          <SidePanel title="Support areas" eyebrow="Specialist filters">
            {supportAreas.length === 0 ? (
              <p className="text-sm leading-7 text-slate-600">
                Support areas will appear as specialist records are published.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {supportAreas.slice(0, 18).map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {compactText(area)}
                  </span>
                ))}
              </div>
            )}
          </SidePanel>
        </div>
      </LibraryContentBand>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        name={name}
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </label>
  );
}
