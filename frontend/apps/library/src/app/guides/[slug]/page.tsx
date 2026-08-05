import {
  CompactRecord,
  LibraryContentBand,
  LibraryHero,
  LibrarySectionHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "../../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryGuideDetail,
  safeExternalUrl,
  shortText,
} from "../../../lib/library-public-data";

export const dynamic = "force-dynamic";

type GuideDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LibraryGuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const { guide, specialists, errors } = await getLibraryGuideDetail(slug);
  const record = guide.data;
  const sections = record?.sections.filter((section) => section.is_active) ?? [];

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow={record ? formatLabel(record.guide_type) : "Guide"}
        title={record?.title ?? "Library guide"}
        body={compactText(record?.summary) || "Guide details are not available yet."}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: record?.title ?? "Guide" },
        ]}
        actions={
          <>
            <PrimaryLink href="/guides">All guides</PrimaryLink>
            <SecondaryLink href="/specialists">Find a specialist</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Guide sections
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{sections.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {record?.subject ?? record?.course_code ?? record?.audience ?? "Published guide content"}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <LibrarySectionHeading
              eyebrow="Guide Content"
              title={record ? "Published sections" : "Guide not found"}
              body={record ? "Use the guide sections below for curated library guidance." : null}
            />
            {!record ? (
              <StatusMessage>This guide is not available.</StatusMessage>
            ) : sections.length === 0 ? (
              <StatusMessage>No sections have been published for this guide yet.</StatusMessage>
            ) : (
              <div className="grid gap-4">
                {sections.map((section) => (
                  <CompactRecord
                    key={section.id}
                    icon={section.section_type === "contact" ? "users" : "file"}
                    eyebrow={formatLabel(section.section_type)}
                    title={section.heading}
                    body={shortText(section.content, "Section content is being updated.", 320)}
                    meta={[
                      section.resource_links?.length ? `${section.resource_links.length} resource links` : null,
                      section.file_ids?.length ? `${section.file_ids.length} files` : null,
                    ]}
                  />
                ))}
              </div>
            )}
          </div>
          <SidePanel title="Guide details" eyebrow="Context">
            <dl className="grid gap-3 text-sm text-slate-600">
              <Meta label="Subject" value={record?.subject} />
              <Meta label="Course" value={record?.course_code} />
              <Meta label="Audience" value={record?.audience} />
              <Meta label="Type" value={formatLabel(record?.guide_type)} />
            </dl>
            <div className="mt-6 grid gap-4">
              {specialists.data.slice(0, 3).map((specialist) => (
                <CompactRecord
                  key={specialist.id}
                  icon="users"
                  title={specialist.subjects.join(", ") || "Library specialist"}
                  body={specialist.support_areas.join(", ") || "Support areas are being updated."}
                  href={safeExternalUrl(specialist.booking_url) ?? "/specialists"}
                  action={safeExternalUrl(specialist.booking_url) ? "Book support" : "View specialists"}
                />
              ))}
            </div>
          </SidePanel>
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
  const text = compactText(value);
  if (!text) return null;
  return (
    <div>
      <dt className="font-semibold text-slate-950">{label}</dt>
      <dd className="mt-1 leading-6">{text}</dd>
    </div>
  );
}
