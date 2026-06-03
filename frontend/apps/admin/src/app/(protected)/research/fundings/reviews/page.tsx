"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function GrantReviewsPage() {
  return (
    <ResearchResourcePage
      title="Grant Reviews"
      description="Manage reviewer scores, comments, recommendations, and review status."
      queryKey={["research", "grant-reviews"]}
      resource={researchServiceApi.grantReviews}
      manageScopes={["funding.manage", "research.review_grants", "research:write"]}
      fields={[
        { name: "application_id", label: "Application", type: "entity", required: true, relation: { adapter: "researchGrantApplication", allowClear: false } },
        { name: "reviewer_id", label: "Reviewer", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "overall_score", label: "Overall Score", type: "number" },
        { name: "strengths", label: "Strengths", type: "textarea" },
        { name: "weaknesses", label: "Weaknesses", type: "textarea" },
        { name: "comments", label: "Comments", type: "textarea" },
        { name: "recommendation", label: "Recommendation", placeholder: "approve" },
        { name: "status", label: "Status", placeholder: "pending" },
      ]}
      defaults={{ status: "pending" }}
      emptyMessage="No grant reviews were returned by the research service."
      metaFields={["overall_score", "recommendation", "status"]}
    />
  );
}
