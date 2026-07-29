"use client";

import { announcementsApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../_components/content-record-detail-page";

export default function ResearchAnnouncementDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Research Announcement"
      description="View research announcement metadata, priority, scope binding, media attachments, and audit history."
      backHref="/research/content/announcements"
      entityType="announcement"
      resourceType="announcement"
      resource={{ get: announcementsApi.get }}
      factFields={[
        { label: "Priority", field: "priority", format: "label" },
        { label: "Audience", field: "audience", format: "label" },
      ]}
      sections={[
        { title: "Announcement", fields: ["target_audience", "youtube_url", "deleted_at"] },
      ]}
    />
  );
}
