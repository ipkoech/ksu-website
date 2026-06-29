"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { CapacityWorkspaceHeader, matchColumns, statusFilter } from "../_components/capacity-workspace";

export default function MentorshipMatchesPage() {
  return (
    <ResearchResourcePage
      title="Mentorship Matches"
      description="Manage mentor and mentee pairings, goals, and match status."
      queryKey={["research", "mentorship-matches"]}
      resource={researchServiceApi.mentorshipMatches}
      manageScopes={["training_program.manage", "mentorship.manage_matches", "research:write"]}
      summarySlot={<CapacityWorkspaceHeader />}
      listFilters={[{ name: "program_id", label: "Mentorship Program", type: "entity", relation: { adapter: "researchMentorship", filters: { is_active: true } } }, statusFilter]}
      recordColumns={matchColumns}
      fields={[
        { name: "program_id", label: "Mentorship Program", type: "entity", required: true, relation: { adapter: "researchMentorship", filters: { is_active: true }, allowClear: false } },
        { name: "mentor_id", label: "Mentor", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "mentee_id", label: "Mentee", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "match_date", label: "Match Date", type: "date", required: true },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "goals", label: "Goals", type: "textarea" },
        { name: "meeting_schedule", label: "Meeting Schedule", type: "textarea" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ] },
      ]}
      defaults={{ status: "active" }}
      emptyMessage="No mentorship matches were returned by the research service."
      metaFields={["status", "match_date", "meeting_schedule"]}
    />
  );
}
