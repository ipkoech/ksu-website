"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function GrantGuidelineDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant Guideline"
      description="View grant guideline content, requirement status, document metadata, and grant context."
      resource={researchServiceApi.grantGuidelines}
      backHref="/research/fundings/guidelines"
      slugParam="id"
      lookup="id"
      labelFields={["guideline_type", "is_required", "is_active"]}
      factFields={[
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Type", field: "guideline_type", format: "label" },
        { label: "Required", field: "is_required", format: "boolean" },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Guideline", fields: ["content", "document_name", "document_url"] },
      ]}
      renderAfter={(record) => <GuidelineRelations guideline={record} />}
    />
  );
}

function GuidelineRelations({ guideline }: { guideline: ResearchGenericRecord }) {
  const grantId = String(guideline.grant_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="grant"
      tabs={[
        {
          value: "grant",
          label: "Grant",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Other Guidelines"
                queryKey={["research", "fundings", "guidelines", guideline.id, "guidelines", grantId]}
                queryFn={() => researchServiceApi.grantGuidelines.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No other guidelines were returned for this grant."
                metaFields={["guideline_type", "document_name", "is_required"]}
              />
              <RelatedRecordsCard
                title="Grant Applications"
                queryKey={["research", "fundings", "guidelines", guideline.id, "applications", grantId]}
                queryFn={() => researchServiceApi.grantApplications.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No applications were returned for this grant."
                metaFields={["application_number", "requested_amount", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
