"use client";

import { slidersApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";

export default function ResearchSlidersPage() {
  return (
    <ResearchContentResourcePage
      title="Research Sliders"
      description="Manage slider groups scoped to research."
      queryKey={["research", "content", "sliders"]}
      resource={{
        list: slidersApi.listGroups,
        create: slidersApi.createGroup,
        update: slidersApi.updateGroup,
        delete: slidersApi.deleteGroup,
      }}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "location", label: "Location", placeholder: "research_home" },
        { name: "is_main", label: "Main", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ location: "research_home", is_active: true }}
      emptyMessage="No research slider groups were returned by the main content service."
      metaFields={["location", "is_main", "is_active"]}
    />
  );
}
