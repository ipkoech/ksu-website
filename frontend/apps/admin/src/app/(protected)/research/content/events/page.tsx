"use client";

import { eventsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";

export default function ResearchEventsPage() {
  return (
    <ResearchContentResourcePage
      title="Research Events"
      description="Manage event records scoped to research."
      queryKey={["research", "content", "events"]}
      resource={{ list: eventsApi.listAdmin, create: eventsApi.create, update: eventsApi.update, delete: eventsApi.delete }}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "event_type", label: "Event Type" },
        { name: "start_date", label: "Start Date", type: "datetime-local", required: true },
        { name: "end_date", label: "End Date", type: "datetime-local" },
        { name: "location", label: "Location" },
        { name: "registration_url", label: "Registration URL", type: "url" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_published", label: "Published", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "draft", is_published: false }}
      emptyMessage="No research event records were returned by the main content service."
      metaFields={["event_type", "start_date", "status"]}
    />
  );
}
