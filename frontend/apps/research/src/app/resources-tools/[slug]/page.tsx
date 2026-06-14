import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchFact, ResearchRecordGrid, ResearchTextPanel } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
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
      <ResearchDetailHero eyebrow="Resource / Tool" title={resource.name ?? "Research resource"} body={compactText(resource.description) || compactText(resource.capabilities)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources & Tools", href: "/resources-tools" }, { label: resource.name ?? "Resource" }]} labels={[resource.resource_type, resource.category, resource.status]} facts={[{ label: "Access", value: formatLabel(resource.access_type) }, { label: "Location", value: [resource.location, resource.room].map(compactText).filter(Boolean).join(" · ") }, { label: "Cost", value: resource.is_free ? "Free" : compactText(resource.fee_structure) }, { label: "Attachments", value: attachments.length }]} actions={[{ label: "Back to resources", href: "/resources-tools", variant: "secondary" }, ...(compactText(resource.booking_url) ? [{ label: "Book resource", href: compactText(resource.booking_url) }] : []), ...(compactText(resource.access_url) ? [{ label: "Open access", href: compactText(resource.access_url) }] : [])]} imageSrc="/images/research/research-hero-imagegen.png" imageAlt="Research resource access, booking, and capability information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Access Detail" title="Capabilities, usage, and booking" body="Resource detail pages show where the tool is, what it can support, how to access it, and who manages it." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5"><ResearchTextPanel title="Description" fields={[["Description", resource.description], ["Specifications", resource.specifications], ["Capabilities", resource.capabilities]]} /><ResearchTextPanel title="Usage" fields={[["Usage guidelines", resource.usage_guidelines], ["Training required", resource.training_required], ["Availability", resource.availability], ["Operating hours", resource.operating_hours], ["Fee structure", resource.fee_structure]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(resource.resource_type ?? "resource")}</Badge>{resource.category ? <Badge>{formatLabel(resource.category)}</Badge> : null}{resource.status ? <Badge>{formatLabel(resource.status)}</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><ResearchFact label="Access" value={formatLabel(resource.access_type)} /><ResearchFact label="Location" value={[resource.location, resource.room].map(compactText).filter(Boolean).join(" · ")} /><ResearchFact label="Cost" value={resource.is_free ? "Free" : compactText(resource.fee_structure)} /><ResearchFact label="Contact" value={[resource.contact_name, resource.contact_email, resource.contact_phone].map(compactText).filter(Boolean).join(" · ")} /></dl>{compactText(resource.booking_url) ? <a href={resource.booking_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Book resource</a> : null}{compactText(resource.access_url) ? <a href={resource.access_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Open access link</a> : null}</aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Downloads" title="Supporting files" body="Attachments are shown when published."><ResearchRecordGrid records={attachments} /></ResearchSection>
    </main>
  );
}
