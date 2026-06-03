"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchDonationRecordsPage() {
  return (
    <ResearchResourcePage
      title="Donation Records"
      description="Track research donation records and donor-funded support."
      queryKey={["research", "donations"]}
      resource={researchServiceApi.donations}
      manageScopes={["donations.manage", "donations.confirm", "research:write"]}
      fields={[
        { name: "donor_id", label: "Donor", type: "entity", required: true, relation: { adapter: "researchDonor", filters: { is_active: true }, allowClear: false } },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "donation_type", label: "Donation Type", placeholder: "one_time" },
        { name: "designation", label: "Designation", placeholder: "unrestricted" },
        { name: "purpose", label: "Purpose" },
        { name: "donation_date", label: "Donation Date", type: "date", required: true },
        { name: "status", label: "Status", placeholder: "completed" },
      ]}
      defaults={{ currency: "KES", donation_type: "one_time", designation: "unrestricted", status: "completed" }}
      emptyMessage="No donations were returned by the research service."
    />
  );
}
