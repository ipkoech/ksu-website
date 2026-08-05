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
  formatLabel,
  getLibraryGuidesData,
  safeExternalUrl,
} from "../../lib/library-public-data";

export const metadata = {
  title: "Library Guides",
  description: "Subject, course, audience, and topic guides from Kisii University Library.",
};

export const dynamic = "force-dynamic";

type GuidesPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    subject?: string;
    course?: string;
    audience?: string;
  }>;
};

export default async function LibraryGuidesPage({ searchParams }: GuidesPageProps) {
  const params = (await searchParams) ?? {};
  const { guides, specialists, query, guideType, subject, courseCode, audience, errors } =
    await getLibraryGuidesData({
      query: params.q,
      guideType: params.type,
      subject: params.subject,
      courseCode: params.course,
      audience: params.audience,
    });

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Guides"
        title="Research guides for subjects, courses, and academic work."
        body="Find curated library guidance by subject, course, audience, and topic, then connect with specialist support where it is available."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Guides" },
        ]}
        actions={
          <>
            <PrimaryLink href="/specialists">Find a specialist</PrimaryLink>
            <SecondaryLink href="/search">Search library</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Published guides
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{guides.data.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Filter by subject, course code, guide type, or audience.
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
            action="/guides"
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_180px_auto] lg:items-end"
          >
            <Field label="Search guides" name="q" defaultValue={query} placeholder="Title, subject, course" />
            <Select label="Guide type" name="type" defaultValue={guideType} options={["subject", "course", "audience", "topic", "general"]} />
            <Field label="Subject" name="subject" defaultValue={subject} placeholder="Nursing" />
            <Field label="Course" name="course" defaultValue={courseCode} placeholder="BIO 101" />
            <Field label="Audience" name="audience" defaultValue={audience} placeholder="Postgraduate" />
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
              eyebrow="Browse"
              title="Published library guides"
              body={`${guides.data.length} guide${guides.data.length === 1 ? "" : "s"} matched the current filters.`}
            />
            {guides.data.length === 0 ? (
              <StatusMessage>No library guides are available for these filters yet.</StatusMessage>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {guides.data.map((guide) => (
                  <CompactRecord
                    key={guide.id}
                    icon="book"
                    eyebrow={formatLabel(guide.guide_type)}
                    title={guide.title}
                    body={compactText(guide.summary) || "Guide details are being updated."}
                    meta={[guide.subject, guide.course_code, guide.audience]}
                    href={`/guides/${guide.slug}`}
                    action="Open guide"
                  />
                ))}
              </div>
            )}
          </div>
          <SidePanel title="Specialist support" eyebrow="Research help">
            {specialists.data.length === 0 ? (
              <p className="text-sm leading-7 text-slate-600">
                No matching specialists are published yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {specialists.data.slice(0, 4).map((specialist) => (
                  <CompactRecord
                    key={specialist.id}
                    icon="users"
                    title={specialist.subjects.join(", ") || "Library specialist"}
                    body={specialist.support_areas.join(", ") || "Support areas are being updated."}
                    meta={[specialist.schools.join(", "), specialist.departments.join(", ")]}
                    href={safeExternalUrl(specialist.booking_url) ?? "/specialists"}
                    action={safeExternalUrl(specialist.booking_url) ? "Book support" : "View specialists"}
                  />
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

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
