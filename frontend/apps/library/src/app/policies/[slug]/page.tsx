import {
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
  formatDate,
  formatLabel,
  getLibraryPolicyDetail,
  shortText,
} from "../../../lib/library-public-data";
import { PolicyContentDisplay, PolicyFileDisplay } from "./policy-content-display";

// Public policy detail pages are cacheable; loader failures remain request-only.
export const revalidate = 300;

type PolicyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LibraryPolicyDetailPage({ params }: PolicyDetailPageProps) {
  const { slug } = await params;
  const { policy, errors } = await getLibraryPolicyDetail(slug);
  const record = policy.data;
  const paragraphs = splitText(record?.content);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow={record ? formatLabel(record.policy_type) : "Policy"}
        title={record?.title ?? "Library policy"}
        body={shortText(record?.content, "Policy details are not available yet.")}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: record?.title ?? "Policy" },
        ]}
        actions={
          <>
            <PrimaryLink href="/policies">All policies</PrimaryLink>
            <SecondaryLink href="/ask">Ask a librarian</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Status
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">
            {record ? formatLabel(record.status) : "Pending"}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {record ? `Updated ${formatDate(record.updated_at)}` : "Policy record unavailable"}
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
              eyebrow="Policy Text"
              title={record ? "Published policy content" : "Policy not found"}
              body={record ? "This content is sourced from the public library policy record." : null}
            />
            {!record ? (
              <StatusMessage>This policy is not available.</StatusMessage>
            ) : paragraphs.length === 0 ? (
              <StatusMessage>No policy content has been published yet.</StatusMessage>
            ) : (
              <PolicyContentDisplay paragraphs={paragraphs} />
            )}
          </div>
          <SidePanel title="Policy details" eyebrow="Metadata">
            <dl className="grid gap-3 text-sm text-slate-600">
              <Meta label="Type" value={formatLabel(record?.policy_type)} />
              <Meta label="Status" value={formatLabel(record?.status)} />
              <Meta label="Updated" value={record ? formatDate(record.updated_at) : null} />
              <Meta label="Related regulation" value={record?.related_regulation_id} />
            </dl>
            {record?.file_id ? (
              <div className="mt-6">
                <PolicyFileDisplay fileId={record.file_id} />
              </div>
            ) : null}
          </SidePanel>
        </div>
      </LibraryContentBand>
    </main>
  );
}

function splitText(value?: string | null) {
  const text = compactText((value ?? "").replace(/<[^>]*>/g, "\n"));
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((item) => compactText(item))
    .filter(Boolean);
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
