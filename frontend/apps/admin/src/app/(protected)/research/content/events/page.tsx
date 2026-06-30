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
      getRecordDetailHref={(record) => `/research/content/events/${record.id}`}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "rich_text", label: "Body", type: "richtext" },
        { name: "start_date", label: "Start Date", type: "datetime-local", required: true },
        { name: "end_date", label: "End Date", type: "datetime-local" },
        { name: "location", label: "Location" },
        { name: "meeting_link", label: "Registration or Meeting URL", type: "url" },
        { name: "scope_id", label: "Research Binding", type: "entity-record", entityRecord: {
          typeName: "scope_type",
          idName: "scope_id",
          description: "Attach the event to a real research record when the content service supports the selected scope.",
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
      defaults={{ scope_type: "research", status: "draft", is_published: false }}
      emptyMessage="No research event records were returned by the main content service."
      metaFields={["location", "start_date", "status"]}
    />
  );
}
