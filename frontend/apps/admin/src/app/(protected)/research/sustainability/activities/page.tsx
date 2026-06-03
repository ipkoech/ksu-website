"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function SustainabilityActivitiesPage() {
  return (
    <ResearchResourcePage
      title="Sustainability Activities"
      description="Manage sustainability workshops, seminars, field days, and climate events."
      queryKey={["research", "sustainability-activities"]}
      resource={researchServiceApi.events}
      manageScopes={["sustainability.manage", "content.manage_announcements", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "event_type", label: "Activity Type", placeholder: "workshop" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date", required: true },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "venue", label: "Venue" },
        { name: "status", label: "Status", placeholder: "upcoming" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ event_type: "workshop", status: "upcoming" }}
      emptyMessage="No sustainability activities were returned by the research service."
    />
  );
}
