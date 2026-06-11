import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getGuidelineBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function GuidelineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGuidelineBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Guideline"
      fallbackTitle="Research guideline"
      fallbackBody="Guideline record loaded from the Research service."
      backLabel="Guidelines"
      backHref="/guidelines"
      labelFields={["guideline_type", "category", "status"]}
      factFields={[
        { label: "Version", field: "version" },
        { label: "Effective", field: "effective_date", format: "date" },
        { label: "Review", field: "review_date", format: "date" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "content"] },
        { title: "Scope", fields: ["scope", "applicability", "related_guidelines"] },
        { title: "Document", fields: ["document_url", "approved_by"] },
      ]}
    />
  );
}
