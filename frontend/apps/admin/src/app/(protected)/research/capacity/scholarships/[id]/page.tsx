"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ScholarshipDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Scholarship"
      description="View scholarship value, eligibility, awards pipeline, applications, and audit history."
      resource={researchServiceApi.scholarships}
      backHref="/research/capacity/scholarships"
      slugParam="id"
      lookup="id"
      labelFields={["scholarship_type", "status", "is_featured"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Funder", field: "funder_name" },
        { label: "Endowment", field: "endowment_fund_id", relation: { adapter: "researchEndowment" } },
        { label: "Value", field: "value" },
        { label: "Currency", field: "currency" },
        { label: "Deadline", field: "application_deadline", format: "datetime" },
      ]}
      sections={[
        { title: "Opportunity", fields: ["summary", "description", "eligibility", "requirements"] },
        { title: "Award", fields: ["benefits", "obligations", "selection_criteria", "number_available", "duration_months", "renewable"] },
        { title: "Coverage", fields: ["covers_tuition", "covers_stipend", "covers_travel", "covers_research"] },
      ]}
      auditResourceTypes={["scholarship", "scholarships", "capacity_scholarship"]}
      renderAfter={(record) => <ScholarshipRelations scholarship={record} />}
    />
  );
}

function ScholarshipRelations({ scholarship }: { scholarship: ResearchGenericRecord }) {
  const scholarshipId = String(scholarship.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="applications"
      tabs={[
        {
          value: "applications",
          label: "Applications",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Submitted Applications"
                queryKey={["research", "capacity", "scholarships", scholarshipId, "submitted-applications"]}
                queryFn={() => researchServiceApi.scholarshipApplications.list({ page: 1, per_page: 8, scholarship_id: scholarshipId, status: "submitted" })}
                emptyLabel="No submitted applications were returned for this scholarship."
                metaFields={["application_number", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Awarded Applications"
                queryKey={["research", "capacity", "scholarships", scholarshipId, "awarded-applications"]}
                queryFn={() => researchServiceApi.scholarshipApplications.list({ page: 1, per_page: 8, scholarship_id: scholarshipId, status: "awarded" })}
                emptyLabel="No awarded applications were returned for this scholarship."
                metaFields={["application_number", "status", "awarded_amount"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
