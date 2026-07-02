"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard } from "../../../_components/research-detail-relationships";
import { FundingDetailChrome } from "../../_components/funding-workspace";

export default function GrantReviewDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant Review"
      description="View reviewer score, recommendation, comments, and application context."
      resource={researchServiceApi.grantReviews}
      backHref="/research/fundings/reviews"
      {...FundingDetailChrome({ title: "Grant Review" })}
      slugParam="id"
      lookup="id"
      labelFields={["recommendation", "status"]}
      factFields={[
        { label: "Application", field: "application_id", relation: { adapter: "researchGrantApplication" } },
        { label: "Reviewer", field: "reviewer_id", relation: { adapter: "person" } },
        { label: "Overall Score", field: "overall_score" },
        { label: "Reviewed", field: "reviewed_at", format: "datetime" },
      ]}
      sections={[
        { title: "Review", fields: ["criteria_scores", "strengths", "weaknesses", "comments", "recommendation"] },
      ]}
      renderAfter={(record) => <ReviewRelations review={record} />}
    />
  );
}

function ReviewRelations({ review }: { review: ResearchGenericRecord }) {
  const applicationId = String(review.application_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="application"
      tabs={[
        {
          value: "application",
          label: "Application Reviews",
          content: (
            <RelatedRecordsCard
              title="Sibling Reviews"
              queryKey={["research", "fundings", "reviews", review.id, "application", applicationId]}
              queryFn={() => researchServiceApi.grantReviews.list({ page: 1, per_page: 12, application_id: applicationId })}
              emptyLabel="No other reviews were returned for this application."
              metaFields={["overall_score", "recommendation", "status"]}
            />
          ),
        },
      ]}
    />
  );
}
