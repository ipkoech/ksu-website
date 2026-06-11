import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getEventBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getEventBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Event"
      backLabel="Events"
      backHref="/events"
      labelFields={["event_type", "category", "status"]}
      factFields={[
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Venue", field: "venue" },
        { label: "Organizer", field: "organizer_name" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Access", fields: ["meeting_link", "registration_url", "platform"] },
      ]}
    />
  );
}
