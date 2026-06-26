"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function EndowmentsPage() {
  return (
    <ResearchResourcePage
      title="Endowment Funds"
      description="Manage research endowment funds, values, donors, and contribution status."
      queryKey={["research", "endowments"]}
      resource={researchServiceApi.endowments}
      manageScopes={["research.manage_endowments", "funding.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "fund_type", label: "Fund Type", placeholder: "general" },
        { name: "purpose", label: "Purpose", type: "textarea" },
        { name: "principal_amount", label: "Principal Amount", type: "number" },
        { name: "current_value", label: "Current Value", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "donor_name", label: "Donor Name" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_accepting_contributions", label: "Accepting Contributions", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ fund_type: "general", currency: "KES", status: "active" }}
      emptyMessage="No endowment funds were returned by the research service."
      importResource="research-endowments"
    />
  );
}
