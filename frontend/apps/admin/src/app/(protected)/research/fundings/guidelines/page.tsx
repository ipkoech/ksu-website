"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function GrantGuidelinesPage() {
  return (
    <ResearchResourcePage
      title="Grant Guidelines"
      description="Manage grant procedures, requirements, and supporting documents."
      queryKey={["research", "grant-guidelines"]}
      resource={researchServiceApi.grantGuidelines}
      manageScopes={["funding.manage", "research.manage_grant_guidelines", "research:write"]}
      fields={[
        { name: "grant_id", label: "Grant", type: "entity", required: true, relation: { adapter: "researchGrant", allowClear: false } },
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "guideline_type", label: "Guideline Type", placeholder: "procedure" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "document_url", label: "Document URL", type: "url" },
        { name: "document_name", label: "Document Name" },
        { name: "is_required", label: "Required", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ guideline_type: "procedure" }}
      emptyMessage="No grant guidelines were returned by the research service."
      metaFields={["guideline_type", "document_name"]}
    />
  );
}
