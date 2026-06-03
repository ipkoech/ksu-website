"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchOfficeStaffPage() {
  return (
    <ResearchResourcePage
      title="Research Office Staff and Leadership"
      description="Manage staff and leadership assignments for the research office."
      queryKey={["research", "office-staff"]}
      resource={researchServiceApi.officeStaff}
      manageScopes={["research.manage_office", "research:write"]}
      fields={[
        { name: "office_id", label: "Research Office", type: "entity", required: true, relation: { adapter: "researchOffice", filters: { is_active: true }, allowClear: false } },
        { name: "staff_assignment_id", label: "Staff Assignment", type: "entity", required: true, relation: { adapter: "staffAssignment", filters: { status: "active" }, allowClear: false } },
        { name: "staff_type", label: "Staff Type", type: "select", placeholder: "Select type", options: [
          { label: "Leadership", value: "leadership" },
          { label: "Staff", value: "staff" },
          { label: "Coordinator", value: "coordinator" },
          { label: "Administrator", value: "administrator" },
        ] },
        { name: "role", label: "Role", type: "select", required: true, placeholder: "Select role", options: [
          { label: "Director", value: "director" },
          { label: "Deputy Director", value: "deputy_director" },
          { label: "Coordinator", value: "coordinator" },
          { label: "Officer", value: "officer" },
          { label: "Administrator", value: "administrator" },
        ] },
        { name: "title_override", label: "Title Override" },
        { name: "responsibilities", label: "Responsibilities", type: "textarea" },
        { name: "leadership_rank", label: "Leadership Rank", type: "number" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ staff_type: "staff" }}
      emptyMessage="No research office staff records were returned by the research service."
    />
  );
}
