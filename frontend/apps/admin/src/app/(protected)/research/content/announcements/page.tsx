"use client";

import { announcementsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";

export default function ResearchAnnouncementsPage() {
  return (
    <ResearchContentResourcePage
      title="Research Announcements"
      description="Manage announcement records scoped to research."
      queryKey={["research", "content", "announcements"]}
      resource={{ list: announcementsApi.list, create: announcementsApi.create, update: announcementsApi.update, delete: announcementsApi.delete }}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "priority", label: "Priority", placeholder: "low" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_published", label: "Published", type: "boolean" },
      ]}
      defaults={{ priority: "low", status: "draft", is_published: false }}
      emptyMessage="No research announcement records were returned by the main content service."
      metaFields={["priority", "status"]}
    />
  );
}
