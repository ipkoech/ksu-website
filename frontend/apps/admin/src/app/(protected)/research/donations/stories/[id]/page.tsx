"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function DonationStoryDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Donation Story"
      description="View donor story content, linked donor context, related donations, impact records, and audit history."
      resource={researchServiceApi.donationStories}
      backHref="/research/donations?tab=stories"
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_featured", "is_active"]}
      factFields={[
        { label: "Donor", field: "donor_id", relation: { adapter: "researchDonor" } },
        { label: "Donor Name", field: "donor_name" },
        { label: "Organization", field: "donor_organization" },
        { label: "Video URL", field: "video_url" },
      ]}
      sections={[
        { title: "Story", fields: ["summary", "story", "motivation", "impact_witnessed", "quote"] },
        { title: "Media", fields: ["photo_url", "video_url"] },
      ]}
      auditResourceTypes={["donation_story", "donation-stories", "story"]}
      renderAfter={(record) => <DonationStoryRelations story={record} />}
    />
  );
}

function DonationStoryRelations({ story }: { story: ResearchGenericRecord }) {
  const donorId = story.donor_id ? String(story.donor_id) : "";

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="donor"
      tabs={[
        {
          value: "donor",
          label: "Donor",
          content: donorId ? (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Donor Donations"
                queryKey={["research", "donation-stories", story.id, "donations", donorId]}
                queryFn={() => researchServiceApi.donations.list({ page: 1, per_page: 8, donor_id: donorId })}
                emptyLabel="No donations were returned for this story's donor."
                metaFields={["amount", "currency", "status", "donation_date"]}
              />
              <RelatedRecordsCard
                title="Other Donor Stories"
                queryKey={["research", "donation-stories", story.id, "stories", donorId]}
                queryFn={() => researchServiceApi.donationStories.list({ page: 1, per_page: 8, donor_id: donorId })}
                emptyLabel="No other stories are linked to this donor."
                metaFields={["donor_organization", "status", "is_featured"]}
              />
            </RelatedRecordsGrid>
          ) : (
            <RelatedRecordsCard
              title="Donor Donations"
              queryKey={["research", "donation-stories", story.id, "anonymous-donor"]}
              queryFn={() => Promise.resolve({ data: [] })}
              emptyLabel="This story is not linked to a donor record."
            />
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsCard
              title="Impact Records"
              queryKey={["research", "donation-stories", story.id, "impact-records"]}
              queryFn={() => researchServiceApi.donationImpacts.list({ page: 1, per_page: 8, status: "published" })}
              emptyLabel="No published impact records were returned."
              metaFields={["impact_type", "reporting_year", "status"]}
            />
          ),
        },
      ]}
    />
  );
}
