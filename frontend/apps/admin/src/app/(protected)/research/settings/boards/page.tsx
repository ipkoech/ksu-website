"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchBoardsPage() {
  return (
    <ResearchResourcePage
      title="Research Boards"
      description="Manage research boards, committees, mandates, and contact details."
      queryKey={["research", "boards"]}
      resource={researchServiceApi.boards}
      manageScopes={["research.manage_office", "research.manage_guidelines", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "acronym", label: "Acronym" },
        { name: "board_type", label: "Board Type", placeholder: "committee" },
        { name: "about", label: "About", type: "textarea" },
        { name: "mandate", label: "Mandate", type: "textarea" },
        { name: "responsibilities", label: "Responsibilities", type: "textarea" },
        { name: "composition", label: "Composition", type: "textarea" },
        { name: "meeting_schedule", label: "Meeting Schedule", type: "textarea" },
        { name: "chair_id", label: "Chair", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "secretary_name", label: "Secretary Name" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "document_url", label: "Document URL", type: "url" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ board_type: "committee" }}
      emptyMessage="No research boards were returned by the research service."
      metaFields={["code", "board_type", "acronym"]}
    />
  );
}
