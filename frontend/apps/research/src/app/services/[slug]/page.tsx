import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchFact, ResearchRecordGrid, ResearchTextPanel } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
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
      <ResearchDetailHero eyebrow="Research Support" title={service.name ?? "Research support service"} body={compactText(service.summary) || compactText(service.description)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name ?? "Service" }]} labels={[service.service_type, service.category, service.is_free ? "free" : null]} facts={[{ label: "Turnaround", value: service.turnaround_time }, { label: "Cost", value: service.is_free ? "Free" : compactText(service.fee_structure) }, { label: "Email", value: service.contact_email }, { label: "Attachments", value: attachments.length }]} actions={[{ label: "Back to services", href: "/services", variant: "secondary" }, ...(compactText(service.request_url) ? [{ label: "Request service", href: compactText(service.request_url) }] : [])]} imageSrc="/images/research/registrar-reirm-imagegen.png" imageAlt="Research support access and request information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Service Detail" title="Scope, process, and access" body="Service detail pages describe how to request the service, who is eligible, what is delivered, timing, fees, and contact." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5"><ResearchTextPanel title="Overview" fields={[["Summary", service.summary], ["Description", service.description], ["Scope", service.scope]]} /><ResearchTextPanel title="Request process" fields={[["How to access", service.how_to_access], ["Process", service.process], ["Eligibility", service.eligibility]]} /><ResearchTextPanel title="Deliverables" fields={[["Deliverables", service.deliverables], ["Fee structure", service.fee_structure]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(service.service_type ?? "service")}</Badge>{service.category ? <Badge>{formatLabel(service.category)}</Badge> : null}{service.is_free ? <Badge>Free</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><ResearchFact label="Turnaround" value={compactText(service.turnaround_time)} /><ResearchFact label="Cost" value={service.is_free ? "Free" : compactText(service.fee_structure)} /><ResearchFact label="Contact name" value={compactText(service.contact_name)} /><ResearchFact label="Email" value={compactText(service.contact_email)} /><ResearchFact label="Phone" value={compactText(service.contact_phone)} /></dl>{compactText(service.request_url) ? <a href={service.request_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Request service</a> : null}</aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Resources" title="Service attachments" body="Supporting service files appear when published."><ResearchRecordGrid records={attachments} /></ResearchSection>
    </main>
  );
}
