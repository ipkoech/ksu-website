"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { ResearchCoreDetailActions } from "../../_components/research-core-detail-actions";
import { BindableRecordsCard, RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

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
      actionsSlot={(record) => (
        <ResearchCoreDetailActions
          record={record}
          resource={researchServiceApi.centers}
          resourceLabel="Center"
          listHref="/research/centers"
        />
      )}
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
              queryFn={() => researchServiceApi.centerRelations.projects.list(String(center.id))}
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
          value: "programs",
          label: "Programs",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Programs"
                queryKey={["research", "centers", center.id, "programs"]}
                queryFn={() => researchServiceApi.centerRelations.programs.list(String(center.id))}
                emptyLabel="No programs were returned for this center."
                metaFields={["code", "status"]}
              />
              <RelatedRecordsCard
                title="Research Farms"
                queryKey={["research", "centers", center.id, "farms"]}
                queryFn={() => researchServiceApi.centerRelations.farms.list(String(center.id))}
                emptyLabel="No farms were returned for this center."
                metaFields={["code", "farm_type", "location"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "partners",
          label: "Partners",
          content: (
            <BindableRecordsCard
              title="Center Partners"
              addLabel="Link partner"
              relationshipLabel="Partner"
              queryKey={["research", "centers", center.id, "partners"]}
              queryFn={() => researchServiceApi.centerRelations.partners.list(String(center.id))}
              candidateQueryFn={(search) => researchServiceApi.partners.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,name,slug,partner_type,partnership_level,status" })}
              bindRecord={(recordId) => researchServiceApi.centerRelations.partners.add(String(center.id), recordId)}
              unbindRecord={(recordId) => researchServiceApi.centerRelations.partners.remove(String(center.id), recordId)}
              emptyLabel="No partners are linked to this center."
              searchPlaceholder="Search partners"
              metaFields={["partner_type", "partnership_level", "status"]}
            />
          ),
        },
        {
          value: "focus-areas",
          label: "Focus Areas",
          content: (
            <BindableRecordsCard
              title="Center Focus Areas"
              addLabel="Add focus area"
              relationshipLabel="Focus Area"
              queryKey={["research", "centers", center.id, "focus-areas"]}
              queryFn={() => researchServiceApi.centerRelations.focusAreas.list(String(center.id))}
              candidateQueryFn={(search) => researchServiceApi.focusAreas.list({ page: 1, per_page: 20, q: search || undefined, fields: "id,name,slug,code,is_active,theme_id" })}
              bindRecord={(recordId) => researchServiceApi.centerRelations.focusAreas.add(String(center.id), recordId)}
              unbindRecord={(recordId) => researchServiceApi.centerRelations.focusAreas.remove(String(center.id), recordId)}
              emptyLabel="No focus areas are linked to this center."
              searchPlaceholder="Search focus areas"
              metaFields={["code", "is_active"]}
            />
          ),
        },
      ]}
      defaultValue="projects"
    />
  );
}
