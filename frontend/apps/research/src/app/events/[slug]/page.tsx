import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, generateSlugParams, getEventBySlug } from "../../../lib/research-public-data";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.events.list);
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getEventBySlug(slug);
  if (!data) notFound();
  const event = data as ResearchGenericRecord;
  const speakers = Array.isArray(event.speakers) ? (event.speakers as ResearchGenericRecord[]) : [];
  const attachments = Array.isArray(event.attachments) ? (event.attachments as ResearchGenericRecord[]) : [];
  const mode = event.is_hybrid ? "Hybrid" : event.is_virtual ? "Online" : "In person";

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Event"
        title={event.title ?? "Research event"}
        body={compactText(event.summary) || compactText(event.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: event.title ?? "Event" },
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
        imageSrc="/images/research/research-events-hero.svg"
        imageAlt="Research event agenda, speakers, and participation details"
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Event Details" title="Agenda, access, and registration" body="Event detail shows date, venue or platform, audience, agenda, speakers, registration, fees, recording, and contact." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel title="Overview" fields={[["Summary", event.summary], ["Description", event.description], ["Objectives", event.objectives], ["Target audience", event.target_audience], ["Agenda", event.agenda]]} />
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
      <ResearchSection eyebrow="Resources" title="Attachments and contact" body="Supporting resources and contact details are shown when published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Attachments" records={attachments} />
          <ResearchTextPanel title="Contact" fields={[["Name", event.contact_name], ["Email", event.contact_email], ["Phone", event.contact_phone]]} />
          <ResearchTextPanel title="Location" fields={[["Address", event.address], ["GPS", [event.gps_latitude, event.gps_longitude].map(compactText).filter(Boolean).join(", ")]]} />
        </div>
      </ResearchSection>
    </main>
  );
}
