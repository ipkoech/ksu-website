"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ScholarshipsPage() {
  return (
    <ResearchResourcePage
      title="Scholarships"
      description="Manage research scholarship opportunities."
      queryKey={["research", "scholarships"]}
      resource={researchServiceApi.scholarships}
      manageScopes={["scholarship.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "scholarship_type", label: "Scholarship Type", placeholder: "research" },
        { name: "funder_name", label: "Funder" },
        { name: "funder_logo_url", label: "Funder Logo URL", type: "url" },
        { name: "endowment_fund_id", label: "Endowment Fund ID" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "eligibility", label: "Eligibility", type: "textarea" },
        { name: "requirements", label: "Requirements", type: "textarea" },
        { name: "benefits", label: "Benefits", type: "textarea" },
        { name: "obligations", label: "Obligations", type: "textarea" },
        { name: "selection_criteria", label: "Selection Criteria", type: "textarea" },
        { name: "value", label: "Value", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "covers_tuition", label: "Covers Tuition", type: "boolean" },
        { name: "covers_stipend", label: "Covers Stipend", type: "boolean" },
        { name: "covers_travel", label: "Covers Travel", type: "boolean" },
        { name: "covers_research", label: "Covers Research", type: "boolean" },
        { name: "duration_months", label: "Duration Months", type: "number" },
        { name: "renewable", label: "Renewable", type: "boolean" },
        { name: "application_open", label: "Application Open", type: "date" },
        { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
        { name: "award_date", label: "Award Date", type: "date" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "number_available", label: "Number Available", type: "number" },
        { name: "external_url", label: "External URL", type: "url" },
        { name: "application_url", label: "Application URL", type: "url" },
        { name: "contact_name", label: "Contact Name" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "open" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ scholarship_type: "research", currency: "KES", status: "open" }}
      emptyMessage="No scholarships were returned by the research service."
    />
  );
}
