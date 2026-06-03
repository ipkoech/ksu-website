"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function FarmActivitiesPage() {
  return (
    <ResearchResourcePage
      title="Farm Activities"
      description="Manage farm workshops, field days, demonstrations, and community training events."
      queryKey={["research", "farm", "activities"]}
      resource={researchServiceApi.events}
      manageScopes={["sustainability.manage", "content.manage_announcements", "research:write"]}
      listParams={{ is_active: true, event_type: "workshop" }}
      metaFields={["event_type", "start_date", "venue", "status"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "event_type", label: "Activity Type", type: "select", placeholder: "Select activity", options: [
          { label: "Workshop", value: "workshop" },
          { label: "Seminar", value: "seminar" },
          { label: "Conference", value: "conference" },
          { label: "Webinar", value: "webinar" },
          { label: "Symposium", value: "symposium" },
        ] },
        { name: "organizer_name", label: "Organizer" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date", required: true },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "venue", label: "Venue" },
        { name: "is_virtual", label: "Virtual", type: "boolean" },
        { name: "is_hybrid", label: "Hybrid", type: "boolean" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Upcoming", value: "upcoming" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Completed", value: "completed" },
          { label: "Postponed", value: "postponed" },
          { label: "Cancelled", value: "cancelled" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{
        event_type: "workshop",
        status: "upcoming",
        is_active: true,
        is_virtual: false,
        is_hybrid: false,
      }}
      emptyMessage="No farm activities were returned by the research service."
    />
  );
}
