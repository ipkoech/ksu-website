"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { DonationsWorkspaceHeader } from "../_components/donations-workspace";

export default function DonationStoriesPage() {
  return (
    <ResearchResourcePage
      title="Donation Stories"
      description="Manage donor stories, testimonials, and public donation narratives."
      queryKey={["research", "donation-stories"]}
      resource={researchServiceApi.donationStories}
      manageScopes={["donations.manage", "research:write"]}
      exportResource="research-donation-stories"
      summarySlot={<DonationsWorkspaceHeader />}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "donor_id", label: "Donor", type: "entity", relation: { adapter: "researchDonor", filters: { is_active: true } } },
        { name: "donor_name", label: "Donor Name" },
        { name: "donor_organization", label: "Donor Organization" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "story", label: "Story", type: "textarea" },
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "photo_url", label: "Photo URL", type: "url" },
        { name: "video_url", label: "Video URL", type: "url" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "published" }}
      emptyMessage="No donation stories were returned by the research service."
      metaFields={["donor_name", "donor_organization", "status"]}
    />
  );
}
