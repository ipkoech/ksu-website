"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";
import { FundingDetailChrome } from "../../_components/funding-workspace";

export default function EndowmentFundDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Endowment Fund"
      description="View endowment purpose, values, donor information, scholarship links, and donation records."
      resource={researchServiceApi.endowments}
      backHref="/research/fundings/endowments"
      {...FundingDetailChrome({ title: "Endowment Fund" })}
      slugParam="id"
      lookup="id"
      labelFields={["fund_type", "status", "is_accepting_contributions"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Type", field: "fund_type", format: "label" },
        { label: "Principal", field: "principal_amount" },
        { label: "Current Value", field: "current_value" },
        { label: "Annual Distribution", field: "annual_distribution" },
        { label: "Established", field: "established_date", format: "date" },
      ]}
      sections={[
        { title: "Fund", fields: ["purpose", "description", "eligibility", "use_guidelines"] },
        { title: "Donor", fields: ["donor_name", "donor_message", "contact_name", "contact_email"] },
      ]}
      renderAfter={(record) => <EndowmentRelations endowment={record} />}
    />
  );
}

function EndowmentRelations({ endowment }: { endowment: ResearchGenericRecord }) {
  const endowmentId = String(endowment.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="scholarships"
      tabs={[
        {
          value: "scholarships",
          label: "Scholarships",
          content: (
            <RelatedRecordsCard
              title="Linked Scholarships"
              queryKey={["research", "fundings", "endowments", endowmentId, "scholarships"]}
              queryFn={() => researchServiceApi.scholarships.list({ page: 1, per_page: 12, endowment_fund_id: endowmentId })}
              emptyLabel="No scholarships were returned for this endowment fund."
              metaFields={["scholarship_type", "funder_name", "status"]}
            />
          ),
        },
        {
          value: "giving",
          label: "Giving",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Donation Records"
                queryKey={["research", "fundings", "endowments", endowmentId, "donations"]}
                queryFn={() => researchServiceApi.donations.list({ page: 1, per_page: 8, fund_id: endowmentId })}
                emptyLabel="No donation records were returned for this endowment fund."
                metaFields={["amount", "currency", "status", "donation_date"]}
              />
              <RelatedRecordsCard
                title="Donation Impact"
                queryKey={["research", "fundings", "endowments", endowmentId, "impacts"]}
                queryFn={() => researchServiceApi.donationImpacts.list({ page: 1, per_page: 8, fund_id: endowmentId })}
                emptyLabel="No donation impact records were returned for this endowment fund."
                metaFields={["impact_type", "reporting_year", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
