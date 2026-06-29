"use client";

import { eventsApi } from "@ksu/api-client";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { DateValue, StatusBadge } from "../../_components/research-workspace";
import { SustainabilityWorkspaceHeader } from "../_components/sustainability-workspace";

const activityFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search title, venue, or summary" },
  { name: "event_type", label: "Activity Type", type: "select", options: [
    { label: "Workshop", value: "workshop" },
    { label: "Seminar", value: "seminar" },
    { label: "Conference", value: "conference" },
    { label: "Webinar", value: "webinar" },
    { label: "Symposium", value: "symposium" },
  ] },
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
  { key: "location", label: "Location", className: "hidden min-w-[200px] lg:table-cell", render: (record) => <span>{record.venue ?? record.location ?? "No location"}</span> },
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
      listParams={{ event_type: "workshop" }}
      summarySlot={<SustainabilityWorkspaceHeader />}
      listFilters={activityFilters}
      recordColumns={activityColumns}
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
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date", required: true },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "venue", label: "Venue" },
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
      defaults={{ event_type: "workshop", status: "upcoming" }}
      emptyMessage="No sustainability activities were returned by the main content service."
    />
  );
}
