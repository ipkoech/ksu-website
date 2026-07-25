"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ScholarshipApplicationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Scholarship Application"
      description="Review scholarship proposal, applicant context, award metadata, and audit history."
      resource={researchServiceApi.scholarshipApplications}
      backHref="/research/capacity/scholarship-applications"
      slugParam="id"
      lookup="id"
      labelFields={["application_number", "status"]}
      factFields={[
        { label: "Scholarship", field: "scholarship_id", relation: { adapter: "researchScholarship" } },
        { label: "Applicant", field: "applicant_id", relation: { adapter: "person" } },
        { label: "Submitted", field: "submitted_at", format: "datetime" },
        { label: "Review Score", field: "review_score" },
        { label: "Decision", field: "decision_date", format: "date" },
        { label: "Awarded Amount", field: "awarded_amount" },
      ]}
      sections={[
        { title: "Application", fields: ["research_proposal", "personal_statement", "research_experience", "career_goals", "budget_justification"] },
        { title: "Documents", fields: ["references", "cv_url", "transcripts_url", "supporting_documents"] },
      ]}
      auditResourceTypes={["scholarship_application", "scholarship-applications", "capacity_scholarship_application"]}
      renderAfter={(record) => <ScholarshipApplicationRelations application={record} />}
    />
  );
}

function ScholarshipApplicationRelations({ application }: { application: ResearchGenericRecord }) {
  const scholarshipId = String(application.scholarship_id ?? "");
  const applicantId = String(application.applicant_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="scholarship"
      tabs={[
        {
          value: "scholarship",
          label: "Scholarship Queue",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Scholarship Applications"
                queryKey={["research", "capacity", "scholarship-applications", application.id, "scholarship", scholarshipId]}
                queryFn={() => researchServiceApi.scholarshipApplications.list({ page: 1, per_page: 8, scholarship_id: scholarshipId })}
                emptyLabel="No other applications were returned for this scholarship."
                metaFields={["application_number", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Applicant Applications"
                queryKey={["research", "capacity", "scholarship-applications", application.id, "applicant", applicantId]}
                queryFn={() => researchServiceApi.scholarshipApplications.list({ page: 1, per_page: 8, applicant_id: applicantId })}
                emptyLabel="No other scholarship applications were returned for this applicant."
                metaFields={["application_number", "status", "submitted_at"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
