import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getResourceBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getResourceBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Resource"
      backLabel="Resources"
      backHref="/resources-tools"
      labelFields={["resource_type", "category", "status"]}
      factFields={[
        { label: "Access", field: "access_type", format: "label" },
        { label: "Location", field: "location" },
        { label: "Contact", field: "contact_email" },
      ]}
      sections={[
        { title: "Description", fields: ["description", "summary"] },
        { title: "Access", fields: ["usage_guidelines", "availability", "operating_hours", "access_url"] },
        { title: "Capabilities", fields: ["specifications", "capabilities"] },
      ]}
    />
  );
}
