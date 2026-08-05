"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { ResearchCoreDetailActions } from "../../_components/research-core-detail-actions";
import { BindableRecordsCard, RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchThemeDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Theme"
      description="View research theme taxonomy metadata, focus areas, and audit history."
      resource={researchServiceApi.themes}
      backHref="/research/themes"
      hideHeader
      showBackAction={false}
      actionsSlot={(record) => (
        <ResearchCoreDetailActions
          record={record}
          resource={researchServiceApi.themes}
          resourceLabel="Theme"
          listHref="/research/themes"
        />
      )}
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_featured", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Icon", field: "icon" },
        { label: "Color", field: "color" },
        { label: "Display Order", field: "display_order" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Theme Narrative", fields: ["description", "objectives"] },
        { title: "Visual Identity", fields: ["icon", "color", "cover_image_id"] },
      ]}
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
              queryFn={() => researchServiceApi.themeRelations.focusAreas.list(themeId)}
              emptyLabel="No focus areas were returned for this theme."
              metaFields={["code", "is_active"]}
            />
          ),
        },
        {
          value: "portfolio",
          label: "Portfolio",
          content: (
            <RelatedRecordsGrid>
              <BindableRecordsCard
                title="Theme Projects"
                addLabel="Add project"
                relationshipLabel="Project"
                queryKey={["research", "themes", themeId, "projects"]}
                queryFn={() => researchServiceApi.themeRelations.projects.list(themeId)}
                candidateQueryFn={(search) => researchServiceApi.projects.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,title,slug,code,project_type,status" })}
                bindRecord={(recordId) => researchServiceApi.themeRelations.projects.add(themeId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.themeRelations.projects.remove(themeId, recordId)}
                emptyLabel="No projects are linked to this theme."
                searchPlaceholder="Search projects"
                metaFields={["code", "project_type", "status"]}
              />
              <BindableRecordsCard
                title="Theme Programs"
                addLabel="Add program"
                relationshipLabel="Program"
                queryKey={["research", "themes", themeId, "programs"]}
                queryFn={() => researchServiceApi.themeRelations.programs.list(themeId)}
                candidateQueryFn={(search) => researchServiceApi.programs.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,name,slug,code,status" })}
                bindRecord={(recordId) => researchServiceApi.themeRelations.programs.add(themeId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.themeRelations.programs.remove(themeId, recordId)}
                emptyLabel="No programs are linked to this theme."
                searchPlaceholder="Search programs"
                metaFields={["code", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "outputs",
          label: "Outputs",
          content: (
            <RelatedRecordsGrid>
              <BindableRecordsCard
                title="Theme Publications"
                addLabel="Add publication"
                relationshipLabel="Publication"
                queryKey={["research", "themes", themeId, "publications"]}
                queryFn={() => researchServiceApi.themeRelations.publications.list(themeId)}
                candidateQueryFn={(search) => researchServiceApi.publications.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,title,slug,publication_type,year,status" })}
                bindRecord={(recordId) => researchServiceApi.themeRelations.publications.add(themeId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.themeRelations.publications.remove(themeId, recordId)}
                emptyLabel="No publications are linked to this theme."
                searchPlaceholder="Search publications"
                metaFields={["publication_type", "year", "status"]}
              />
              <BindableRecordsCard
                title="Theme Grants"
                addLabel="Add grant"
                relationshipLabel="Grant"
                queryKey={["research", "themes", themeId, "grants"]}
                queryFn={() => researchServiceApi.themeRelations.grants.list(themeId)}
                candidateQueryFn={(search) => researchServiceApi.grants.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,title,slug,code,grant_type,status" })}
                bindRecord={(recordId) => researchServiceApi.themeRelations.grants.add(themeId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.themeRelations.grants.remove(themeId, recordId)}
                emptyLabel="No grants are linked to this theme."
                searchPlaceholder="Search grants"
                metaFields={["code", "grant_type", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
