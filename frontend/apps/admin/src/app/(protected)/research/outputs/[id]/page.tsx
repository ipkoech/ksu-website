"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchOutputDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Output"
      description="View output metadata, access links, project/center binding, related publications, and audit history."
      resource={researchServiceApi.outputs}
      backHref="/research/outputs"
      slugParam="id"
      lookup="id"
      labelFields={["output_type", "access_type", "status"]}
      factFields={[
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "DOI", field: "doi" },
        { label: "Version", field: "version" },
        { label: "Released", field: "release_date", format: "date" },
        { label: "Last Updated", field: "last_updated", format: "date" },
      ]}
      sections={[
        { title: "Output", fields: ["summary", "description", "methodology", "usage_notes", "citation"] },
        { title: "Access", fields: ["access_url", "download_url", "repository_url", "license", "license_url", "format", "size_bytes"] },
        { title: "Technical", fields: ["technical_requirements", "keywords"] },
      ]}
      auditResourceTypes={["research_output", "output", "outputs"]}
      renderAfter={(record) => <OutputRelations output={record} />}
    />
  );
}

function OutputRelations({ output }: { output: ResearchGenericRecord }) {
  const projectId = String(output.project_id ?? "");
  const centerId = String(output.center_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="project"
      tabs={[
        {
          value: "project",
          label: "Project",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Project Publications"
                queryKey={["research", "outputs", output.id, "project-publications", projectId]}
                queryFn={() => projectId ? researchServiceApi.publications.list({ page: 1, per_page: 8, project_id: projectId }) : Promise.resolve({ data: [] })}
                emptyLabel="No publications were returned for this output's project."
                metaFields={["publication_type", "year", "status"]}
              />
              <RelatedRecordsCard
                title="Project Impact Metrics"
                queryKey={["research", "outputs", output.id, "project-impact", projectId]}
                queryFn={() => projectId ? researchServiceApi.impactMetrics.list({ page: 1, per_page: 8, project_id: projectId }) : Promise.resolve({ data: [] })}
                emptyLabel="No impact metrics were returned for this output's project."
                metaFields={["metric_type", "value", "reporting_year"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "center",
          label: "Center",
          content: (
            <RelatedRecordsCard
              title="Center Outputs"
              queryKey={["research", "outputs", output.id, "center-outputs", centerId]}
              queryFn={() => centerId ? researchServiceApi.outputs.list({ page: 1, per_page: 8, center_id: centerId }) : Promise.resolve({ data: [] })}
              emptyLabel="No other outputs were returned for this output's center."
              metaFields={["output_type", "access_type", "status"]}
            />
          ),
        },
      ]}
    />
  );
}
