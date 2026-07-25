"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function IncubationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Incubation Record"
      description="View incubation support, startup binding, mentors, milestones, and outcomes."
      resource={researchServiceApi.incubationRecords}
      backHref="/research/innovations?tab=incubation"
      slugParam="id"
      lookup="id"
      labelFields={["incubation_type", "stage", "status"]}
      factFields={[
        { label: "Innovation", field: "innovation_id", relation: { adapter: "researchInnovation" } },
        { label: "Startup", field: "startup_id", relation: { adapter: "researchStartup" } },
        { label: "Partner", field: "partner_id", relation: { adapter: "researchPartner" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Start Date", field: "start_date", format: "date" },
        { label: "End Date", field: "end_date", format: "date" },
      ]}
      sections={[
        { title: "Program", fields: ["program_name", "cohort", "incubation_type", "support_received"] },
        { title: "Outcomes", fields: ["milestones", "outcomes", "next_steps", "mentor_ids"] },
      ]}
      auditResourceTypes={["incubation_record", "incubation-records"]}
      renderAfter={(record) => <IncubationRelations record={record} />}
    />
  );
}

function IncubationRelations({ record }: { record: ResearchGenericRecord }) {
  const innovationId = String(record.innovation_id ?? "");
  const startupId = String(record.startup_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="related"
      tabs={[
        {
          value: "related",
          label: "Related",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Innovation Startups"
                queryKey={["research", "incubation", record.id, "startups", innovationId]}
                queryFn={() => innovationId ? researchServiceApi.innovationRelations.startups.list(innovationId) : Promise.resolve({ data: [] })}
                emptyLabel="No startup ventures were returned for this innovation."
                metaFields={["venture_stage", "registration_status", "status"]}
              />
              <RelatedRecordsCard
                title="Startup Competitions"
                queryKey={["research", "incubation", record.id, "competitions", startupId]}
                queryFn={() => startupId ? researchServiceApi.competitionEntries.list({ page: 1, per_page: 8, startup_id: startupId }) : Promise.resolve({ data: [] })}
                emptyLabel="No competition entries were returned for this startup."
                metaFields={["entry_type", "competition_name", "entry_status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
