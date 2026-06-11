import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getCenterBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function CenterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getCenterBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Center"
      fallbackTitle="Research center"
      fallbackBody="Center record loaded from the Research service."
      backLabel="Centers"
      backHref="/centers"
      labelFields={["center_type", "status"]}
      factFields={[
        { label: "Location", field: "location" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Website", field: "website" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Mandate", fields: ["mandate", "mission", "vision", "objectives"] },
        { title: "Research Areas", fields: ["research_areas"] },
      ]}
    />
  );
}
