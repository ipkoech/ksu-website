import {
  CompactRecord,
  LibraryContentBand,
  LibraryHero,
  LibrarySectionHeading,
  PrimaryLink,
  SecondaryLink,
  SidePanel,
  StatusMessage,
} from "./library-ui";
import {
  compactText,
  formatLabel,
  getLibraryWorkflowDetail,
  safeExternalUrl,
  shortText,
} from "../lib/library-public-data";
import type { LibraryWorkflowType } from "@ksu/api-client";

type LibraryWorkflowPageProps = {
  workflowType: LibraryWorkflowType;
  eyebrow: string;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export async function LibraryWorkflowPage({
  workflowType,
  eyebrow,
  title,
  body,
  primaryHref = "/ask",
  primaryLabel = "Ask a librarian",
}: LibraryWorkflowPageProps) {
  const { workflow, errors } = await getLibraryWorkflowDetail(workflowType);
  const record = workflow.data;
  const steps = record?.steps.filter((step) => step.is_active) ?? [];

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow={eyebrow}
        title={record?.title ?? title}
        body={compactText(record?.summary) || body}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: eyebrow },
        ]}
        actions={
          <>
            <PrimaryLink href={primaryHref}>{primaryLabel}</PrimaryLink>
            <SecondaryLink href="/guides">Browse guides</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Published steps
          </p>
          <p className="mt-3 text-4xl font-bold sm:text-5xl">{steps.length}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {record?.audience
              ? `Audience: ${record.audience}`
              : "Workflow content is maintained by the library team."}
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
              eyebrow="Workflow"
              title="How this process works"
              body={
                record
                  ? "Follow the published steps in order, then use the listed links or files where available."
                  : "This workflow has not been published yet."
              }
            />
            {!record ? (
              <StatusMessage>
                Workflow details are not available yet. Contact the library desk
                for current guidance.
              </StatusMessage>
            ) : steps.length === 0 ? (
              <StatusMessage>
                No workflow steps have been published for this process yet.
              </StatusMessage>
            ) : (
              <div className="grid gap-4">
                {steps.map((step, index) => (
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
          <SidePanel title="Workflow details" eyebrow="Library support">
            <dl className="grid gap-3 text-sm text-slate-600">
              <Meta label="Type" value={formatLabel(record?.workflow_type)} />
              <Meta label="Audience" value={record?.audience} />
              <Meta label="Status" value={record?.is_public ? "Public" : null} />
            </dl>
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
