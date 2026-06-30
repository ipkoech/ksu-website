"use client";

import { researchApi, researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function DonationImpactDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Donation Impact"
      description="View donation impact metadata, source bindings, related donations, stories, and audit history."
      resource={researchServiceApi.donationImpacts}
      backHref="/research/donations/impacts"
      slugParam="id"
      lookup="id"
      labelFields={["impact_type", "status", "is_featured"]}
      factFields={[
        { label: "Type", field: "impact_type", format: "label" },
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Scholarship", field: "scholarship_id", relation: { adapter: "researchScholarship" } },
        { label: "Reporting Year", field: "reporting_year" },
        { label: "Total Raised", field: "total_raised" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description", "achievements", "beneficiaries"] },
        { title: "Metrics", fields: ["total_raised", "total_spent", "currency", "beneficiary_count", "metrics"] },
      ]}
      auditResourceTypes={["donation_impact", "donation-impacts", "impact"]}
      renderAfter={(record) => <DonationImpactRelations impact={record} />}
    />
  );
}

function DonationImpactRelations({ impact }: { impact: ResearchGenericRecord }) {
  const impactId = String(impact.id);
  const sourceFilters = {
    project_id: impact.project_id ? String(impact.project_id) : undefined,
    center_id: impact.center_id ? String(impact.center_id) : undefined,
    scholarship_id: impact.scholarship_id ? String(impact.scholarship_id) : undefined,
    fund_id: impact.fund_id ? String(impact.fund_id) : undefined,
  };
  const hasSource = Object.values(sourceFilters).some(Boolean);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="donations"
      tabs={[
        {
          value: "donations",
          label: "Donations",
          content: hasSource ? (
            <RelatedRecordsCard
              title="Donations With Matching Source"
              queryKey={["research", "donation-impacts", impactId, "donations"]}
              queryFn={() => impactDonationRecords(impactId)}
              emptyLabel="No donations matched this impact record's project, center, scholarship, or fund."
              metaFields={["amount", "currency", "status", "donation_date"]}
            />
          ) : (
            <RelatedRecordsCard
              title="Donations With Matching Source"
              queryKey={["research", "donation-impacts", impact.id, "donations-empty"]}
              queryFn={() => Promise.resolve({ data: [] })}
              emptyLabel="This impact record has no source binding for donation lookup."
            />
          ),
        },
        {
          value: "stories",
          label: "Stories",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Donor Stories From Matching Donations"
                queryKey={["research", "donation-impacts", impactId, "stories"]}
                queryFn={() => impactStoryRecords(impactId)}
                emptyLabel="No donor stories matched this impact record's donation sources."
                metaFields={["donor_name", "donor_organization", "status"]}
              />
              <RelatedRecordsCard
                title="Related Impact Records"
                queryKey={["research", "donation-impacts", impact.id, "related-impacts", sourceFilters]}
                queryFn={() => researchServiceApi.donationImpacts.list({ page: 1, per_page: 8, ...sourceFilters })}
                emptyLabel="No sibling impact records share this source binding."
                metaFields={["impact_type", "reporting_year", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}

function impactDonationRecords(impactId: string) {
  return researchApi.get<{ data: ResearchGenericRecord[] }>(`/api/v1/donation-impacts/id/${impactId}/donations`);
}

function impactStoryRecords(impactId: string) {
  return researchApi.get<{ data: ResearchGenericRecord[] }>(`/api/v1/donation-impacts/id/${impactId}/stories`);
}
