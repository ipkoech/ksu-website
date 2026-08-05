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

export default function SustainabilityPartnerDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Sustainability Partner"
      description="View sustainability partner profile, linked initiatives, projects, activities, impact, and audit history."
      resource={researchServiceApi.partners}
      backHref="/research/sustainability/partners"
      publicHrefBase="/partners"
      labelFields={["partner_type", "partnership_level", "status"]}
      factFields={[
        { label: "Country", field: "country" },
        { label: "Contact Person", field: "contact_person_name" },
        { label: "Email", field: "email" },
        { label: "Website", field: "website" },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "description", "collaboration_areas"] },
        { title: "Results", fields: ["key_achievements", "impact_summary"] },
      ]}
      auditResourceTypes={["research_partner", "partners", "partner"]}
      renderAfter={(record) => <SustainabilityPartnerRelations partner={record} />}
    />
  );
}

function SustainabilityPartnerRelations({ partner }: { partner: ResearchGenericRecord }) {
  const partnerId = String(partner.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="sustainability"
      tabs={[
        {
          value: "sustainability",
          label: "Sustainability",
          content: (
            <RelatedRecordsCard
              title="Sustainability Initiatives"
              queryKey={["research", "sustainability", "partners", partnerId, "initiatives"]}
              queryFn={() => researchServiceApi.partnerRelations.sustainability.list(partnerId)}
              emptyLabel="No sustainability initiatives are linked to this partner."
            />
          ),
        },
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Linked Projects"
              queryKey={["research", "sustainability", "partners", partnerId, "projects"]}
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
              queryKey={["research", "sustainability", "partners", partnerId, "activities"]}
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
                queryKey={["research", "sustainability", "partners", partnerId, "impact-stories"]}
                queryFn={() => researchServiceApi.partnerRelations.impactStories.list(partnerId)}
                emptyLabel="No impact stories are linked to this partner."
              />
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "sustainability", "partners", partnerId, "impact-metrics"]}
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
