import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getProjectBySlug } from "../../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getProjectBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data as ResearchGenericRecord}
      error={error}
      eyebrow="Research Project"
      fallbackTitle="Research project"
      fallbackBody="Project record loaded from the Research service."
      backLabel="Projects"
      backHref="/projects"
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Updated", field: "updated_at", format: "date" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes"] },
        { title: "Impact", fields: ["impact", "deliverables"] },
      ]}
    />
  );
}
