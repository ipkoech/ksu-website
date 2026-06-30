"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchProgramDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Program"
      description="View program metadata, lead, center binding, projects, impact metrics, and audit history."
      resource={researchServiceApi.programs}
      backHref="/research/programs"
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_featured", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Lead", field: "lead_id", relation: { adapter: "person" } },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Budget", field: "budget" },
      ]}
      sections={[
        { title: "Program", fields: ["summary", "description", "objectives", "expected_outcomes", "methodology"] },
        { title: "Finance", fields: ["budget", "currency"] },
      ]}
      auditResourceTypes={["research_program", "program", "programs"]}
      renderAfter={(record) => <ProgramRelations program={record} />}
    />
  );
}

function ProgramRelations({ program }: { program: ResearchGenericRecord }) {
  const programId = String(program.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="projects"
      tabs={[
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Program Projects"
              queryKey={["research", "programs", programId, "projects"]}
              queryFn={() => researchServiceApi.projects.list({ page: 1, per_page: 12, program_id: programId })}
              emptyLabel="No projects were returned for this program."
              metaFields={["project_type", "status", "start_date"]}
            />
          ),
        },
        {
          value: "outputs",
          label: "Outputs",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Program Impact Metrics"
                queryKey={["research", "programs", programId, "impact"]}
                queryFn={() => researchServiceApi.impactMetrics.list({ page: 1, per_page: 8, program_id: programId })}
                emptyLabel="No impact metrics were returned for this program."
                metaFields={["metric_type", "value", "reporting_year"]}
              />
              <RelatedRecordsCard
                title="Program Export Outputs"
                queryKey={["research", "programs", programId, "outputs-empty"]}
                queryFn={() => Promise.resolve({ data: [] })}
                emptyLabel="Outputs are linked through projects or centers; the backend does not expose program_id on outputs."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
