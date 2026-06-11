import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getTrainingBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function TrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getTrainingBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Training"
      backLabel="Training"
      backHref="/training"
      labelFields={["program_type", "delivery_mode", "status"]}
      factFields={[
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Venue", field: "venue" },
        { label: "Hours", field: "duration_hours" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Programme", fields: ["objectives", "curriculum", "outcomes"] },
        { title: "Registration", fields: ["target_audience", "prerequisites", "registration_deadline"] },
      ]}
    />
  );
}
