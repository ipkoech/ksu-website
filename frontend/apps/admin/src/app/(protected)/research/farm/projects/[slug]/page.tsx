"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchAdminDetailPage,
  ResearchDetailRelationshipTabs,
} from "../../../_components/research-admin-detail-page";
import {
  RelatedRecordsCard,
  RelatedRecordsGrid,
} from "../../../_components/research-detail-relationships";

export default function FarmProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Research Project"
      description="View farm-linked project metadata, funding, partners, focus areas, activities, outputs, and impact records."
      resource={researchServiceApi.projects}
      backHref="/research/farm/projects"
      publicHrefBase="/projects"
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Farm Site / Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "PI / Lead", field: "pi_id", relation: { adapter: "person" } },
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Public", field: "is_public", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes", "deliverables"] },
        { title: "Impact and Funding", fields: ["impact", "budget", "currency"] },
      ]}
      auditResourceTypes={["research_project", "projects", "project"]}
      renderAfter={(record) => <FarmProjectRelations project={record} />}
    />
  );
}

function FarmProjectRelations({ project }: { project: ResearchGenericRecord }) {
  const projectId = String(project.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="partners"
      tabs={[
        {
          value: "partners",
          label: "Partners",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Project Partners"
                queryKey={["research", "farm", "projects", projectId, "partners"]}
                queryFn={() => researchServiceApi.projectRelations.partners.list(projectId)}
                emptyLabel="No partners are linked to this farm project."
              />
              <RelatedRecordsCard
                title="Focus Areas"
                queryKey={["research", "farm", "projects", projectId, "focus-areas"]}
                queryFn={() => researchServiceApi.projectRelations.focusAreas.list(projectId)}
                emptyLabel="No focus areas are linked to this farm project."
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
              queryKey={["research", "farm", "projects", projectId, "activities"]}
              queryFn={() => researchServiceApi.projectRelations.activities.list(projectId)}
              emptyLabel="No activities are linked to this farm project."
            />
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Impact Stories"
                queryKey={["research", "farm", "projects", projectId, "impact-stories"]}
                queryFn={() => researchServiceApi.projectRelations.impactStories.list(projectId)}
                emptyLabel="No impact stories are linked to this farm project."
              />
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "farm", "projects", projectId, "impact-metrics"]}
                queryFn={() => researchServiceApi.projectRelations.impactMetrics.list(projectId)}
                emptyLabel="No impact metrics are linked to this farm project."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
