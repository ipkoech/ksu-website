"use client";

import { slidersApi } from "@ksu/api-client";
import { ContentRecordDetailPage } from "../../_components/content-record-detail-page";

export default function ResearchSliderDetailPage() {
  return (
    <ContentRecordDetailPage
      title="Research Slider"
      description="View research slider media, call-to-action metadata, scope binding, attachments, and audit history."
      backHref="/research/content/sliders"
      entityType="slider"
      resourceType="slider"
      resource={{ get: slidersApi.getSlider }}
      factFields={[
        { label: "Slider Group", field: "slider_group_id", relation: { adapter: "sliderGroup" } },
        { label: "Desktop Image", field: "desktop_media_id", relation: { adapter: "media" } },
        { label: "Mobile Image", field: "mobile_media_id", relation: { adapter: "media" } },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Slider", fields: ["subtitle", "plain_text", "rich_text", "external_url", "link_text", "open_in_new_tab", "display_order", "start_datetime", "end_datetime"] },
      ]}
    />
  );
}
