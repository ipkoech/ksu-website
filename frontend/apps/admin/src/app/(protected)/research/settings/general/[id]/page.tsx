"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function ResearchGeneralSettingDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Setting"
      description="View research configuration key, value, and status."
      resource={researchServiceApi.donationSettings}
      backHref="/research/settings/general"
      slugParam="id"
      lookup="id"
      labelFields={["setting_type", "is_active"]}
      factFields={[
        { label: "Key", field: "key" },
        { label: "Type", field: "setting_type", format: "label" },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Setting", fields: ["value", "value_json", "description"] },
      ]}
    />
  );
}
