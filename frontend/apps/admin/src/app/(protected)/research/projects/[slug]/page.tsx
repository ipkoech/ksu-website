"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Project"
      description="View public profile fields, project dates, progress, and publication-ready details."
      resource={researchServiceApi.projects}
      backHref="/research/projects"
      publicHrefBase="/projects"
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes", "deliverables"] },
        { title: "Impact and Funding", fields: ["impact", "budget", "currency"] },
      ]}
      auditResourceTypes={["research_project", "projects", "project"]}
      renderAfter={(record) => <ProjectRelations project={record} />}
    />
  );
}

function ProjectRelations({ project }: { project: ResearchGenericRecord }) {
  const projectId = String(project.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="publications"
      tabs={[
        {
          value: "publications",
          label: "Publications",
          content: (
            <RelatedRecordsCard
              title="Related Publications"
              queryKey={["research", "projects", projectId, "publications"]}
              queryFn={() => researchServiceApi.publications.list({ page: 1, per_page: 6, project_id: projectId })}
              emptyLabel="No publications are linked to this project."
            />
          ),
        },
        {
          value: "grants",
          label: "Grants",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Funders"
                queryKey={["research", "projects", projectId, "funders"]}
                queryFn={() => researchServiceApi.projectRelations.funders.list(projectId)}
                emptyLabel="No funders are linked to this project."
              />
              <RelatedRecordsCard
                title="Grant Reports"
                queryKey={["research", "projects", projectId, "grant-reports"]}
                queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 6, project_id: projectId })}
                emptyLabel="No grant reports are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "partners",
          label: "Partners",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Partners"
                queryKey={["research", "projects", projectId, "partners"]}
                queryFn={() => researchServiceApi.projectRelations.partners.list(projectId)}
                emptyLabel="No partners are linked to this project."
              />
              <RelatedRecordsCard
                title="Focus Areas"
                queryKey={["research", "projects", projectId, "focus-areas"]}
                queryFn={() => researchServiceApi.projectRelations.focusAreas.list(projectId)}
                emptyLabel="No focus areas are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "activities",
          label: "Activities",
          content: (
            <RelatedRecordsCard
              title="Project Activities"
              queryKey={["research", "projects", projectId, "activities"]}
              queryFn={() => researchServiceApi.projectRelations.activities.list(projectId)}
              emptyLabel="No research-scoped activities are linked to this project."
            />
          ),
        },
        {
          value: "outputs",
          label: "Outputs",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Research Outputs"
                queryKey={["research", "projects", projectId, "outputs"]}
                queryFn={() => researchServiceApi.outputs.list({ page: 1, per_page: 6, project_id: projectId })}
                emptyLabel="No outputs are linked to this project."
              />
              <RelatedRecordsCard
                title="Innovations"
                queryKey={["research", "projects", projectId, "innovations"]}
                queryFn={() => researchServiceApi.innovations.list({ page: 1, per_page: 6, project_id: projectId })}
                emptyLabel="No innovations are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "projects", projectId, "impact-metrics"]}
                queryFn={() => researchServiceApi.projectRelations.impactMetrics.list(projectId)}
                emptyLabel="No impact metrics are linked to this project."
              />
              <RelatedRecordsCard
                title="Impact Stories"
                queryKey={["research", "projects", projectId, "impact-stories"]}
                queryFn={() => researchServiceApi.projectRelations.impactStories.list(projectId)}
                emptyLabel="No impact stories are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
