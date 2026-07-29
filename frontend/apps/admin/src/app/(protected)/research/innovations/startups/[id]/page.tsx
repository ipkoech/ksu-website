"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function StartupDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Startup"
      description="View startup venture profile, linked innovation, incubation, competitions, and transfer context."
      resource={researchServiceApi.startups}
      backHref="/research/innovations?tab=startups"
      slugParam="id"
      lookup="id"
      labelFields={["venture_stage", "registration_status", "status"]}
      factFields={[
        { label: "Innovation", field: "innovation_id", relation: { adapter: "researchInnovation" } },
        { label: "Partner", field: "partner_id", relation: { adapter: "researchPartner" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Lead Founder", field: "lead_founder_id", relation: { adapter: "person" } },
        { label: "Sector", field: "sector" },
        { label: "Funding Raised", field: "funding_raised" },
      ]}
      sections={[
        { title: "Venture", fields: ["summary", "problem", "solution", "business_model", "market", "traction"] },
        { title: "Registration", fields: ["registration_number", "incorporation_date", "website", "pitch_deck_url"] },
      ]}
      auditResourceTypes={["startup", "startup_venture", "startups"]}
      renderAfter={(record) => <StartupRelations startup={record} />}
    />
  );
}

function StartupRelations({ startup }: { startup: ResearchGenericRecord }) {
  const startupId = String(startup.id);
  const innovationId = String(startup.innovation_id ?? "");

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
                title="Incubation Records"
                queryKey={["research", "startups", startupId, "incubation"]}
                queryFn={() => researchServiceApi.incubationRecords.list({ page: 1, per_page: 8, startup_id: startupId })}
                emptyLabel="No incubation records were returned for this startup."
                metaFields={["program_name", "cohort", "stage"]}
              />
              <RelatedRecordsCard
                title="Competitions"
                queryKey={["research", "startups", startupId, "competitions"]}
                queryFn={() => researchServiceApi.competitionEntries.list({ page: 1, per_page: 8, startup_id: startupId })}
                emptyLabel="No competition entries were returned for this startup."
                metaFields={["entry_type", "competition_name", "entry_status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "innovation",
          label: "Innovation",
          content: (
            <RelatedRecordsCard
              title="Innovation Transfer Cases"
              queryKey={["research", "startups", startupId, "transfers", innovationId]}
              queryFn={() => innovationId ? researchServiceApi.technologyTransferCases.list({ page: 1, per_page: 8, innovation_id: innovationId }) : Promise.resolve({ data: [] })}
              emptyLabel="No technology transfer cases were returned for this startup's innovation."
              metaFields={["case_type", "transfer_status", "agreement_date"]}
            />
          ),
        },
      ]}
    />
  );
}
