"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function TechnologyTransferCaseDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Technology Transfer Case"
      description="View technology transfer, IP protection, licensing, adoption, and commercialization details."
      resource={researchServiceApi.technologyTransferCases}
      backHref="/research/innovations?tab=transfers"
      slugParam="id"
      lookup="id"
      labelFields={["case_type", "transfer_status", "status"]}
      factFields={[
        { label: "Innovation", field: "innovation_id", relation: { adapter: "researchInnovation" } },
        { label: "Partner", field: "partner_id", relation: { adapter: "researchPartner" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Lead Officer", field: "lead_officer_id", relation: { adapter: "person" } },
        { label: "Agreement Date", field: "agreement_date", format: "date" },
        { label: "Expiry Date", field: "expiry_date", format: "date" },
      ]}
      sections={[
        { title: "Transfer", fields: ["summary", "public_benefit", "next_steps"] },
        { title: "IP And Agreement", fields: ["ip_reference", "agreement_reference", "license_type", "territory", "exclusivity"] },
        { title: "Commercial Terms", fields: ["commercial_terms", "revenue_terms", "upfront_value", "annual_value", "revenue_generated", "currency"] },
      ]}
      auditResourceTypes={["technology_transfer_case", "technology-transfer-cases", "transfer"]}
      renderAfter={(record) => <TechnologyTransferRelations transfer={record} />}
    />
  );
}

function TechnologyTransferRelations({ transfer }: { transfer: ResearchGenericRecord }) {
  const innovationId = String(transfer.innovation_id ?? "");

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
                queryKey={["research", "transfers", transfer.id, "startups", innovationId]}
                queryFn={() => innovationId ? researchServiceApi.innovationRelations.startups.list(innovationId) : Promise.resolve({ data: [] })}
                emptyLabel="No startups were returned for this innovation."
                metaFields={["code", "venture_stage", "status"]}
              />
              <RelatedRecordsCard
                title="Hackathons & Competitions"
                queryKey={["research", "transfers", transfer.id, "competitions", innovationId]}
                queryFn={() => innovationId ? researchServiceApi.innovationRelations.competitionEntries.list(innovationId) : Promise.resolve({ data: [] })}
                emptyLabel="No competition entries were returned for this innovation."
                metaFields={["competition_name", "entry_status", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
