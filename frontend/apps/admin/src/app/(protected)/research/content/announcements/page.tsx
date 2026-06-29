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
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "content", label: "Content", type: "textarea" },
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
        { name: "is_published", label: "Published", type: "boolean" },
      ]}
      defaults={{ priority: "low", status: "draft", is_published: false }}
      emptyMessage="No research announcement records were returned by the main content service."
      metaFields={["priority", "status"]}
    />
  );
}
