import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getProgramBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getProgramBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Program"
      backLabel="Programs"
      backHref="/programs"
      labelFields={["program_type", "status"]}
      factFields={[
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Budget", field: "budget" },
        { label: "Currency", field: "currency" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Design", fields: ["objectives", "expected_outcomes", "methodology"] },
      ]}
    />
  );
}
