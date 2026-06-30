"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchGrantDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant"
      description="View grant call details, funder metadata, deadline, and status."
      resource={researchServiceApi.grants}
      backHref="/research/grants"
      publicHrefBase="/funding"
      labelFields={["grant_type", "category", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Funder", field: "funder_name" },
        { label: "Deadline", field: "deadline", format: "datetime" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Application", fields: ["eligibility", "requirements", "application_process"] },
      ]}
      auditResourceTypes={["grant", "grants", "research_grant"]}
      renderAfter={(record) => <GrantRelations grant={record} />}
    />
  );
}

function GrantRelations({ grant }: { grant: ResearchGenericRecord }) {
  const grantId = String(grant.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="applications"
      tabs={[
        {
          value: "applications",
          label: "Applications",
          content: (
            <RelatedRecordsCard
              title="Grant Applications"
              queryKey={["research", "grants", grantId, "applications"]}
              queryFn={() => researchServiceApi.grantApplications.list({ page: 1, per_page: 8, grant_id: grantId })}
              emptyLabel="No applications are linked to this grant."
            />
          ),
        },
        {
          value: "reports",
          label: "Reports",
          content: (
            <RelatedRecordsCard
              title="Grant Reports"
              queryKey={["research", "grants", grantId, "reports"]}
              queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 8, grant_id: grantId })}
              emptyLabel="No reports are linked to this grant."
            />
          ),
        },
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Linked Projects"
              queryKey={["research", "grants", grantId, "projects"]}
              queryFn={() => researchServiceApi.projects.list({ page: 1, per_page: 8, grant_id: grantId })}
              emptyLabel="No projects are linked to this grant."
            />
          ),
        },
        {
          value: "resources",
          label: "Resources",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Guidelines"
                queryKey={["research", "grants", grantId, "guidelines"]}
                queryFn={() => researchServiceApi.grantGuidelines.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No guidelines are linked to this grant."
              />
              <RelatedRecordsCard
                title="Endowments"
                queryKey={["research", "grants", grantId, "endowments"]}
                queryFn={() => researchServiceApi.endowments.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No endowments are linked to this grant."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
