"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard } from "../../../_components/research-detail-relationships";

export default function FunderDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Funder"
      description="View funder contact, focus, activity status, and grant records that match the funder name."
      resource={researchServiceApi.funders}
      backHref="/research/fundings/funders"
      slugParam="id"
      lookup="id"
      labelFields={["funder_type", "is_active", "is_featured"]}
      factFields={[
        { label: "Acronym", field: "acronym" },
        { label: "Type", field: "funder_type", format: "label" },
        { label: "Website", field: "website" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Country", field: "country" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "focus_areas", "address"] },
      ]}
      auditResourceTypes={["funder", "funding", "funding_source"]}
      renderAfter={(record) => <FunderRelations funder={record} />}
    />
  );
}

function FunderRelations({ funder }: { funder: ResearchGenericRecord }) {
  const search = String(funder.name ?? funder.acronym ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="grants"
      tabs={[
        {
          value: "grants",
          label: "Grants",
          content: (
            <RelatedRecordsCard
              title="Matching Grants"
              queryKey={["research", "fundings", "funders", funder.id, "grants", search]}
              queryFn={() => researchServiceApi.grants.list({ page: 1, per_page: 12, search })}
              emptyLabel="No grants matched this funder name. The backend does not expose a direct funder_id on grants."
              metaFields={["grant_type", "category", "status", "deadline"]}
            />
          ),
        },
      ]}
    />
  );
}
