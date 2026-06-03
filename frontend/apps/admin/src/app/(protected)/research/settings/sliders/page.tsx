"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchSlidersPage() {
  return (
    <ResearchResourcePage
      title="Research Sliders"
      description="Manage research service slider records used by research pages."
      queryKey={["research", "sliders"]}
      resource={researchServiceApi.sliders}
      manageScopes={["content.manage", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "slider_type", label: "Slider Type", placeholder: "hero" },
        { name: "placement", label: "Placement", placeholder: "research_home" },
        { name: "subtitle", label: "Subtitle" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image_url", label: "Image URL", type: "url" },
        { name: "link_url", label: "Link URL", type: "url" },
        { name: "link_text", label: "Link Text" },
        { name: "starts_at", label: "Starts At", type: "datetime-local" },
        { name: "ends_at", label: "Ends At", type: "datetime-local" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ slider_type: "hero", placement: "research_home" }}
      emptyMessage="No research sliders were returned by the research service."
      metaFields={["slider_type", "placement", "is_active"]}
    />
  );
}
