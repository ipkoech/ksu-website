"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchDonorsPage() {
  return (
    <ResearchResourcePage
      title="Donors"
      description="Manage donor profiles for research donations and giving stories."
      queryKey={["research", "donors"]}
      resource={researchServiceApi.donors}
      manageScopes={["donations.manage", "research:write"]}
      fields={[
        { name: "donor_type", label: "Donor Type", placeholder: "individual" },
        { name: "display_name", label: "Display Name" },
        { name: "first_name", label: "First Name" },
        { name: "last_name", label: "Last Name" },
        { name: "organization_name", label: "Organization Name" },
        { name: "organization_type", label: "Organization Type" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "tier", label: "Tier" },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "is_anonymous", label: "Anonymous", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ donor_type: "individual" }}
      emptyMessage="No donors were returned by the research service."
      metaFields={["donor_type", "tier", "donation_count"]}
    />
  );
}
