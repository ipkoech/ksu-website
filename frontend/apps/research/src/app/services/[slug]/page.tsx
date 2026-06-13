import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchPageIntro, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatLabel, getServiceBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getServiceBySlug(slug);
  if (!data) notFound();
  const service = data as ResearchGenericRecord;
  const attachments = Array.isArray(service.attachments) ? (service.attachments as ResearchGenericRecord[]) : [];
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro eyebrow="Research Service" title={service.name ?? "Research service"} body={compactText(service.summary) || compactText(service.description)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name ?? "Service" }]} />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Service Detail" title="Scope, process, and access" body="Service detail pages describe how to request the service, who is eligible, what is delivered, timing, fees, and contact." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5"><TextPanel title="Overview" fields={[["Summary", service.summary], ["Description", service.description], ["Scope", service.scope]]} /><TextPanel title="Request process" fields={[["How to access", service.how_to_access], ["Process", service.process], ["Eligibility", service.eligibility]]} /><TextPanel title="Deliverables" fields={[["Deliverables", service.deliverables], ["Fee structure", service.fee_structure]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(service.service_type ?? "service")}</Badge>{service.category ? <Badge>{formatLabel(service.category)}</Badge> : null}{service.is_free ? <Badge>Free</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><Fact label="Turnaround" value={compactText(service.turnaround_time)} /><Fact label="Cost" value={service.is_free ? "Free" : compactText(service.fee_structure)} /><Fact label="Contact name" value={compactText(service.contact_name)} /><Fact label="Email" value={compactText(service.contact_email)} /><Fact label="Phone" value={compactText(service.contact_phone)} /></dl>{compactText(service.request_url) ? <a href={service.request_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Request service</a> : null}</aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Resources" title="Service attachments" body="Supporting service files appear when published."><RecordPanel records={attachments} /></ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>{entries.length ? <div className="mt-4 space-y-4">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p></div>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>}</section>;
}

function RecordPanel({ records }: { records: ResearchGenericRecord[] }) {
  return <div className="grid gap-5 lg:grid-cols-3">{records.map((record, index) => <article key={record.id ?? index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-950">{record.name ?? record.title ?? record.file_name ?? `File ${index + 1}`}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.description) || "Service resource"}</p>{record.url || record.file_url || record.document_url ? <a href={record.url ?? record.file_url ?? record.document_url} className="mt-3 inline-flex text-sm font-semibold text-primary">Open file</a> : null}</article>)}{records.length === 0 ? <StatusMessage>No supporting files are linked yet.</StatusMessage> : null}</div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
