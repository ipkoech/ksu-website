"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchGuidelinesPage() {
  return (
    <ResearchResourcePage
      title="Research Guidelines"
      description="Manage research policies, procedures, forms, and operational guidelines."
      queryKey={["research", "guidelines"]}
      resource={researchServiceApi.guidelines}
      manageScopes={["research.manage_guidelines", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "guideline_type", label: "Guideline Type", placeholder: "guideline" },
        { name: "category", label: "Category", placeholder: "general" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "document_url", label: "Document URL", type: "url" },
        { name: "version", label: "Version" },
        { name: "review_date", label: "Review Date", type: "date" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_mandatory", label: "Mandatory", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ guideline_type: "guideline", category: "general", status: "active" }}
      emptyMessage="No research guidelines were returned by the research service."
      metaFields={["guideline_type", "category", "status"]}
    />
  );
}
