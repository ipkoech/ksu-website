"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchServicesPage() {
  return (
    <ResearchResourcePage
      title="Research Services"
      description="Manage research office services, access steps, and support contacts."
      queryKey={["research", "services"]}
      resource={researchServiceApi.services}
      manageScopes={["research.manage_guidelines", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "service_type", label: "Service Type", placeholder: "support" },
        { name: "category", label: "Category" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "department_id", label: "Department", type: "entity", relation: { adapter: "department" } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "how_to_access", label: "How To Access", type: "textarea" },
        { name: "request_url", label: "Request URL", type: "url" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "is_free", label: "Free", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ service_type: "support" }}
      emptyMessage="No research services were returned by the research service."
      metaFields={["service_type", "category", "is_free"]}
    />
  );
}
