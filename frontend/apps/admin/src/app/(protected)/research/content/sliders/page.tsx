"use client";

import { slidersApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import { ContentWorkspaceHeader, contentColumns } from "../_components/content-workspace";

export default function ResearchSlidersPage() {
  return (
    <ResearchContentResourcePage
      title="Research Sliders"
      description="Manage slider groups scoped to research."
      queryKey={["research", "content", "sliders"]}
      resource={{
        list: slidersApi.listAdminSliders,
        create: (payload) => slidersApi.createSlider(payload.slider_group_id, payload),
        update: slidersApi.updateSlider,
        delete: slidersApi.deleteSlider,
      }}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={[
        { name: "location", label: "Location", type: "text", placeholder: "research_home" },
        { name: "is_main", label: "Main", type: "boolean" },
      ]}
      recordColumns={contentColumns}
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
      emptyMessage="No research slider groups were returned by the main content service."
      metaFields={["link_text", "is_main", "is_active"]}
    />
  );
}
