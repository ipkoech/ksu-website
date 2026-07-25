import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import { compactText, formatDate, formatLabel, generateSlugParams, getTrainingBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.training.list);
}

export default async function TrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getTrainingBySlug(slug);
  if (!data) notFound();
  const training = data as ResearchGenericRecord;
  const facilitators = Array.isArray(training.facilitators) ? (training.facilitators as ResearchGenericRecord[]) : [];
  const materials = Array.isArray(training.materials) ? (training.materials as ResearchGenericRecord[]) : [];
  const title = getRecordTitle(training, "Training program");
  const storySections = getNarrativeSections(training, [
    { title: "What this training covers", fields: ["summary", "description", "objectives"] },
    { title: "Who should attend", fields: ["target_audience", "prerequisites"] },
    { title: "What participants learn", fields: ["curriculum", "outcomes"] },
    { title: "Schedule and participation", fields: ["schedule", "venue", "platform"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Training"
        title={title}
        body={getRecordSummary(training)}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Training", href: "/training" }, { label: title }]}
        labels={[training.program_type, training.delivery_mode, training.status, training.offers_certificate ? "certificate" : null, training.is_featured ? "featured" : null]}
        facts={[
          { label: "Starts", value: formatDate(training.start_date) },
          { label: "Registration", value: formatDate(training.registration_deadline) },
          { label: "Mode", value: formatLabel(training.delivery_mode) },
          { label: "Fee", value: training.is_free ? "Free" : formatMoney(training.fee, training.currency) },
        ]}
        actions={[
          { label: "Back to training", href: "/training", variant: "secondary" },
          ...(compactText(training.meeting_link) ? [{ label: "Open meeting", href: compactText(training.meeting_link) }] : []),
          ...(compactText(training.brochure_url) ? [{ label: "Download brochure", href: compactText(training.brochure_url), variant: "secondary" as const }] : []),
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research training schedule, registration, and learning details"
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Learning Story" title="Programme, audience, and registration" body="The public training record is grouped around coverage, audience, learning outcomes, and participation details." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <TrainingStory sections={storySections} />
            <ResearchRecordPanel title="Materials" records={materials} empty="No training materials are published yet." />
          </div>
          <ResearchDetailSidebar
            labels={[training.program_type ?? "training", training.delivery_mode ?? training.status, training.offers_certificate ? "certificate" : null]}
            facts={[
              { label: "Starts", value: formatDate(training.start_date) },
              { label: "Ends", value: formatDate(training.end_date) },
              { label: "Registration deadline", value: formatDate(training.registration_deadline) },
              { label: "Venue / platform", value: [training.venue, training.platform].map(compactText).filter(Boolean).join(" · ") },
              { label: "Duration", value: training.duration_hours ? `${training.duration_hours} hours` : "" },
              { label: "Fee", value: training.is_free ? "Free" : formatMoney(training.fee, training.currency) },
              { label: "CPD", value: training.cpd_points ? `${training.cpd_points} points` : "" },
            ]}
            actions={[
              ...(compactText(training.meeting_link) ? [{ label: "Open meeting link", href: compactText(training.meeting_link) }] : []),
              ...(compactText(training.brochure_url) ? [{ label: "Download brochure", href: compactText(training.brochure_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Support" title="Facilitators, materials, and contact" body="Supporting lists appear when facilitators, materials, and contact details are published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Facilitators" records={facilitators} />
          <ResearchRecordPanel title="Materials" records={materials} />
          <ContactPanel record={training} />
        </div>
      </ResearchSection>
    </main>
  );
}

function TrainingStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The training story appears when coverage, audience, curriculum, or schedule fields are published."
    />
  );
}

function ContactPanel({ record }: { record: ResearchGenericRecord }) {
  const items = [
    ["Name", compactText(record.contact_name)],
    ["Email", compactText(record.contact_email)],
    ["Phone", compactText(record.contact_phone)],
  ].filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Contact</h2>
      {items.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {items.map(([label, value]) => <div key={label} className="rounded-md bg-surface-subtle p-3"><dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold text-foreground">{value}</dd></div>)}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-muted-foreground">Contact details are not published yet.</p>}
    </section>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
