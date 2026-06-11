"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function FarmProjectsPage() {
  return (
    <ResearchResourcePage
      title="Farm Research Projects"
      description="Manage farm-linked action research, demonstrations, and applied field projects."
      queryKey={["research", "farm", "projects"]}
      resource={researchServiceApi.projects}
      manageScopes={["research.manage_projects", "research:write"]}
      listParams={{ is_active: true, is_public: true, project_type: "action" }}
      metaFields={["code", "project_type", "status", "progress_percentage"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "project_type", label: "Project Type", type: "select", placeholder: "Select type", options: [
          { label: "Action", value: "action" },
          { label: "Applied", value: "applied" },
          { label: "Collaborative", value: "collaborative" },
          { label: "Commissioned", value: "commissioned" },
        ] },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "abstract", label: "Abstract", type: "textarea" },
        { name: "background", label: "Background", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "deliverables", label: "Deliverables", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "budget", label: "Budget", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "grant_id", label: "Grant ID" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "progress_percentage", label: "Progress %", type: "number" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Proposal", value: "proposal" },
          { label: "Approved", value: "approved" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Completed", value: "completed" },
          { label: "Suspended", value: "suspended" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      defaults={{
        project_type: "action",
        status: "ongoing",
        currency: "KES",
        progress_percentage: 0,
        is_active: true,
        is_public: true,
      }}
      emptyMessage="No farm research projects were returned by the research service."
    />
  );
}
