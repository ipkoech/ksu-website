import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getMentorshipBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function MentorshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getMentorshipBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Mentorship"
      fallbackTitle="Mentorship programme"
      fallbackBody="Mentorship record loaded from the Research service."
      backLabel="Mentorship"
      backHref="/mentorship"
      labelFields={["program_type", "mentorship_type", "status"]}
      factFields={[
        { label: "Duration", field: "duration" },
        { label: "Commitment", field: "weekly_commitment" },
        { label: "Applications Open", field: "application_open", format: "date" },
        { label: "Deadline", field: "application_deadline", format: "date" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description", "objectives"] },
        { title: "Requirements", fields: ["mentor_requirements", "mentee_requirements", "expectations"] },
        { title: "Guidance", fields: ["benefits", "guidelines"] },
      ]}
    />
  );
}
