"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ResearchConsultancyDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Consultancy"
      description="View consultancy client, value, partner linkage, dates, related work, and audit history."
      resource={researchServiceApi.consultancies}
      backHref="/research/capacity/consultancies"
      slugParam="id"
      lookup="id"
      labelFields={["consultancy_type", "client_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Partner", field: "partner_id", relation: { adapter: "researchPartner" } },
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Value", field: "contract_value" },
      ]}
      sections={[
        { title: "Engagement", fields: ["summary", "description", "client_name", "client_type", "location", "country"] },
        { title: "Commercials", fields: ["contract_value", "currency", "status", "is_public", "is_featured"] },
      ]}
      auditResourceTypes={["consultancy", "consultancies", "capacity_consultancy"]}
      renderAfter={(record) => <ConsultancyRelations consultancy={record} />}
    />
  );
}

function ConsultancyRelations({ consultancy }: { consultancy: ResearchGenericRecord }) {
  const partnerId = String(consultancy.partner_id ?? "");
  const projectId = String(consultancy.project_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="related"
      tabs={[
        {
          value: "related",
          label: "Related Work",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Partner Consultancies"
                queryKey={["research", "capacity", "consultancies", consultancy.id, "partner", partnerId]}
                queryFn={() => partnerId ? researchServiceApi.consultancies.list({ page: 1, per_page: 8, partner_id: partnerId }) : Promise.resolve({ data: [] })}
                emptyLabel="No partner-linked consultancies were returned."
                metaFields={["client_name", "status", "start_date"]}
              />
              <RelatedRecordsCard
                title="Project Consultancies"
                queryKey={["research", "capacity", "consultancies", consultancy.id, "project", projectId]}
                queryFn={() => projectId ? researchServiceApi.consultancies.list({ page: 1, per_page: 8, project_id: projectId }) : Promise.resolve({ data: [] })}
                emptyLabel="No project-linked consultancies were returned."
                metaFields={["client_name", "status", "start_date"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
