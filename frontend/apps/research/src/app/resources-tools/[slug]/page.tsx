import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import { getResearchRecordDownloadHref } from "../../../lib/research-downloads";
import { compactText, formatLabel, generateSlugParams, getResourceBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTimelineLabel, getRecordTitle } from "../../../lib/research-page-model";

import { researchRecordMetadata } from "../../../lib/research-metadata";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getResourceBySlug(slug);
  return researchRecordMetadata(data, { fallbackTitle: "Research resource", pathname: "/resources-tools/" + slug });
}

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.resources.list);
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getResourceBySlug(slug);
  if (!data) notFound();
  const resource = data as ResearchGenericRecord;
  const attachments = Array.isArray(resource.attachments) ? (resource.attachments as ResearchGenericRecord[]) : [];
  const storySections = getNarrativeSections(resource, [
    { title: "What it supports", fields: ["description", "capabilities", "specifications"] },
    { title: "How access works", fields: ["access_instructions", "usage_guidelines", "how_to_access", "availability"] },
    { title: "What to prepare", fields: ["training_required", "requirements", "operating_hours", "fee_structure"] },
  ]);
  const title = getRecordTitle(resource, "Research resource");
  const contact = [resource.contact_name, resource.contact_email, resource.contact_phone].map(compactText).filter(Boolean).join(" · ");
  const downloadHref = getResearchRecordDownloadHref(resource, "resource");
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Resource / Tool" title={title} body={getRecordSummary(resource) || compactText(resource.capabilities)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources & Tools", href: "/resources-tools" }, { label: title }]} labels={[resource.resource_type, resource.category, resource.status, resource.is_featured ? "featured" : null]} facts={[{ label: "Access", value: formatLabel(resource.access_type) }, { label: "Location", value: [resource.location, resource.room].map(compactText).filter(Boolean).join(" · ") }, { label: "Cost", value: resource.is_free ? "Free" : compactText(resource.fee_structure) }, { label: "Updated", value: getRecordTimelineLabel(resource) }]} actions={[{ label: "Back to resources", href: "/resources-tools", variant: "secondary" }, ...(downloadHref ? [{ label: "Download file", href: downloadHref }] : []), ...(compactText(resource.booking_url) ? [{ label: "Book resource", href: compactText(resource.booking_url) }] : []), ...(compactText(resource.access_url) ? [{ label: "Open access", href: compactText(resource.access_url), variant: "secondary" as const }] : [])]} imageSrc="/images/research/research-home-hero.svg" imageAlt="Research resource access, booking, and capability information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Access Story" title="What this resource enables" body="Published resource fields are arranged around support, access, and preparation so visitors can act without scrolling through long document-style blocks." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResourceStory sections={storySections} />
            <ResearchRecordPanel title="Supporting files" records={attachments} empty="No supporting files are published for this resource yet." />
          </div>
          <ResearchDetailSidebar
            labels={[resource.resource_type ?? "resource", resource.category, resource.status]}
            facts={[
              { label: "Access", value: formatLabel(resource.access_type) },
              { label: "Location", value: [resource.location, resource.room].map(compactText).filter(Boolean).join(" · ") },
              { label: "Cost", value: resource.is_free ? "Free" : compactText(resource.fee_structure) },
              { label: "Operating hours", value: compactText(resource.operating_hours) },
              { label: "Contact", value: contact },
            ]}
            actions={[
              ...(downloadHref ? [{ label: "Download file", href: downloadHref }] : []),
              ...(compactText(resource.booking_url) ? [{ label: "Book resource", href: compactText(resource.booking_url) }] : []),
              ...(compactText(resource.access_url) ? [{ label: "Open access link", href: compactText(resource.access_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function ResourceStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="Resource story sections appear when capability, access, or usage fields are published."
    />
  );
}
