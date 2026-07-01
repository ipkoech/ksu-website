"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchCenterDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Center"
      description="View center profile, mandate, contact information, and public content fields."
      resource={researchServiceApi.centers}
      backHref="/research/centers"
      hideHeader
      showBackAction={false}
      publicHrefBase="/centers"
      auditResourceTypes={["center", "centers", "research_center"]}
      labelFields={["center_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Acronym", field: "acronym" },
        { label: "Established", field: "established_date", format: "date" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Mandate", fields: ["mandate", "mission", "vision", "objectives", "research_areas"] },
        { title: "Location and Media", fields: ["location", "address", "website", "logo_image_url", "cover_image_url"] },
      ]}
      renderAfter={(record) => <CenterRelations center={record} />}
    />
  );
}

function CenterRelations({ center }: { center: ResearchGenericRecord }) {
  return (
    <ResearchDetailRelationshipTabs
      tabs={[
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Center Projects"
              queryKey={["research", "centers", center.id, "projects"]}
              queryFn={() => researchServiceApi.projects.list({ page: 1, per_page: 8, center_id: center.id, fields: "id,title,slug,code,project_type,status" })}
              emptyLabel="No projects were returned for this research center."
              metaFields={["code", "project_type", "status"]}
            />
          ),
        },
        {
          value: "publications",
          label: "Publications",
          content: (
            <RelatedRecordsCard
              title="Center Publications"
              queryKey={["research", "centers", center.id, "publications"]}
              queryFn={() => researchServiceApi.publications.list({ page: 1, per_page: 8, center_id: center.id, fields: "id,title,slug,publication_type,year,status" })}
              emptyLabel="No publications were returned for this research center."
              metaFields={["publication_type", "year", "status"]}
            />
          ),
        },
        {
          value: "resources",
          label: "Resources",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Programs"
                queryKey={["research", "centers", center.id, "programs"]}
                queryFn={() => researchServiceApi.programs.list({ page: 1, per_page: 8, center_id: center.id, fields: "id,name,slug,code,status" })}
                emptyLabel="No programs were returned for this center."
                metaFields={["code", "status"]}
              />
              <RelatedRecordsCard
                title="Training"
                queryKey={["research", "centers", center.id, "training"]}
                queryFn={() => researchServiceApi.training.list({ page: 1, per_page: 8, center_id: center.id, fields: "id,title,slug,program_type,status" })}
                emptyLabel="No training programs were returned for this center."
                metaFields={["program_type", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
      defaultValue="projects"
    />
  );
}
