"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";
import { SettingsOperationalDetail } from "../../_components/settings-operational-detail";

export default function ResearchGuidelineDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Guideline"
      description="View guideline content, document metadata, review dates, and audit history."
      resource={researchServiceApi.guidelines}
      backHref="/research/settings/guidelines"
      slugParam="id"
      lookup="id"
      labelFields={["guideline_type", "category", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Type", field: "guideline_type", format: "label" },
        { label: "Version", field: "version" },
        { label: "Approved By", field: "approved_by" },
        { label: "Effective", field: "effective_date", format: "date" },
        { label: "Review", field: "review_date", format: "date" },
      ]}
      sections={[
        { title: "Guideline", fields: ["summary", "content", "scope", "applicability"] },
        { title: "Document", fields: ["document_name", "document_url", "approval_date", "contact_email"] },
      ]}
      auditResourceTypes={["guideline", "research_guideline", "guidelines"]}
      renderAfter={(record) => <SettingsOperationalDetail record={record} kind="guideline" />}
    />
  );
}
