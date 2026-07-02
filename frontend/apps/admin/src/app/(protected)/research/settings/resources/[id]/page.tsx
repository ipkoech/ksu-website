"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";
import { SettingsOperationalDetail } from "../../_components/settings-operational-detail";

export default function ResearchResourceDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Resource"
      description="View operational resource details, access rules, manager binding, and audit history."
      resource={researchServiceApi.resources}
      backHref="/research/resources"
      slugParam="id"
      lookup="id"
      labelFields={["resource_type", "status", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Type", field: "resource_type", format: "label" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Administrative Unit", field: "department_id", relation: { adapter: "department" } },
        { label: "Manager", field: "manager_id", relation: { adapter: "person" } },
        { label: "Free", field: "is_free", format: "boolean" },
      ]}
      sections={[
        { title: "Resource", fields: ["description", "specifications", "capabilities", "location", "room"] },
        { title: "Access", fields: ["usage_guidelines", "training_required", "access_type", "access_url", "booking_url"] },
        { title: "Operations", fields: ["availability", "operating_hours", "fee_structure", "contact_name", "contact_email", "contact_phone"] },
      ]}
      auditResourceTypes={["resource", "research_resource", "resources"]}
      renderAfter={(record) => <SettingsOperationalDetail record={record} kind="resource" />}
    />
  );
}
