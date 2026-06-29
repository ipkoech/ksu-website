"use client";

import { eventsApi } from "@ksu/api-client";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { DateValue, StatusBadge } from "../../_components/research-workspace";
import { SustainabilityWorkspaceHeader } from "../_components/sustainability-workspace";

const activityFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search title, venue, or summary" },
  { name: "upcoming", label: "Upcoming", type: "boolean" },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Postponed", value: "postponed" },
    { label: "Cancelled", value: "cancelled" },
  ] },
];

const activityColumns: Array<EditableRecordColumn<Record<string, any> & { id: string }>> = [
  { key: "title", label: "Event / Activity", className: "min-w-[260px]", render: (record) => <span className="font-medium">{record.title}</span> },
  { key: "date", label: "Date", className: "w-[150px]", render: (record) => <DateValue value={record.start_date} /> },
  { key: "location", label: "Location", className: "hidden min-w-[200px] lg:table-cell", render: (record) => <span>{record.location ?? "No location"}</span> },
  { key: "project", label: "Linked Project", className: "hidden min-w-[170px] xl:table-cell", render: (record) => <span className="text-muted-foreground">{record.project?.title ?? record.project_title ?? "Not exposed by Events API"}</span> },
  { key: "partner", label: "Partner", className: "hidden min-w-[160px] xl:table-cell", render: (record) => <span className="text-muted-foreground">{record.partner?.name ?? record.partner_name ?? "Not exposed by Events API"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export default function SustainabilityActivitiesPage() {
  return (
    <ResearchContentResourcePage
      title="Sustainability Activities"
      description="Manage sustainability workshops, seminars, field days, and climate events."
      queryKey={["research", "sustainability-activities"]}
      resource={{ list: eventsApi.listAdmin, create: eventsApi.create, update: eventsApi.update, delete: eventsApi.delete }}
      manageScopes={["content.manage_events", "admin:*"]}
      listParams={{ scope_type: "research" }}
      summarySlot={<SustainabilityWorkspaceHeader />}
      listFilters={activityFilters}
      recordColumns={activityColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "datetime-local", required: true },
        { name: "end_date", label: "End Date", type: "datetime-local" },
        { name: "location", label: "Location" },
        { name: "meeting_link", label: "Registration or Meeting URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Upcoming", value: "upcoming" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Completed", value: "completed" },
          { label: "Postponed", value: "postponed" },
          { label: "Cancelled", value: "cancelled" },
        ] },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_published", label: "Published", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ scope_type: "research", status: "upcoming", is_public: true }}
      emptyMessage="No sustainability activities were returned by the main content service."
    />
  );
}
