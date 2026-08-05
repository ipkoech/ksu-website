"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchAdminDetailPage,
  ResearchDetailRelationshipTabs,
} from "../../../_components/research-admin-detail-page";
import {
  RelatedRecordsCard,
  RelatedRecordsGrid,
} from "../../../_components/research-detail-relationships";

export default function FarmPartnershipDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Partnership"
      description="View farm partner profile, collaboration scope, linked farm records, projects, activities, and audit history."
      resource={researchServiceApi.partners}
      backHref="/research/farm/partnerships"
      publicHrefBase="/partners"
      labelFields={["partner_type", "partnership_level", "status"]}
      factFields={[
        { label: "Acronym", field: "acronym" },
        { label: "Country", field: "country" },
        { label: "Website", field: "website" },
        { label: "Email", field: "email" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "description", "collaboration_areas"] },
        { title: "Results", fields: ["key_achievements", "impact_summary"] },
      ]}
      auditResourceTypes={["research_partner", "partners", "partner"]}
      renderAfter={(record) => <FarmPartnerRelations partner={record} />}
    />
  );
}

function FarmPartnerRelations({ partner }: { partner: ResearchGenericRecord }) {
  const partnerId = String(partner.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="farms"
      tabs={[
        {
          value: "farms",
          label: "Farms",
          content: (
            <RelatedRecordsCard
              title="Farm Sites Through Projects"
              queryKey={["research", "farm", "partners", partnerId, "farms"]}
              queryFn={() => researchServiceApi.partnerRelations.farms.list(partnerId)}
              emptyLabel="No farm sites are linked through this partner's projects."
            />
          ),
        },
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Linked Projects"
              queryKey={["research", "farm", "partners", partnerId, "projects"]}
              queryFn={() => researchServiceApi.partnerRelations.projects.list(partnerId)}
              emptyLabel="No projects are linked to this partner."
            />
          ),
        },
        {
          value: "activities",
          label: "Activities",
          content: (
            <RelatedRecordsCard
              title="Partner Activities"
              queryKey={["research", "farm", "partners", partnerId, "activities"]}
              queryFn={() => researchServiceApi.partnerRelations.activities.list(partnerId)}
              emptyLabel="No activities are linked to this partner."
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
                queryKey={["research", "farm", "partners", partnerId, "impact-stories"]}
                queryFn={() => researchServiceApi.partnerRelations.impactStories.list(partnerId)}
                emptyLabel="No impact stories are linked to this partner."
              />
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "farm", "partners", partnerId, "impact-metrics"]}
                queryFn={() => researchServiceApi.partnerRelations.impactMetrics.list(partnerId)}
                emptyLabel="No impact metrics are linked to this partner."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
