"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchPartnerDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Partner"
      description="View partner profile, collaboration areas, contact details, and public status."
      resource={researchServiceApi.partners}
      backHref="/research/partnerships"
      publicHrefBase="/partners"
      auditResourceTypes={["partner", "partners", "research_partner"]}
      labelFields={["partner_type", "partnership_level", "status"]}
      factFields={[
        { label: "Acronym", field: "acronym" },
        { label: "Country", field: "country" },
        { label: "Email", field: "email" },
        { label: "Website", field: "website" },
        { label: "Public", field: "is_public", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "summary", "description"] },
        { title: "Collaboration", fields: ["collaboration_areas", "key_achievements"] },
      ]}
      renderAfter={(record) => <PartnerRelations partner={record} />}
    />
  );
}

function PartnerRelations({ partner }: { partner: ResearchGenericRecord }) {
  return (
    <ResearchDetailRelationshipTabs
      tabs={[
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Partner Projects"
              queryKey={["research", "partners", partner.id, "projects"]}
              queryFn={() => researchServiceApi.partnerRelations.projects.list(partner.id)}
              emptyLabel="No projects are linked to this partner."
              metaFields={["code", "project_type", "status"]}
            />
          ),
        },
        {
          value: "farms",
          label: "Farms",
          content: (
            <RelatedRecordsCard
              title="Farm Sites Through Projects"
              queryKey={["research", "partners", partner.id, "farms"]}
              queryFn={() => researchServiceApi.partnerRelations.farms.list(partner.id)}
              emptyLabel="No farm sites are linked to this partner through farm projects."
              metaFields={["code", "farm_type", "county"]}
            />
          ),
        },
        {
          value: "activities",
          label: "Activities",
          content: (
            <RelatedRecordsCard
              title="Partner Activities"
              queryKey={["research", "partners", partner.id, "activities"]}
              queryFn={() => researchServiceApi.partnerRelations.activities.list(partner.id)}
              emptyLabel="No research_partner scoped activities were returned by the events service."
              metaFields={["start_date", "location", "status"]}
            />
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Impact Stories"
                queryKey={["research", "partners", partner.id, "impact-stories"]}
                queryFn={() => researchServiceApi.partnerRelations.impactStories.list(partner.id)}
                emptyLabel="No impact stories are linked through this partner's projects."
                metaFields={["story_type", "story_date", "project_id"]}
              />
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "partners", partner.id, "impact-metrics"]}
                queryFn={() => researchServiceApi.partnerRelations.impactMetrics.list(partner.id)}
                emptyLabel="No impact metrics are linked through this partner's projects."
                metaFields={["metric_type", "category", "value", "unit"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "operations",
          label: "Operations",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Consultancies"
                queryKey={["research", "partners", partner.id, "consultancies"]}
                queryFn={() => researchServiceApi.partnerRelations.consultancies.list(partner.id)}
                emptyLabel="No consultancies are linked to this partner."
                metaFields={["code", "consultancy_type", "status"]}
              />
              <RelatedRecordsCard
                title="Sustainability"
                queryKey={["research", "partners", partner.id, "sustainability"]}
                queryFn={() => researchServiceApi.partnerRelations.sustainability.list(partner.id)}
                emptyLabel="No sustainability initiatives are linked to this partner."
                metaFields={["code", "initiative_type", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
      defaultValue="projects"
    />
  );
}
