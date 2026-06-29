import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordGrid, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, getServiceBySlug } from "../../../lib/research-public-data";

export const revalidate = 300;

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getServiceBySlug(slug);
  if (!data) notFound();
  const service = data as ResearchGenericRecord;
  const attachments = Array.isArray(service.attachments) ? (service.attachments as ResearchGenericRecord[]) : [];
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Research Support" title={service.name ?? "Research support service"} body={compactText(service.summary) || compactText(service.description)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name ?? "Service" }]} labels={[service.service_type, service.category, service.is_free ? "free" : null]} facts={[{ label: "Turnaround", value: service.turnaround_time }, { label: "Cost", value: service.is_free ? "Free" : compactText(service.fee_structure) }, { label: "Email", value: service.contact_email }, { label: "Attachments", value: attachments.length }]} actions={[{ label: "Back to services", href: "/services", variant: "secondary" }, ...(compactText(service.request_url) ? [{ label: "Request service", href: compactText(service.request_url) }] : [])]} imageSrc="/images/research/research-about-hero.svg" imageAlt="Research support access and request information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Service Detail" title="Scope, process, and access" body="Service detail pages describe how to request the service, who is eligible, what is delivered, timing, fees, and contact." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5"><ResearchTextPanel title="Overview" fields={[["Summary", service.summary], ["Description", service.description], ["Scope", service.scope]]} /><ResearchTextPanel title="Request process" fields={[["How to access", service.how_to_access], ["Process", service.process], ["Eligibility", service.eligibility]]} /><ResearchTextPanel title="Deliverables" fields={[["Deliverables", service.deliverables], ["Fee structure", service.fee_structure]]} /></div>
          <ResearchDetailSidebar
            labels={[service.service_type ?? "service", service.category, service.is_free ? "free" : null]}
            facts={[
              { label: "Turnaround", value: service.turnaround_time },
              { label: "Cost", value: service.is_free ? "Free" : compactText(service.fee_structure) },
              { label: "Contact name", value: service.contact_name },
              { label: "Email", value: service.contact_email },
              { label: "Phone", value: service.contact_phone },
            ]}
            actions={compactText(service.request_url) ? [{ label: "Request service", href: compactText(service.request_url) }] : []}
          />
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Resources" title="Service attachments" body="Supporting service files appear when published."><ResearchRecordGrid records={attachments} /></ResearchSection>
    </main>
  );
}
