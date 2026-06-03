"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchResourcesPage() {
  return (
    <ResearchResourcePage
      title="Research Resources"
      description="Manage research equipment, facilities, spaces, and access details."
      queryKey={["research", "resources"]}
      resource={researchServiceApi.resources}
      manageScopes={["research.manage_guidelines", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "resource_type", label: "Resource Type", placeholder: "equipment" },
        { name: "category", label: "Category" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "department_id", label: "Department", type: "entity", relation: { adapter: "department" } },
        { name: "location", label: "Location" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "access_type", label: "Access Type", placeholder: "internal" },
        { name: "booking_url", label: "Booking URL", type: "url" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "manager_id", label: "Manager", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "status", label: "Status", placeholder: "available" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ resource_type: "equipment", access_type: "internal", status: "available" }}
      emptyMessage="No research resources were returned by the research service."
      metaFields={["resource_type", "location", "status"]}
    />
  );
}
