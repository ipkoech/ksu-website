import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordGrid, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatLabel, generateSlugParams, getResourceBySlug } from "../../../lib/research-public-data";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.resources.list);
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getResourceBySlug(slug);
  if (!data) notFound();
  const resource = data as ResearchGenericRecord;
  const attachments = Array.isArray(resource.attachments) ? (resource.attachments as ResearchGenericRecord[]) : [];
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Resource / Tool" title={resource.name ?? "Research resource"} body={compactText(resource.description) || compactText(resource.capabilities)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources & Tools", href: "/resources-tools" }, { label: resource.name ?? "Resource" }]} labels={[resource.resource_type, resource.category, resource.status]} facts={[{ label: "Access", value: formatLabel(resource.access_type) }, { label: "Location", value: [resource.location, resource.room].map(compactText).filter(Boolean).join(" · ") }, { label: "Cost", value: resource.is_free ? "Free" : compactText(resource.fee_structure) }, { label: "Attachments", value: attachments.length }]} actions={[{ label: "Back to resources", href: "/resources-tools", variant: "secondary" }, ...(compactText(resource.booking_url) ? [{ label: "Book resource", href: compactText(resource.booking_url) }] : []), ...(compactText(resource.access_url) ? [{ label: "Open access", href: compactText(resource.access_url) }] : [])]} imageSrc="/images/research/research-home-hero.svg" imageAlt="Research resource access, booking, and capability information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Access Detail" title="Capabilities, usage, and booking" body="Resource detail pages show where the tool is, what it can support, how to access it, and who manages it." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5"><ResearchTextPanel title="Description" fields={[["Description", resource.description], ["Specifications", resource.specifications], ["Capabilities", resource.capabilities]]} /><ResearchTextPanel title="Usage" fields={[["Usage guidelines", resource.usage_guidelines], ["Training required", resource.training_required], ["Availability", resource.availability], ["Operating hours", resource.operating_hours], ["Fee structure", resource.fee_structure]]} /></div>
          <ResearchDetailSidebar
            labels={[resource.resource_type ?? "resource", resource.category, resource.status]}
            facts={[
              { label: "Access", value: formatLabel(resource.access_type) },
              { label: "Location", value: [resource.location, resource.room].map(compactText).filter(Boolean).join(" · ") },
              { label: "Cost", value: resource.is_free ? "Free" : compactText(resource.fee_structure) },
              { label: "Contact", value: [resource.contact_name, resource.contact_email, resource.contact_phone].map(compactText).filter(Boolean).join(" · ") },
            ]}
            actions={[
              ...(compactText(resource.booking_url) ? [{ label: "Book resource", href: compactText(resource.booking_url) }] : []),
              ...(compactText(resource.access_url) ? [{ label: "Open access link", href: compactText(resource.access_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Downloads" title="Supporting files" body="Attachments are shown when published."><ResearchRecordGrid records={attachments} /></ResearchSection>
    </main>
  );
}
