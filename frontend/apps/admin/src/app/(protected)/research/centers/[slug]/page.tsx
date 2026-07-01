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
        { label: "School", field: "school_id", relation: { adapter: "school" } },
        { label: "Department", field: "department_id", relation: { adapter: "department" } },
        { label: "Director", field: "director_id", relation: { adapter: "person" } },
        { label: "Established", field: "established_date", format: "date" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Display Order", field: "display_order" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["about"] },
        { title: "Mandate", fields: ["mandate", "mission", "vision", "objectives", "research_areas"] },
        { title: "Location", fields: ["location", "address", "gps_latitude", "gps_longitude"] },
        { title: "Contact and Social", fields: ["email", "phone", "website", "social_links"] },
        { title: "Media and SEO", fields: ["logo_id", "cover_image_id", "gallery_media_ids", "attachment_media_ids", "document_media_ids", "meta_title", "meta_description", "keywords"] },
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
