import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getScholarshipBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getScholarshipBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Scholarship"
      backLabel="Scholarships"
      backHref="/scholarships"
      labelFields={["scholarship_type", "status"]}
      factFields={[
        { label: "Funder", field: "funder_name" },
        { label: "Value", field: "value" },
        { label: "Deadline", field: "application_deadline", format: "date" },
        { label: "Available", field: "number_available" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Eligibility", fields: ["eligibility", "requirements", "selection_criteria"] },
        { title: "Award", fields: ["benefits", "obligations", "duration"] },
      ]}
    />
  );
}
