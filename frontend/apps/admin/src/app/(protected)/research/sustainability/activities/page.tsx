"use client";

import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@ksu/api-client";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import {
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";
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
  { key: "binding", label: "Research Binding", className: "hidden min-w-[220px] xl:table-cell", render: (record) => <ScopedResearchBinding record={record} /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

const scopeAdapters: Record<string, keyof typeof relationshipAdapters> = {
  research_project: "researchProject",
  research_farm: "researchFarm",
  research_center: "researchCenter",
  research_grant: "researchGrant",
  research_sustainability: "researchSustainability",
};

function ScopedResearchBinding({ record }: { record: Record<string, any> }) {
  const scopeType = String(record.scope_type ?? "");
  const scopeId = record.scope_id ? String(record.scope_id) : "";
  const adapterKey = scopeAdapters[scopeType];
  const adapter = adapterKey ? (relationshipAdapters[adapterKey] as RelationshipAdapter) : null;
  const relationQuery = useQuery({
    queryKey: ["research", "activities", "scope", scopeType, scopeId],
    queryFn: () => adapter!.get(scopeId),
    enabled: Boolean(adapter && scopeId),
  });

  if (!scopeType || scopeType === "research") {
    return <span className="text-muted-foreground">Research portal</span>;
  }
  if (!adapter || !scopeId) {
    return <span className="text-muted-foreground">{scopeType.replace(/_/g, " ")}</span>;
  }
  if (relationQuery.isLoading) {
    return <span className="text-muted-foreground">Loading binding...</span>;
  }
  return (
    <div className="space-y-1">
      <p className="font-medium">{relationQuery.data?.label ?? "Linked record unavailable"}</p>
      <p className="text-xs text-muted-foreground">{scopeType.replace(/_/g, " ")}</p>
    </div>
  );
}

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
        { name: "scope_id", label: "Research Binding", type: "entity-record", entityRecord: {
          typeName: "scope_type",
          idName: "scope_id",
          description: "Attach this activity to a real research project, center, or grant when applicable.",
          typePlaceholder: "Select research scope",
          recordPlaceholder: "Select linked record",
          configs: [
            { value: "research", label: "Research Portal", adapter: "researchCenter", recordRequired: false },
            { value: "research_project", label: "Research Project", adapter: "researchProject", filters: { is_active: true } },
            { value: "research_farm", label: "Research Farm", adapter: "researchFarm", filters: { is_active: true } },
            { value: "research_center", label: "Research Center", adapter: "researchCenter", filters: { is_active: true } },
            { value: "research_grant", label: "Research Grant", adapter: "researchGrant", filters: { is_active: true } },
            { value: "research_sustainability", label: "Sustainability Initiative", adapter: "researchSustainability", filters: { is_active: true } },
          ],
          allowNone: false,
        } },
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
