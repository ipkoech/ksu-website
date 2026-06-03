"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function TrainingProgramsPage() {
  return (
    <ResearchResourcePage
      title="Training Programs"
      description="Manage research capacity training programs."
      queryKey={["research", "training"]}
      resource={researchServiceApi.training}
      manageScopes={["training_program.manage", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "program_type", label: "Program Type", placeholder: "workshop" },
        { name: "category", label: "Category", placeholder: "research_methods" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "delivery_mode", label: "Delivery Mode", placeholder: "in_person" },
        { name: "venue", label: "Venue" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ program_type: "workshop", delivery_mode: "in_person", status: "draft" }}
      emptyMessage="No training programs were returned by the research service."
    />
  );
}
