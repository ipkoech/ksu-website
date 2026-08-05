import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getEventBySlug,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.events.list);
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getEventBySlug(slug);
  if (!data) notFound();

  const event = data as ResearchGenericRecord;
  const speakers = Array.isArray(event.speakers) ? (event.speakers as ResearchGenericRecord[]) : [];
  const attachments = Array.isArray(event.attachments) ? (event.attachments as ResearchGenericRecord[]) : [];
  const title = getRecordTitle(event, "Research event");
  const mode = event.is_hybrid ? "Hybrid" : event.is_virtual ? "Online" : "In person";
  const storySections = getNarrativeSections(event, [
    { title: "What this event covers", fields: ["summary", "description", "about"] },
    { title: "Why it matters", fields: ["objectives", "purpose", "expected_outcomes"] },
    { title: "Agenda", fields: ["agenda", "programme", "schedule"] },
    { title: "Who should attend", fields: ["target_audience", "eligibility", "requirements"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Event"
        title={title}
        body={getRecordSummary(event)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: title },
        ]}
        labels={[event.event_type ?? "event", mode, event.status]}
        facts={[
          { label: "Date", value: [formatDate(event.start_date), formatDate(event.end_date)].filter(Boolean).join(" - ") },
          { label: "Time", value: [compactText(event.start_time), compactText(event.end_time), compactText(event.timezone)].filter(Boolean).join(" - ") },
          { label: "Venue or platform", value: [event.venue, event.room, event.platform].map(compactText).filter(Boolean).join(" · ") },
          { label: "Registration", value: formatDate(event.registration_deadline) },
        ]}
        actions={[
          { label: "Back to events", href: "/events", variant: "secondary" },
          ...(compactText(event.registration_url) ? [{ label: "Register", href: compactText(event.registration_url) }] : []),
          ...(compactText(event.meeting_url) ? [{ label: "Join online", href: compactText(event.meeting_url), variant: "secondary" as const }] : []),
        ]}
        imageSrc={compactText(event.cover_image_url) || "/images/research/research-events-hero.svg"}
        imageAlt="Research event agenda, speakers, and participation details"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Event Story"
        title="Agenda, access, and registration"
        body="Event details are shown from published backend fields for date, venue or platform, audience, agenda, speakers, registration, fees, recording, and contact."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <EventStory sections={storySections} />
            <ResearchRecordPanel title="Speakers" records={speakers} />
          </div>
          <ResearchDetailSidebar
            labels={[event.event_type ?? "event", mode, event.status]}
            facts={[
              { label: "Date", value: [formatDate(event.start_date), formatDate(event.end_date)].filter(Boolean).join(" - ") },
              { label: "Time", value: [compactText(event.start_time), compactText(event.end_time), compactText(event.timezone)].filter(Boolean).join(" - ") },
              { label: "Venue", value: [event.venue, event.room].map(compactText).filter(Boolean).join(" · ") },
              { label: "Platform", value: event.platform },
              { label: "Registration deadline", value: formatDate(event.registration_deadline) },
              { label: "Fee", value: event.is_free ? "Free" : compactText(event.fee) },
              { label: "Organizer", value: event.organizer_name },
            ]}
            actions={[
              ...(compactText(event.registration_url) ? [{ label: "Register", href: compactText(event.registration_url) }] : []),
              ...(compactText(event.meeting_url) ? [{ label: "Join online", href: compactText(event.meeting_url), variant: "secondary" as const }] : []),
              ...(compactText(event.recording_url) ? [{ label: "Watch recording", href: compactText(event.recording_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Resources"
        title="Attachments and contact"
        body="Supporting resources and contact details are shown only when published on the event record."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Attachments" records={attachments} />
          <EvidencePanel title="Contact" fields={[["Name", event.contact_name], ["Email", event.contact_email], ["Phone", event.contact_phone]]} />
          <EvidencePanel title="Location" fields={[["Address", event.address], ["GPS", [event.gps_latitude, event.gps_longitude].map(compactText).filter(Boolean).join(", ")]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function EvidencePanel({ title, fields }: { title: string; fields: Array<[string, unknown]> }) {
  const entries = fields
    .map(([label, value]) => ({ label, value: compactText(value as string | number | null | undefined) }))
    .filter((entry) => entry.value);

  if (entries.length === 0) {
    return <StatusMessage>{title} details are not published yet.</StatusMessage>;
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {entries.map((entry) => (
          <div key={entry.label}>
            <dt className="text-xs font-semibold uppercase text-muted-foreground">{entry.label}</dt>
            <dd className="mt-1 break-words text-muted-foreground [overflow-wrap:anywhere]">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EventStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The event story will appear when summary, agenda, audience, or objective fields are published."
    />
  );
}
