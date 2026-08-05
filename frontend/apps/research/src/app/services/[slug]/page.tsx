import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import { compactText, generateSlugParams, getServiceBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTimelineLabel, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.services.list);
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getServiceBySlug(slug);
  if (!data) notFound();
  const service = data as ResearchGenericRecord;
  const attachments = Array.isArray(service.attachments) ? (service.attachments as ResearchGenericRecord[]) : [];
  const storySections = getNarrativeSections(service, [
    { title: "What the service covers", fields: ["summary", "description", "scope"] },
    { title: "How requests move", fields: ["how_to_access", "process", "request_process"] },
    { title: "What you receive", fields: ["deliverables", "outputs", "turnaround_time"] },
    { title: "Who can use it", fields: ["eligibility", "requirements", "fee_structure"] },
  ]);
  const title = getRecordTitle(service, "Research support service");
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Research Support" title={title} body={getRecordSummary(service)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: title }]} labels={[service.service_type, service.category, service.status, service.is_free ? "free" : null, service.is_featured ? "featured" : null]} facts={[{ label: "Turnaround", value: service.turnaround_time }, { label: "Cost", value: service.is_free ? "Free" : compactText(service.fee_structure) }, { label: "Email", value: service.contact_email }, { label: "Updated", value: getRecordTimelineLabel(service) }]} actions={[{ label: "Back to services", href: "/services", variant: "secondary" }, ...(compactText(service.request_url) ? [{ label: "Request service", href: compactText(service.request_url) }] : [])]} imageSrc="/images/research/research-about-hero.svg" imageAlt="Research support access and request information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Service Story" title="Scope, request path, and delivery" body="Published service fields are arranged into action-focused sections so the page stays compact while preserving the full backend record." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ServiceStory sections={storySections} />
            <ResearchRecordPanel title="Service attachments" records={attachments} empty="No supporting service files are published yet." />
          </div>
          <ResearchDetailSidebar
            labels={[service.service_type ?? "service", service.category, service.status, service.is_free ? "free" : null]}
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
    </main>
  );
}

function ServiceStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="Service story sections appear when scope, process, eligibility, or deliverable fields are published."
    />
  );
}
