"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchGeneralSettingsPage() {
  return (
    <ResearchResourcePage
      title="Research Settings"
      description="Manage research donation and public-facing configuration values."
      queryKey={["research", "donation-settings"]}
      resource={researchServiceApi.donationSettings}
      manageScopes={["donations.settings", "donations.manage", "research:write"]}
      fields={[
        { name: "key", label: "Key", required: true },
        { name: "value", label: "Value", type: "textarea" },
        { name: "setting_type", label: "Setting Type", placeholder: "general" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      defaults={{ setting_type: "general" }}
      emptyMessage="No research settings were returned by the research service."
    />
  );
}
