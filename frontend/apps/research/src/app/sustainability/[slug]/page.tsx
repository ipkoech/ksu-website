import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getSustainabilityBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function SustainabilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getSustainabilityBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Sustainability"
      backLabel="Sustainability"
      backHref="/sustainability"
      labelFields={["initiative_type", "status"]}
      factFields={[
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Contact", field: "contact_email" },
        { label: "Website", field: "website" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Approach", fields: ["objectives", "approach", "activities"] },
        { title: "Impact", fields: ["impact", "sdg_goals"] },
      ]}
    />
  );
}
