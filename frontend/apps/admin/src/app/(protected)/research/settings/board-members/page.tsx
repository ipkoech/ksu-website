"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchBoardMembersPage() {
  return (
    <ResearchResourcePage
      title="Board Members"
      description="Manage membership records for research boards and committees."
      queryKey={["research", "board-members"]}
      resource={researchServiceApi.boardMembers}
      manageScopes={["research.manage_office", "research.manage_guidelines", "research:write"]}
      fields={[
        { name: "board_id", label: "Research Board", type: "entity", required: true, relation: { adapter: "researchBoard", filters: { is_active: true }, allowClear: false } },
        { name: "person_id", label: "Person", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "name", label: "Name", required: true },
        { name: "title", label: "Title" },
        { name: "affiliation", label: "Affiliation" },
        { name: "email", label: "Email", type: "email" },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "role", label: "Role", placeholder: "member" },
        { name: "representation", label: "Representation" },
        { name: "term_start", label: "Term Start", type: "date" },
        { name: "term_end", label: "Term End", type: "date" },
        { name: "photo_url", label: "Photo URL", type: "url" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ role: "member" }}
      emptyMessage="No research board members were returned by the research service."
      metaFields={["role", "affiliation", "is_active"]}
    />
  );
}
