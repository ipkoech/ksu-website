"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchInnovationsPage() {
  return (
    <ResearchResourcePage
      title="Innovation"
      description="Manage inventions, disclosures, prototypes, startups, and technology-transfer records."
      queryKey={["research", "innovations"]}
      resource={researchServiceApi.innovations}
      manageScopes={["innovation.review_disclosure", "innovation.manage_ecosystem", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_type", label: "Innovation Type", placeholder: "invention" },
        { name: "category", label: "Category" },
        { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "lead_inventor_id", label: "Lead Inventor", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "problem_addressed", label: "Problem Addressed", type: "textarea" },
        { name: "solution", label: "Solution", type: "textarea" },
        { name: "benefits", label: "Benefits", type: "textarea" },
        { name: "applications", label: "Applications", type: "textarea" },
        { name: "target_users", label: "Target Users", type: "textarea" },
        { name: "ip_status", label: "IP Status" },
        { name: "patent_number", label: "Patent Number" },
        { name: "patent_filing_date", label: "Patent Filing Date", type: "date" },
        { name: "patent_grant_date", label: "Patent Grant Date", type: "date" },
        { name: "license_type", label: "License Type" },
        { name: "commercialization_status", label: "Commercialization Status" },
        { name: "commercial_value", label: "Commercial Value", type: "number" },
        { name: "revenue_generated", label: "Revenue Generated", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "development_stage", label: "Development Stage", placeholder: "research" },
        { name: "trl_level", label: "TRL Level", type: "number" },
        { name: "invention_date", label: "Invention Date", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "video_url", label: "Video URL", type: "url" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      defaults={{ innovation_type: "invention", currency: "KES", development_stage: "research", status: "draft", is_public: true }}
      emptyMessage="No innovations were returned by the research service."
      importResource="research-innovations"
    />
  );
}
