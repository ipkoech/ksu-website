"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function CompetitionEntryDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Hackathon & Competition Entry"
      description="View hackathon, competition, showcase, demo day, or challenge entry details."
      resource={researchServiceApi.competitionEntries}
      backHref="/research/innovations?tab=competitions"
      slugParam="id"
      lookup="id"
      labelFields={["entry_type", "entry_status", "status"]}
      factFields={[
        { label: "Innovation", field: "innovation_id", relation: { adapter: "researchInnovation" } },
        { label: "Startup", field: "startup_id", relation: { adapter: "researchStartup" } },
        { label: "Partner", field: "partner_id", relation: { adapter: "researchPartner" } },
        { label: "Event Date", field: "event_date", format: "date" },
        { label: "Award", field: "award" },
        { label: "Position", field: "position" },
      ]}
      sections={[
        { title: "Event", fields: ["competition_name", "organizer_name", "venue", "country", "application_deadline"] },
        { title: "Pitch", fields: ["pitch_summary", "judges_feedback", "public_url", "pitch_deck_url"] },
        { title: "Prize", fields: ["prize_value", "currency"] },
      ]}
      auditResourceTypes={["competition_entry", "competition-entries", "hackathon"]}
      renderAfter={(record) => <CompetitionRelations entry={record} />}
    />
  );
}

function CompetitionRelations({ entry }: { entry: ResearchGenericRecord }) {
  const innovationId = String(entry.innovation_id ?? "");
  const startupId = String(entry.startup_id ?? "");

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
                title="Innovation Transfers"
                queryKey={["research", "competitions", entry.id, "transfers", innovationId]}
                queryFn={() => innovationId ? researchServiceApi.technologyTransferCases.list({ page: 1, per_page: 8, innovation_id: innovationId }) : Promise.resolve({ data: [] })}
                emptyLabel="No technology transfer cases were returned for this innovation."
                metaFields={["case_type", "transfer_status", "agreement_date"]}
              />
              <RelatedRecordsCard
                title="Startup Incubation"
                queryKey={["research", "competitions", entry.id, "incubation", startupId]}
                queryFn={() => startupId ? researchServiceApi.incubationRecords.list({ page: 1, per_page: 8, startup_id: startupId }) : Promise.resolve({ data: [] })}
                emptyLabel="No incubation records were returned for this startup."
                metaFields={["program_name", "cohort", "stage"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
