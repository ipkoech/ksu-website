"use client";

import { announcementsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { ContentWorkspaceHeader, contentColumns, contentFilters } from "../_components/content-workspace";

export default function ResearchAnnouncementsPage() {
  return (
    <ResearchContentResourcePage
      title="Research Announcements"
      description="Manage announcement records scoped to research."
      queryKey={["research", "content", "announcements"]}
      resource={{ list: announcementsApi.list, create: announcementsApi.create, update: announcementsApi.update, delete: announcementsApi.delete }}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={contentFilters}
      recordColumns={contentColumns}
      getRecordDetailHref={(record) => `/research/content/announcements/${record.id}`}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "rich_text", label: "Body", type: "richtext" },
        { name: "featured_media_id", label: "Featured Media", type: "media", media: { mediaType: "image", uploadEntityType: "research", uploadRole: "featured" } },
        { name: "author_user_id", label: "Author", type: "entity", relation: { adapter: "user", filters: { is_active: true } } },
        { name: "priority", label: "Priority", type: "select", options: [
          { label: "Low", value: "low" },
          { label: "Normal", value: "normal" },
          { label: "High", value: "high" },
          { label: "Urgent", value: "urgent" },
        ] },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "category", label: "Category" },
        { name: "audience", label: "Audience" },
        { name: "published_at", label: "Publish Date", type: "datetime-local" },
        { name: "is_published", label: "Published", type: "boolean" },
      ]}
      defaults={{ priority: "normal", audience: "all", status: "draft", is_published: false }}
      emptyMessage="No research announcement records were returned by the main content service."
      metaFields={["priority", "status"]}
    />
  );
}
