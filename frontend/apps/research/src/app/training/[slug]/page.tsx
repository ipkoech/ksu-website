import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getTrainingBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function TrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getTrainingBySlug(slug);
  if (!data) notFound();
  const training = data as ResearchGenericRecord;
  const facilitators = Array.isArray(training.facilitators) ? (training.facilitators as ResearchGenericRecord[]) : [];
  const materials = Array.isArray(training.materials) ? (training.materials as ResearchGenericRecord[]) : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Training"
        title={training.title ?? "Training program"}
        body={compactText(training.summary) || compactText(training.description)}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Training", href: "/training" }, { label: training.title ?? "Training" }]}
        labels={[training.program_type, training.delivery_mode, training.offers_certificate ? "certificate" : null]}
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
      <ResearchSection eyebrow="Learning Details" title="Programme, audience, and registration" body="Training detail uses the public training record for schedule, curriculum, facilitators, fees, certification, and materials." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel title="Overview" fields={[["Summary", training.summary], ["Description", training.description], ["Objectives", training.objectives], ["Target audience", training.target_audience]]} />
            <ResearchTextPanel title="Curriculum and outcomes" fields={[["Prerequisites", training.prerequisites], ["Curriculum", training.curriculum], ["Outcomes", training.outcomes], ["Schedule", training.schedule]]} />
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
          <ResearchTextPanel title="Contact" fields={[["Name", training.contact_name], ["Email", training.contact_email], ["Phone", training.contact_phone]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
