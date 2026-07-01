"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { ResearchCoreDetailActions } from "../../_components/research-core-detail-actions";
import { BindableRecordsCard, RelatedRecordsCard } from "../../_components/research-detail-relationships";

export default function ResearchProgramDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Program"
      description="View program metadata, lead, center binding, projects, impact metrics, and audit history."
      resource={researchServiceApi.programs}
      backHref="/research/programs"
      hideHeader
      showBackAction={false}
      actionsSlot={(record) => (
        <ResearchCoreDetailActions
          record={record}
          resource={researchServiceApi.programs}
          resourceLabel="Program"
          listHref="/research/programs"
        />
      )}
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_featured", "is_active"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Lead", field: "lead_id", relation: { adapter: "person" } },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Budget", field: "budget" },
        { label: "Display Order", field: "display_order" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Program Narrative", fields: ["summary", "description", "objectives", "expected_outcomes", "methodology"] },
        { title: "Finance", fields: ["budget", "currency"] },
        { title: "Media and SEO", fields: ["cover_image_id", "meta_title", "meta_description", "keywords"] },
      ]}
      renderAfter={(record) => <ProgramRelations program={record} />}
    />
  );
}

function ProgramRelations({ program }: { program: ResearchGenericRecord }) {
  const programId = String(program.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="projects"
      tabs={[
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Program Projects"
              queryKey={["research", "programs", programId, "projects"]}
              queryFn={() => researchServiceApi.programRelations.projects.list(programId)}
              emptyLabel="No projects were returned for this program."
              metaFields={["project_type", "status", "start_date"]}
            />
          ),
        },
        {
          value: "themes",
          label: "Themes",
          content: (
            <BindableRecordsCard
              title="Program Themes"
              addLabel="Add theme"
              relationshipLabel="Theme"
              queryKey={["research", "programs", programId, "themes"]}
              queryFn={() => researchServiceApi.programRelations.themes.list(programId)}
              candidateQueryFn={(search) => researchServiceApi.themes.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,name,slug,code,color,is_active" })}
              bindRecord={(recordId) => researchServiceApi.programRelations.themes.add(programId, recordId)}
              unbindRecord={(recordId) => researchServiceApi.programRelations.themes.remove(programId, recordId)}
              emptyLabel="No themes are linked to this program."
              searchPlaceholder="Search themes"
              metaFields={["code", "color"]}
            />
          ),
        },
      ]}
    />
  );
}
