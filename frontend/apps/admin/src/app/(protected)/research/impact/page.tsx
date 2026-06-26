"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchImpactPage() {
  return (
    <ResearchResourcePage
      title="Impact"
      description="Maintain research impact metrics for outputs, outcomes, and institutional reporting."
      queryKey={["research", "impact-metrics"]}
      resource={researchServiceApi.impactMetrics}
      manageScopes={["research.manage_impact", "sustainability.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "metric_type", label: "Metric Type", placeholder: "output" },
        { name: "category", label: "Category", placeholder: "research" },
        { name: "value", label: "Value", type: "number" },
        { name: "unit", label: "Unit" },
        { name: "reporting_year", label: "Reporting Year", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ metric_type: "output", category: "research", value: 0 }}
      emptyMessage="No impact metrics were returned by the research service."
      importResource="research-impact-metrics"
    />
  );
}
