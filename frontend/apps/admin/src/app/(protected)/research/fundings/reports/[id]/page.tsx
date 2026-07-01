"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function GrantReportDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant Report"
      description="View grant report period, spending, submitter, review state, and related grant records."
      resource={researchServiceApi.grantReports}
      backHref="/research/fundings/reports"
      slugParam="id"
      lookup="id"
      labelFields={["report_type", "status"]}
      factFields={[
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Application", field: "application_id", relation: { adapter: "researchGrantApplication" } },
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Submitter", field: "submitter_id", relation: { adapter: "person" } },
        { label: "Submitted", field: "submitted_at", format: "datetime" },
        { label: "Reviewed", field: "reviewed_at", format: "datetime" },
      ]}
      sections={[
        { title: "Report", fields: ["summary", "activities", "achievements", "challenges", "lessons_learned", "next_steps"] },
        { title: "Financials", fields: ["expenditure_summary", "amount_spent", "balance"] },
        { title: "Period", fields: ["reporting_period_start", "reporting_period_end", "documents"] },
      ]}
      renderAfter={(record) => <ReportRelations report={record} />}
    />
  );
}

function ReportRelations({ report }: { report: ResearchGenericRecord }) {
  const grantId = String(report.grant_id ?? "");
  const applicationId = String(report.application_id ?? "");

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
                title="Grant Reports"
                queryKey={["research", "fundings", "reports", report.id, "grant-reports", grantId]}
                queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No other reports were returned for this grant."
                metaFields={["report_type", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Grant Guidelines"
                queryKey={["research", "fundings", "reports", report.id, "grant-guidelines", grantId]}
                queryFn={() => researchServiceApi.grantGuidelines.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No guidelines were returned for this grant."
                metaFields={["guideline_type", "document_name", "is_required"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "application",
          label: "Application",
          content: (
            <RelatedRecordsCard
              title="Application Reviews"
              queryKey={["research", "fundings", "reports", report.id, "application-reviews", applicationId]}
              queryFn={() => applicationId ? researchServiceApi.grantReviews.list({ page: 1, per_page: 8, application_id: applicationId }) : Promise.resolve({ data: [] })}
              emptyLabel="No application reviews were returned for this report."
              metaFields={["overall_score", "recommendation", "status"]}
            />
          ),
        },
      ]}
    />
  );
}
