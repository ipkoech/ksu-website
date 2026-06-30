"use client";

import { researchApi, researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ResearchDonorDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Donor"
      description="View donor profile, giving history, linked impact records, stories, and audit history."
      resource={researchServiceApi.donors}
      backHref="/research/donations/donors"
      slugParam="id"
      lookup="id"
      labelFields={["donor_type", "tier", "is_active"]}
      factFields={[
        { label: "Type", field: "donor_type", format: "label" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Total Donated", field: "total_donated" },
        { label: "Donation Count", field: "donation_count" },
        { label: "Last Donation", field: "last_donation_date", format: "date" },
      ]}
      sections={[
        { title: "Profile", fields: ["display_name", "first_name", "last_name", "organization_name", "organization_type"] },
        { title: "Recognition", fields: ["tier", "is_anonymous", "notes"] },
      ]}
      auditResourceTypes={["donor", "donors", "research_donor"]}
      renderAfter={(record) => <DonorRelations donor={record} />}
    />
  );
}

function DonorRelations({ donor }: { donor: ResearchGenericRecord }) {
  const donorId = String(donor.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="donations"
      tabs={[
        {
          value: "donations",
          label: "Donations",
          content: (
            <RelatedRecordsCard
              title="Donation Records"
              queryKey={["research", "donors", donorId, "donations"]}
              queryFn={() => researchServiceApi.donations.list({ page: 1, per_page: 12, donor_id: donorId })}
              emptyLabel="No donation records were returned for this donor."
              metaFields={["amount", "currency", "status", "donation_date"]}
            />
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Donor Stories"
                queryKey={["research", "donors", donorId, "stories"]}
                queryFn={() => researchServiceApi.donationStories.list({ page: 1, per_page: 8, donor_id: donorId })}
                emptyLabel="No donor stories are linked to this donor."
                metaFields={["donor_organization", "status", "is_featured"]}
              />
              <RelatedRecordsCard
                title="Impact Records"
                queryKey={["research", "donors", donorId, "impact-records"]}
                queryFn={() => donorImpactRecords(donorId)}
                emptyLabel="No impact records match this donor's completed donation source bindings."
                metaFields={["impact_type", "reporting_year", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}

function donorImpactRecords(donorId: string) {
  return researchApi.get<{ data: ResearchGenericRecord[] }>(`/api/v1/donors/id/${donorId}/impacts`);
}
