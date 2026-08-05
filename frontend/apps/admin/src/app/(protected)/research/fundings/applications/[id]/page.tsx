"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";
import { FundingDetailChrome } from "../../_components/funding-workspace";

export default function GrantApplicationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant Application"
      description="View grant application proposal, applicant, review queue, and related reports."
      resource={researchServiceApi.grantApplications}
      backHref="/research/fundings/applications"
      {...FundingDetailChrome({ title: "Grant Application" })}
      slugParam="id"
      lookup="id"
      labelFields={["application_number", "status"]}
      factFields={[
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Applicant", field: "applicant_id", relation: { adapter: "person" } },
        { label: "Requested Amount", field: "requested_amount" },
        { label: "Currency", field: "currency" },
        { label: "Submitted", field: "submitted_at", format: "datetime" },
        { label: "Decision", field: "decision_date", format: "date" },
      ]}
      sections={[
        { title: "Proposal", fields: ["project_title", "summary", "abstract", "objectives", "methodology", "expected_outcomes"] },
        { title: "Plan", fields: ["work_plan", "timeline", "proposed_start_date", "proposed_end_date", "duration_months"] },
        { title: "Budget And Decision", fields: ["requested_amount", "approved_amount", "budget_breakdown", "review_comments"] },
      ]}
      renderAfter={(record) => <ApplicationRelations application={record} />}
    />
  );
}

function ApplicationRelations({ application }: { application: ResearchGenericRecord }) {
  const applicationId = String(application.id);
  const grantId = String(application.grant_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="reviews"
      tabs={[
        {
          value: "reviews",
          label: "Reviews",
          content: (
            <RelatedRecordsCard
              title="Application Reviews"
              queryKey={["research", "fundings", "applications", applicationId, "reviews"]}
              queryFn={() => researchServiceApi.grantReviews.list({ page: 1, per_page: 12, application_id: applicationId })}
              emptyLabel="No reviews were returned for this application."
              metaFields={["overall_score", "recommendation", "status"]}
            />
          ),
        },
        {
          value: "grant",
          label: "Grant Context",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Other Applications"
                queryKey={["research", "fundings", "applications", applicationId, "grant-applications", grantId]}
                queryFn={() => researchServiceApi.grantApplications.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No other applications were returned for this grant."
                metaFields={["application_number", "requested_amount", "status"]}
              />
              <RelatedRecordsCard
                title="Grant Guidelines"
                queryKey={["research", "fundings", "applications", applicationId, "grant-guidelines", grantId]}
                queryFn={() => researchServiceApi.grantGuidelines.list({ page: 1, per_page: 8, grant_id: grantId })}
                emptyLabel="No guidelines were returned for this grant."
                metaFields={["guideline_type", "document_name", "is_required"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "reports",
          label: "Reports",
          content: (
            <RelatedRecordsCard
              title="Application Reports"
              queryKey={["research", "fundings", "applications", applicationId, "reports"]}
              queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 8, application_id: applicationId })}
              emptyLabel="No reports were returned for this application."
              metaFields={["report_type", "status", "submitted_at"]}
            />
          ),
        },
      ]}
    />
  );
}
