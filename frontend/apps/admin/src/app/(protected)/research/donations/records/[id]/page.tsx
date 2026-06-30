"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ResearchDonationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Donation Record"
      description="View donation amount, designation, donor linkage, purpose, and status."
      resource={researchServiceApi.donations}
      backHref="/research/donations/records"
      slugParam="id"
      lookup="id"
      labelFields={["donation_type", "designation", "status"]}
      factFields={[
        { label: "Amount", field: "amount" },
        { label: "Currency", field: "currency" },
        { label: "Date", field: "donation_date", format: "date" },
        { label: "Donor", field: "donor_id", relation: { adapter: "researchDonor" } },
      ]}
      sections={[
        { title: "Purpose", fields: ["purpose", "notes"] },
        { title: "Payment", fields: ["payment_method", "payment_reference", "receipt_number"] },
      ]}
      auditResourceTypes={["donation", "donations", "donation_record"]}
      renderAfter={(record) => <DonationRelations donation={record} />}
    />
  );
}

function DonationRelations({ donation }: { donation: ResearchGenericRecord }) {
  const donorId = String(donation.donor_id ?? "");
  const impactFilters = {
    project_id: donation.project_id ? String(donation.project_id) : undefined,
    center_id: donation.center_id ? String(donation.center_id) : undefined,
    scholarship_id: donation.scholarship_id ? String(donation.scholarship_id) : undefined,
    fund_id: donation.fund_id ? String(donation.fund_id) : undefined,
  };
  const hasImpactSource = Object.values(impactFilters).some(Boolean);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="donor"
      tabs={[
        {
          value: "donor",
          label: "Donor",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Other Donations"
                queryKey={["research", "donations", "detail", donation.id, "donor-donations", donorId]}
                queryFn={() => researchServiceApi.donations.list({ page: 1, per_page: 8, donor_id: donorId })}
                emptyLabel="No other donations were returned for this donor."
              />
              <RelatedRecordsCard
                title="Donor Stories"
                queryKey={["research", "donations", "detail", donation.id, "donor-stories", donorId]}
                queryFn={() => researchServiceApi.donationStories.list({ page: 1, per_page: 8, donor_id: donorId })}
                emptyLabel="No stories are linked to this donor."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: hasImpactSource ? (
            <RelatedRecordsCard
              title="Impact Records"
              queryKey={["research", "donations", "detail", donation.id, "impacts", impactFilters]}
              queryFn={() => researchServiceApi.donationImpacts.list({ page: 1, per_page: 8, ...impactFilters })}
              emptyLabel="No impact records match this donation's linked project, center, scholarship, or fund."
            />
          ) : (
            <RelatedRecordsCard
              title="Impact Records"
              queryKey={["research", "donations", "detail", donation.id, "impacts-empty"]}
              queryFn={() => Promise.resolve({ data: [] })}
              emptyLabel="This donation has no project, center, scholarship, or fund binding for impact lookup."
            />
          ),
        },
      ]}
    />
  );
}
