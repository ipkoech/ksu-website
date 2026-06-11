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
        { name: "room", label: "Room" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "specifications", label: "Specifications", type: "textarea" },
        { name: "capabilities", label: "Capabilities", type: "textarea" },
        { name: "usage_guidelines", label: "Usage Guidelines", type: "textarea" },
        { name: "training_required", label: "Training Required", type: "textarea" },
        { name: "access_type", label: "Access Type", placeholder: "internal" },
        { name: "access_url", label: "Access URL", type: "url" },
        { name: "booking_url", label: "Booking URL", type: "url" },
        { name: "availability", label: "Availability", type: "textarea" },
        { name: "operating_hours", label: "Operating Hours" },
        { name: "is_free", label: "Free", type: "boolean" },
        { name: "fee_structure", label: "Fee Structure", type: "textarea" },
        { name: "contact_name", label: "Contact Name" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "manager_id", label: "Manager", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "available" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ resource_type: "equipment", access_type: "internal", status: "available", is_free: true }}
      emptyMessage="No research resources were returned by the research service."
      metaFields={["resource_type", "location", "status"]}
    />
  );
}
