"use client";

import { blogsApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../_components/content-record-detail-page";

export default function ResearchBlogDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Research Blog"
      description="View research-scoped blog metadata, publishing state, media attachments, scope binding, and audit history."
      backHref="/research/content/blogs"
      entityType="blog"
      resourceType="blog"
      resource={{ get: blogsApi.get }}
    />
  );
}
