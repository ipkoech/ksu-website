"use client";

import { newsApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../_components/content-record-detail-page";

export default function ResearchNewsDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Research News"
      description="View research-scoped news metadata, publishing state, media attachments, scope binding, and audit history."
      backHref="/research/content/news"
      entityType="news"
      resourceType="news"
      resource={{ get: newsApi.get }}
    />
  );
}
