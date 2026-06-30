"use client";

import { slidersApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";
import { SettingsOperationalDetail } from "../../_components/settings-operational-detail";

export default function ResearchSliderDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Slider"
      description="View research-scoped slider copy, media bindings, CTA metadata, and audit history."
      resource={{
        list: (params) => slidersApi.listAdminSliders({ page: 1, per_page: 100, scope_type: "research", ...params }),
      }}
      backHref="/research/settings/sliders"
      slugParam="id"
      lookup="id"
      labelFields={["is_main", "is_public", "is_active"]}
      factFields={[
        { label: "Group", field: "slider_group_id", relation: { adapter: "sliderGroup" } },
        { label: "Desktop Image", field: "desktop_media_id", relation: { adapter: "media" } },
        { label: "Mobile Image", field: "mobile_media_id", relation: { adapter: "media" } },
        { label: "Sort Order", field: "display_order" },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Copy", fields: ["title", "subtitle", "rich_text"] },
        { title: "CTA", fields: ["link_text", "external_url"] },
      ]}
      auditServiceName="main"
      auditResourceTypes={["slider", "marketing_slider", "sliders"]}
      renderAfter={(record) => <SettingsOperationalDetail record={record} kind="slider" />}
    />
  );
}
