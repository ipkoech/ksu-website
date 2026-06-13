import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchPageIntro, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatLabel, getResourceBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getResourceBySlug(slug);
  if (!data) notFound();
  const resource = data as ResearchGenericRecord;
  const attachments = Array.isArray(resource.attachments) ? (resource.attachments as ResearchGenericRecord[]) : [];
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro eyebrow="Resource / Tool" title={resource.name ?? "Research resource"} body={compactText(resource.description) || compactText(resource.capabilities)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources & Tools", href: "/resources-tools" }, { label: resource.name ?? "Resource" }]} />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Access Detail" title="Capabilities, usage, and booking" body="Resource detail pages show where the tool is, what it can support, how to access it, and who manages it." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5"><TextPanel title="Description" fields={[["Description", resource.description], ["Specifications", resource.specifications], ["Capabilities", resource.capabilities]]} /><TextPanel title="Usage" fields={[["Usage guidelines", resource.usage_guidelines], ["Training required", resource.training_required], ["Availability", resource.availability], ["Operating hours", resource.operating_hours], ["Fee structure", resource.fee_structure]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(resource.resource_type ?? "resource")}</Badge>{resource.category ? <Badge>{formatLabel(resource.category)}</Badge> : null}{resource.status ? <Badge>{formatLabel(resource.status)}</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><Fact label="Access" value={formatLabel(resource.access_type)} /><Fact label="Location" value={[resource.location, resource.room].map(compactText).filter(Boolean).join(" · ")} /><Fact label="Cost" value={resource.is_free ? "Free" : compactText(resource.fee_structure)} /><Fact label="Contact" value={[resource.contact_name, resource.contact_email, resource.contact_phone].map(compactText).filter(Boolean).join(" · ")} /></dl>{compactText(resource.booking_url) ? <a href={resource.booking_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Book resource</a> : null}{compactText(resource.access_url) ? <a href={resource.access_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Open access link</a> : null}</aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Downloads" title="Supporting files" body="Attachments are shown when published."><RecordPanel records={attachments} /></ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>{entries.length ? <div className="mt-4 space-y-4">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p></div>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>}</section>;
}

function RecordPanel({ records }: { records: ResearchGenericRecord[] }) {
  return <div className="grid gap-5 lg:grid-cols-3">{records.map((record, index) => <article key={record.id ?? index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-950">{record.name ?? record.title ?? record.file_name ?? `File ${index + 1}`}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.description) || "Supporting resource"}</p>{record.url || record.file_url || record.document_url ? <a href={record.url ?? record.file_url ?? record.document_url} className="mt-3 inline-flex text-sm font-semibold text-primary">Open file</a> : null}</article>)}{records.length === 0 ? <StatusMessage>No supporting files are linked yet.</StatusMessage> : null}</div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
