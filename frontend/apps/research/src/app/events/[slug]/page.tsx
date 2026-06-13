import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getEventBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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
        imageSrc="/images/research/research-workflows.png"
        imageAlt="Research event agenda, speakers, and participation details"
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Event Details" title="Agenda, access, and registration" body="Event detail shows date, venue or platform, audience, agenda, speakers, registration, fees, recording, and contact." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel title="Overview" fields={[["Summary", event.summary], ["Description", event.description], ["Objectives", event.objectives], ["Target audience", event.target_audience], ["Agenda", event.agenda]]} />
            <RecordPanel title="Speakers" records={speakers} />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2"><Badge>{formatLabel(event.event_type ?? "event")}</Badge><Badge>{mode}</Badge>{event.status ? <Badge>{formatLabel(event.status)}</Badge> : null}</div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Date" value={[formatDate(event.start_date), formatDate(event.end_date)].filter(Boolean).join(" - ")} />
              <Fact label="Time" value={[compactText(event.start_time), compactText(event.end_time), compactText(event.timezone)].filter(Boolean).join(" - ")} />
              <Fact label="Venue" value={[event.venue, event.room].map(compactText).filter(Boolean).join(" · ")} />
              <Fact label="Platform" value={compactText(event.platform)} />
              <Fact label="Registration deadline" value={formatDate(event.registration_deadline)} />
              <Fact label="Fee" value={event.is_free ? "Free" : compactText(event.fee)} />
              <Fact label="Organizer" value={compactText(event.organizer_name)} />
            </dl>
            {compactText(event.registration_url) ? <a href={event.registration_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Register</a> : null}
            {compactText(event.meeting_url) ? <a href={event.meeting_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Join online</a> : null}
            {compactText(event.recording_url) ? <a href={event.recording_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Watch recording</a> : null}
          </aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Resources" title="Attachments and contact" body="Supporting resources and contact details are shown when published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Attachments" records={attachments} />
          <TextPanel title="Contact" fields={[["Name", event.contact_name], ["Email", event.contact_email], ["Phone", event.contact_phone]]} />
          <TextPanel title="Location" fields={[["Address", event.address], ["GPS", [event.gps_latitude, event.gps_longitude].map(compactText).filter(Boolean).join(", ")]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>{entries.length ? <div className="mt-4 space-y-4">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p></div>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>}</section>;
}

function RecordPanel({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.slice(0, 8).map((record, index) => <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0"><h3 className="text-base font-semibold text-slate-950">{record.name ?? record.title ?? record.full_name ?? record.document_name ?? `Record ${index + 1}`}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.role) || compactText(record.bio) || compactText(record.summary) || compactText(record.description) || "Additional details are not published yet."}</p>{record.url || record.document_url ? <a href={record.url ?? record.document_url} className="mt-2 inline-flex text-sm font-semibold text-primary">Open resource</a> : null}</article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No public records are linked yet.</p> : null}</div></section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
