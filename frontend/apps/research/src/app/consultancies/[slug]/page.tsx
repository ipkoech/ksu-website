import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getConsultancyBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ConsultancyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getConsultancyBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Consultancy"
      backLabel="Consultancies"
      backHref="/consultancies"
      labelFields={["consultancy_type", "category", "status"]}
      factFields={[
        { label: "Client", field: "client_name" },
        { label: "Value", field: "contract_value" },
        { label: "Start", field: "start_date", format: "date" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Scope", fields: ["scope", "deliverables", "impact"] },
      ]}
    />
  );
}
