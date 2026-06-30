"use client";

import { eventsApi } from "@ksu/api-client";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { DateValue, StatusBadge } from "../../_components/research-workspace";
import { FarmWorkspaceHeader } from "../_components/farm-workspace";

const activityFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search activity title, venue, or summary" },
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
  { key: "type", label: "Type", className: "hidden w-[140px] xl:table-cell", render: (record) => <span>{String(record.event_type ?? "").replace(/_/g, " ")}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export default function FarmActivitiesPage() {
  return (
    <ResearchContentResourcePage
      title="Farm Activities"
      description="Manage farm workshops, field days, demonstrations, and community training events."
      queryKey={["research", "farm", "activities"]}
      resource={{ list: eventsApi.listAdmin, create: eventsApi.create, update: eventsApi.update, delete: eventsApi.delete }}
      manageScopes={["content.manage_events", "admin:*"]}
      listParams={{ event_type: "workshop" }}
      summarySlot={<FarmWorkspaceHeader />}
      listFilters={activityFilters}
      recordColumns={activityColumns}
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
        { name: "scope_id", label: "Research Binding", type: "entity-record", entityRecord: {
          typeName: "scope_type",
          idName: "scope_id",
          description: "Attach this activity to a supported research record exposed by the main events API.",
          typePlaceholder: "Select research scope",
          recordPlaceholder: "Select linked record",
          configs: [
            { value: "research", label: "Research Portal", adapter: "researchCenter", recordRequired: false },
            { value: "research_project", label: "Research Project", adapter: "researchProject", filters: { is_active: true } },
            { value: "research_center", label: "Research Center", adapter: "researchCenter", filters: { is_active: true } },
            { value: "research_grant", label: "Research Grant", adapter: "researchGrant", filters: { is_active: true } },
          ],
          allowNone: false,
        } },
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
        scope_type: "research",
        status: "upcoming",
        is_active: true,
        is_virtual: false,
        is_hybrid: false,
      }}
      emptyMessage="No farm activities were returned by the main content service."
    />
  );
}
