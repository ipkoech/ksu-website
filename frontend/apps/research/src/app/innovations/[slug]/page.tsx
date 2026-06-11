import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getInnovationBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function InnovationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getInnovationBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Innovation"
      fallbackTitle="Innovation"
      fallbackBody="Innovation record loaded from the Research service."
      backLabel="Innovations"
      backHref="/innovations"
      labelFields={["innovation_type", "category", "status"]}
      factFields={[
        { label: "TRL", field: "trl_level" },
        { label: "IP Status", field: "ip_status", format: "label" },
        { label: "Commercialization", field: "commercialization_status", format: "label" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Problem and Value", fields: ["problem_addressed", "value_proposition", "market_potential"] },
      ]}
    />
  );
}
