"use client";

import { eventsApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../_components/content-record-detail-page";

export default function ResearchEventDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Research Event"
      description="View research event schedule, scoped research binding, media attachments, and audit history."
      backHref="/research/content/events"
      entityType="event"
      resourceType="event"
      resource={{ get: eventsApi.get }}
      factFields={[
        { label: "Start", field: "start_date", format: "datetime" },
        { label: "End", field: "end_date", format: "datetime" },
        { label: "Virtual", field: "is_virtual", format: "boolean" },
      ]}
      sections={[
        { title: "Event", fields: ["event_type", "location", "venue", "meeting_link", "virtual_link", "registration_deadline", "max_attendees"] },
      ]}
    />
  );
}
