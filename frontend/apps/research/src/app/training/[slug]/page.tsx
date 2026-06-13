import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchPageIntro, ResearchSection, StatusMessage } from "../../../components/research-ui";
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
      <ResearchPageIntro
        eyebrow="Training"
        title={training.title ?? "Training program"}
        body={compactText(training.summary) || compactText(training.description)}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Training", href: "/training" }, { label: training.title ?? "Training" }]}
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Learning Details" title="Programme, audience, and registration" body="Training detail uses the public training record for schedule, curriculum, facilitators, fees, certification, and materials." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel title="Overview" fields={[["Summary", training.summary], ["Description", training.description], ["Objectives", training.objectives], ["Target audience", training.target_audience]]} />
            <TextPanel title="Curriculum and outcomes" fields={[["Prerequisites", training.prerequisites], ["Curriculum", training.curriculum], ["Outcomes", training.outcomes], ["Schedule", training.schedule]]} />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(training.program_type ?? "training")}</Badge>
              <Badge>{formatLabel(training.delivery_mode ?? training.status)}</Badge>
              {training.offers_certificate ? <Badge>Certificate</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Starts" value={formatDate(training.start_date)} />
              <Fact label="Ends" value={formatDate(training.end_date)} />
              <Fact label="Registration deadline" value={formatDate(training.registration_deadline)} />
              <Fact label="Venue / platform" value={[training.venue, training.platform].map(compactText).filter(Boolean).join(" · ")} />
              <Fact label="Duration" value={training.duration_hours ? `${training.duration_hours} hours` : ""} />
              <Fact label="Fee" value={training.is_free ? "Free" : formatMoney(training.fee, training.currency)} />
              <Fact label="CPD" value={training.cpd_points ? `${training.cpd_points} points` : ""} />
            </dl>
            {compactText(training.meeting_link) ? <a href={training.meeting_link} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Open meeting link</a> : null}
            {compactText(training.brochure_url) ? <a href={training.brochure_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Download brochure</a> : null}
          </aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Support" title="Facilitators, materials, and contact" body="Supporting lists are shown when the backend record publishes them.">
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Facilitators" records={facilitators} />
          <RecordPanel title="Materials" records={materials} />
          <TextPanel title="Contact" fields={[["Name", training.contact_name], ["Email", training.contact_email], ["Phone", training.contact_phone]]} />
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
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.slice(0, 8).map((record, index) => <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0"><h3 className="text-base font-semibold text-slate-950">{record.name ?? record.title ?? record.full_name ?? record.document_name ?? `Record ${index + 1}`}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.role) || compactText(record.summary) || compactText(record.description) || "Additional details are not published yet."}</p>{record.url || record.document_url ? <a href={record.url ?? record.document_url} className="mt-2 inline-flex text-sm font-semibold text-primary">Open resource</a> : null}</article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No public records are linked yet.</p> : null}</div></section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
