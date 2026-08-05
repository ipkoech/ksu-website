"use client";

import { eventsApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../../content/_components/content-record-detail-page";

export default function SustainabilityActivityDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Sustainability Activity"
      description="View sustainability activity schedule, research scope binding, media attachments, and audit history from the main events service."
      backHref="/research/sustainability/activities"
      entityType="event"
      resourceType="event"
      resource={{ get: eventsApi.get }}
      factFields={[
        { label: "Start", field: "start_date", format: "datetime" },
        { label: "End", field: "end_date", format: "datetime" },
        { label: "Virtual", field: "is_virtual", format: "boolean" },
      ]}
      sections={[
        { title: "Activity", fields: ["event_type", "location", "venue", "meeting_link", "virtual_link"] },
      ]}
    />
  );
}
