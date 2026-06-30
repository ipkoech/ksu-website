"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { CapacityWorkspaceHeader, statusFilter } from "../_components/capacity-workspace";

export default function MentorshipProgramsPage() {
  return (
    <ResearchResourcePage
      title="Mentorship Programs"
      description="Manage research mentorship programs."
      queryKey={["research", "mentorship"]}
      resource={researchServiceApi.mentorship}
      manageScopes={["training_program.manage", "research:write"]}
      summarySlot={<CapacityWorkspaceHeader />}
      listFilters={[{ name: "search", label: "Search", type: "text", placeholder: "Search mentorship programs" }, statusFilter]}
      editorMode="sheet"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "program_type", label: "Program Type", placeholder: "research" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "coordinator_id", label: "Coordinator", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "benefits", label: "Benefits", type: "textarea" },
        { name: "mentor_requirements", label: "Mentor Requirements", type: "textarea" },
        { name: "mentee_requirements", label: "Mentee Requirements", type: "textarea" },
        { name: "expectations", label: "Expectations", type: "textarea" },
        { name: "guidelines", label: "Guidelines", type: "textarea" },
        { name: "duration_months", label: "Duration Months", type: "number" },
        { name: "commitment_hours_weekly", label: "Weekly Commitment Hours", type: "number" },
        { name: "application_open", label: "Application Open", type: "date" },
        { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
        { name: "cohort_start_date", label: "Cohort Start Date", type: "date" },
        { name: "cohort_end_date", label: "Cohort End Date", type: "date" },
        { name: "max_mentees", label: "Max Mentees", type: "number" },
        { name: "max_mentors", label: "Max Mentors", type: "number" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "brochure_url", label: "Brochure URL", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ program_type: "research", status: "active" }}
      emptyMessage="No mentorship programs were returned by the research service."
      importResource="research-mentorship"
    />
  );
}
