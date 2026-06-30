"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { donorColumns, DonationsWorkspaceHeader } from "../_components/donations-workspace";

export default function ResearchDonorsPage() {
  return (
    <ResearchResourcePage
      title="Donors"
      description="Manage donor profiles for research donations and giving stories."
      queryKey={["research", "donors"]}
      resource={researchServiceApi.donors}
      manageScopes={["donations.manage", "research:write"]}
      importResource="research-donors"
      summarySlot={<DonationsWorkspaceHeader />}
      recordColumns={donorColumns}
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search donor name, organization, or email" },
        { name: "donor_type", label: "Donor Type", type: "select", options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "organization" },
          { label: "Corporate", value: "corporate" },
          { label: "Foundation", value: "foundation" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      fields={[
        { name: "donor_type", label: "Donor Type", type: "select", placeholder: "Select type", options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "organization" },
          { label: "Corporate", value: "corporate" },
          { label: "Foundation", value: "foundation" },
        ] },
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
      detailHref={(record) => `/research/donations/donors/${record.id}`}
    />
  );
}
