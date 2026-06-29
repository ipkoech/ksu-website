"use client";

import { slidersApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { ResearchSettingsWorkspaceHeader } from "../_components/settings-workspace";

export default function ResearchSlidersPage() {
  return (
    <ResearchContentResourcePage
      title="Research Sliders"
      description="Manage main content slider groups scoped to research pages."
      queryKey={["research", "sliders"]}
      resource={{
        list: slidersApi.listAdminSliders,
        create: (payload) => slidersApi.createSlider(payload.slider_group_id, payload),
        update: slidersApi.updateSlider,
        delete: slidersApi.deleteSlider,
      }}
      manageScopes={["marketing.manage_sliders", "admin:*"]}
      summarySlot={<ResearchSettingsWorkspaceHeader />}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "subtitle", label: "Subtitle" },
        { name: "rich_text", label: "Body", type: "richtext" },
        { name: "desktop_media_id", label: "Desktop Image", type: "media", media: { mediaType: "image", uploadEntityType: "research", uploadRole: "slider_desktop" } },
        { name: "mobile_media_id", label: "Mobile Image", type: "media", media: { mediaType: "image", uploadEntityType: "research", uploadRole: "slider_mobile" } },
        { name: "external_url", label: "CTA Link", type: "url" },
        { name: "link_text", label: "CTA Label" },
        { name: "display_order", label: "Sort Order", type: "number" },
        { name: "is_main", label: "Main", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ is_active: true, is_public: true, display_order: 100 }}
      emptyMessage="No research slider records were returned by the main content service."
      metaFields={["link_text", "is_main", "is_active"]}
    />
  );
}
