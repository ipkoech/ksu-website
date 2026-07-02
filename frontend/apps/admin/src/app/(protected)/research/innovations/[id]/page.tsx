"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function InnovationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Innovation"
      description="View innovation disclosure, IP, commercialization, source project, startup pathway, and transfer history."
      resource={researchServiceApi.innovations}
      backHref="/research/innovations"
      slugParam="id"
      lookup="id"
      labelFields={["innovation_type", "development_stage", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Lead Inventor", field: "lead_inventor_id", relation: { adapter: "person" } },
        { label: "TRL", field: "trl_level" },
        { label: "Invention Date", field: "invention_date", format: "date" },
      ]}
      sections={[
        { title: "Innovation", fields: ["summary", "description", "problem_addressed", "solution", "benefits", "applications", "target_users"] },
        { title: "IP And Commercialization", fields: ["ip_status", "patent_number", "patent_filing_date", "patent_grant_date", "license_type", "commercialization_status"] },
        { title: "Value", fields: ["commercial_value", "revenue_generated", "currency", "awards"] },
      ]}
      auditResourceTypes={["innovation", "innovations", "research_innovation"]}
      renderAfter={(record) => <InnovationRelations innovation={record} />}
    />
  );
}

function InnovationRelations({ innovation }: { innovation: ResearchGenericRecord }) {
  const innovationId = String(innovation.id);
  const projectId = String(innovation.project_id ?? "");
  const centerId = String(innovation.center_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="pathway"
      tabs={[
        {
          value: "pathway",
          label: "Pathway",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Startups"
                queryKey={["research", "innovations", innovationId, "startups"]}
                queryFn={() => researchServiceApi.innovationRelations.startups.list(innovationId)}
                emptyLabel="No startup ventures are linked to this innovation."
                metaFields={["venture_stage", "registration_status", "status"]}
              />
              <RelatedRecordsCard
                title="Incubation"
                queryKey={["research", "innovations", innovationId, "incubation-records"]}
                queryFn={() => researchServiceApi.innovationRelations.incubationRecords.list(innovationId)}
                emptyLabel="No incubation records are linked to this innovation."
                metaFields={["program_name", "cohort", "stage"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "commercialization",
          label: "Commercialization",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Hackathons & Competitions"
                queryKey={["research", "innovations", innovationId, "competition-entries"]}
                queryFn={() => researchServiceApi.innovationRelations.competitionEntries.list(innovationId)}
                emptyLabel="No hackathon or competition entries are linked to this innovation."
                metaFields={["entry_type", "competition_name", "entry_status"]}
              />
              <RelatedRecordsCard
                title="Technology Transfer"
                queryKey={["research", "innovations", innovationId, "technology-transfer-cases"]}
                queryFn={() => researchServiceApi.innovationRelations.technologyTransferCases.list(innovationId)}
                emptyLabel="No technology transfer cases are linked to this innovation."
                metaFields={["case_type", "transfer_status", "agreement_date"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "stories",
          label: "Stories",
          content: (
            <RelatedRecordsCard
              title="Innovation Stories"
              queryKey={["research", "innovations", innovationId, "stories"]}
              queryFn={() => researchServiceApi.stories.list({ page: 1, per_page: 8, innovation_id: innovationId })}
              emptyLabel="No success stories were returned for this innovation."
              metaFields={["story_type", "status", "story_date"]}
            />
          ),
        },
        {
          value: "project",
          label: "Project",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Project Outputs"
                queryKey={["research", "innovations", innovationId, "project-outputs", projectId]}
                queryFn={() => projectId ? researchServiceApi.outputs.list({ page: 1, per_page: 8, project_id: projectId }) : Promise.resolve({ data: [] })}
                emptyLabel="No outputs were returned for this innovation's source project."
                metaFields={["output_type", "access_type", "status"]}
              />
              <RelatedRecordsCard
                title="Center Innovations"
                queryKey={["research", "innovations", innovationId, "center-innovations", centerId]}
                queryFn={() => centerId ? researchServiceApi.innovations.list({ page: 1, per_page: 8, center_id: centerId }) : Promise.resolve({ data: [] })}
                emptyLabel="No other innovations were returned for this center."
                metaFields={["innovation_type", "development_stage", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
