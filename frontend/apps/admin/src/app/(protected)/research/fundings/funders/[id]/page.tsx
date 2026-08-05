"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard } from "../../../_components/research-detail-relationships";
import { FundingDetailChrome } from "../../_components/funding-workspace";

export default function FunderDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Funder"
      description="View funder contact, focus, activity status, grants, and funded projects."
      resource={researchServiceApi.funders}
      backHref="/research/fundings/funders"
      {...FundingDetailChrome({ title: "Funder" })}
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
      renderAfter={(record) => <FunderRelations funder={record} />}
    />
  );
}

function FunderRelations({ funder }: { funder: ResearchGenericRecord }) {
  const funderId = String(funder.id);

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
              queryKey={["research", "fundings", "funders", funderId, "grants"]}
              queryFn={() => researchServiceApi.funderRelations.grants.list(funderId)}
              emptyLabel="No grants are attached to this funder."
              metaFields={["grant_type", "category", "status", "deadline"]}
            />
          ),
        },
        {
          value: "projects",
          label: "Funded Projects",
          content: (
            <RelatedRecordsCard
              title="Funded Projects"
              queryKey={["research", "fundings", "funders", funderId, "projects"]}
              queryFn={() => researchServiceApi.funderRelations.projects.list(funderId)}
              emptyLabel="No projects are attached to this funder."
              metaFields={["code", "project_type", "status", "start_date"]}
            />
          ),
        },
      ]}
    />
  );
}
