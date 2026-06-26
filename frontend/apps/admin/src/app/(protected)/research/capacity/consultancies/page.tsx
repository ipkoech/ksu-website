"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchConsultanciesPage() {
  return (
    <ResearchResourcePage
      title="Research Consultancies"
      description="Manage advisory, policy, evaluation, training, and technical consultancy engagements."
      queryKey={["research", "consultancies", "capacity"]}
      resource={researchServiceApi.consultancies}
      manageScopes={["research.manage_consultancies", "partnerships.manage", "research:write"]}
      listParams={{ is_active: true }}
      metaFields={["code", "consultancy_type", "client_name", "status"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "consultancy_type", label: "Consultancy Type", type: "select", placeholder: "Select type", options: [
          { label: "Research", value: "research" },
          { label: "Technical", value: "technical" },
          { label: "Policy", value: "policy" },
          { label: "Evaluation", value: "evaluation" },
          { label: "Training", value: "training" },
          { label: "Advisory", value: "advisory" },
        ] },
        { name: "client_name", label: "Client Name" },
        { name: "client_type", label: "Client Type", type: "select", placeholder: "Select client type", options: [
          { label: "Government", value: "government" },
          { label: "NGO", value: "ngo" },
          { label: "Corporate", value: "corporate" },
          { label: "International", value: "international" },
          { label: "Academic", value: "academic" },
        ] },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "contract_value", label: "Contract Value", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "location", label: "Location" },
        { name: "country", label: "Country" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Proposal", value: "proposal" },
          { label: "Awarded", value: "awarded" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      defaults={{
        consultancy_type: "research",
        currency: "KES",
        status: "ongoing",
        is_active: true,
        is_public: true,
      }}
      emptyMessage="No consultancy engagements were returned by the research service."
      importResource="research-consultancies"
    />
  );
}
