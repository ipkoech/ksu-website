"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ImpactMetricDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Impact Metric"
      description="View metric value, source bindings, methodology, related stories, and audit history."
      resource={researchServiceApi.impactMetrics}
      backHref="/research/impact"
      slugParam="id"
      lookup="id"
      labelFields={["metric_type", "category", "is_featured"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Program", field: "program_id", relation: { adapter: "researchProgram" } },
        { label: "Value", field: "value" },
        { label: "Reporting Year", field: "reporting_year" },
      ]}
      sections={[
        { title: "Metric", fields: ["description", "methodology", "data_source", "unit", "baseline_value", "target_value"] },
        { title: "Period", fields: ["period_start", "period_end", "reporting_year", "icon", "color"] },
      ]}
      auditResourceTypes={["impact_metric", "impact-metrics", "research_impact_metric"]}
      renderAfter={(record) => <ImpactMetricRelations metric={record} />}
    />
  );
}

function ImpactMetricRelations({ metric }: { metric: ResearchGenericRecord }) {
  const projectId = String(metric.project_id ?? "");
  const centerId = String(metric.center_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="stories"
      tabs={[
        {
          value: "stories",
          label: "Stories",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Project Stories"
                queryKey={["research", "impact", metric.id, "project-stories", projectId]}
                queryFn={() => projectId ? researchServiceApi.stories.list({ page: 1, per_page: 8, project_id: projectId }) : Promise.resolve({ data: [] })}
                emptyLabel="No stories were returned for this metric's project."
                metaFields={["story_type", "status", "story_date"]}
              />
              <RelatedRecordsCard
                title="Center Stories"
                queryKey={["research", "impact", metric.id, "center-stories", centerId]}
                queryFn={() => centerId ? researchServiceApi.stories.list({ page: 1, per_page: 8, center_id: centerId }) : Promise.resolve({ data: [] })}
                emptyLabel="No stories were returned for this metric's center."
                metaFields={["story_type", "status", "story_date"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
