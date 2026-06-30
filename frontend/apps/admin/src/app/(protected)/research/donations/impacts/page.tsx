"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { DonationsWorkspaceHeader } from "../_components/donations-workspace";

export default function DonationImpactsPage() {
  return (
    <ResearchResourcePage
      title="Donation Impacts"
      description="Manage impact records showing how research donations were used."
      queryKey={["research", "donation-impacts"]}
      resource={researchServiceApi.donationImpacts}
      manageScopes={["donations.manage", "research.manage_impact", "research:write"]}
      summarySlot={<DonationsWorkspaceHeader />}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "impact_type", label: "Impact Type", placeholder: "project" },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "scholarship_id", label: "Scholarship", type: "entity", relation: { adapter: "researchScholarship", filters: { is_active: true } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "total_raised", label: "Total Raised", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "reporting_year", label: "Reporting Year", type: "number" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ impact_type: "project", currency: "KES", status: "published" }}
      emptyMessage="No donation impacts were returned by the research service."
      metaFields={["impact_type", "reporting_year", "status"]}
      detailHref={(record) => `/research/donations/impacts/${record.id}`}
    />
  );
}
