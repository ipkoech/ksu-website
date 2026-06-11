"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchOfficePage() {
  return (
    <ResearchResourcePage
      title="Research Office"
      description="Manage the research office profile, department link, about content, objectives, services summary, and contact details."
      queryKey={["research", "offices"]}
      resource={researchServiceApi.offices}
      manageScopes={["research.manage_office", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "department_id", label: "Research Department", type: "entity", relation: { adapter: "department", filters: { department_type: "administrative" } } },
        { name: "director_id", label: "Director", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "about", label: "About", type: "textarea" },
        { name: "mandate", label: "Mandate", type: "textarea" },
        { name: "mission", label: "Mission", type: "textarea" },
        { name: "vision", label: "Vision", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "functions", label: "Functions", type: "textarea" },
        { name: "services_summary", label: "Services Summary", type: "textarea" },
        { name: "leadership_message", label: "Leadership Message", type: "textarea" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "location", label: "Location" },
        { name: "website", label: "Website", type: "url" },
        { name: "logo_image_url", label: "Logo Image URL", type: "url" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Draft", value: "draft" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "active" }}
      emptyMessage="No research office profile was returned by the research service."
    />
  );
}
