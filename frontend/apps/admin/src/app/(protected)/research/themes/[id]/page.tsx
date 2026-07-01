"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard } from "../../_components/research-detail-relationships";

export default function ResearchThemeDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Theme"
      description="View research theme taxonomy metadata, focus areas, and audit history."
      resource={researchServiceApi.themes}
      backHref="/research/themes"
      hideHeader
      showBackAction={false}
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_featured", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Icon", field: "icon" },
        { label: "Color", field: "color" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Theme", fields: ["description", "objectives", "cover_image_url"] },
      ]}
      auditResourceTypes={["research_theme", "theme", "themes"]}
      renderAfter={(record) => <ThemeRelations theme={record} />}
    />
  );
}

function ThemeRelations({ theme }: { theme: ResearchGenericRecord }) {
  const themeId = String(theme.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="focus"
      tabs={[
        {
          value: "focus",
          label: "Focus Areas",
          content: (
            <RelatedRecordsCard
              title="Focus Areas"
              queryKey={["research", "themes", themeId, "focus-areas"]}
              queryFn={() => researchServiceApi.focusAreas.list({ page: 1, per_page: 12, theme_id: themeId, fields: "id,name,slug,code,is_active" })}
              emptyLabel="No focus areas were returned for this theme."
              metaFields={["code", "is_active"]}
            />
          ),
        },
      ]}
    />
  );
}
