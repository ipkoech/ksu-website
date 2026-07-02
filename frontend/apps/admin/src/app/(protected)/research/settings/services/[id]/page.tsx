"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";
import { SettingsOperationalDetail } from "../../_components/settings-operational-detail";

export default function ResearchServiceDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Service"
      description="View service access details, contact metadata, center binding, and audit history."
      resource={researchServiceApi.services}
      backHref="/research/services"
      slugParam="id"
      lookup="id"
      labelFields={["service_type", "category", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Type", field: "service_type", format: "label" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Administrative Unit", field: "department_id", relation: { adapter: "department" } },
        { label: "Contact", field: "contact_email" },
        { label: "Free", field: "is_free", format: "boolean" },
      ]}
      sections={[
        { title: "Service", fields: ["summary", "description", "scope", "process"] },
        { title: "Access", fields: ["eligibility", "deliverables", "turnaround_time", "how_to_access", "request_url"] },
        { title: "Contact", fields: ["contact_name", "contact_email", "contact_phone", "fee_structure"] },
      ]}
      auditResourceTypes={["service", "research_service", "services"]}
      renderAfter={(record) => <SettingsOperationalDetail record={record} kind="service" />}
    />
  );
}
