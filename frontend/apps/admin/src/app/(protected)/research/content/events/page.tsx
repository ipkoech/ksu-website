"use client";

import { eventsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { ContentWorkspaceHeader, contentColumns, contentFilters } from "../_components/content-workspace";

export default function ResearchEventsPage() {
  return (
    <ResearchContentResourcePage
      title="Research Events"
      description="Manage event records scoped to research."
      queryKey={["research", "content", "events"]}
      resource={{ list: eventsApi.listAdmin, create: eventsApi.create, update: eventsApi.update, delete: eventsApi.delete }}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={contentFilters}
      recordColumns={contentColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "rich_text", label: "Body", type: "richtext" },
        { name: "start_date", label: "Start Date", type: "datetime-local", required: true },
        { name: "end_date", label: "End Date", type: "datetime-local" },
        { name: "location", label: "Location" },
        { name: "meeting_link", label: "Registration or Meeting URL", type: "url" },
        { name: "featured_media_id", label: "Featured Media", type: "media", media: { mediaType: "image", uploadEntityType: "research", uploadRole: "featured" } },
        { name: "author_user_id", label: "Owner", type: "entity", relation: { adapter: "user", filters: { is_active: true } } },
        { name: "is_virtual", label: "Virtual", type: "boolean" },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "is_published", label: "Published", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "draft", is_published: false }}
      emptyMessage="No research event records were returned by the main content service."
      metaFields={["location", "start_date", "status"]}
    />
  );
}
