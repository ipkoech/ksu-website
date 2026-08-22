"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FarmWorkspaceHeader, partnerColumns } from "../_components/farm-workspace";

export default function FarmPartnershipsPage() {
  return (
    <ResearchResourcePage
      title="Farm Partnerships"
      description="Manage farm, community, industry, and technical partners supporting demonstration and field research."
      queryKey={["research", "farm", "partnerships"]}
      resource={researchServiceApi.partners}
      manageScopes={["farm.manage", "research:write"]}
      listParams={{ is_active: true, status: "active", partner_type: "community" }}
      summarySlot={<FarmWorkspaceHeader />}
      recordColumns={partnerColumns}
      metaFields={["partner_type", "partnership_level", "country", "status"]}
      detailBaseHref="/research/farm/partnerships"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "acronym", label: "Acronym" },
        { name: "partner_type", label: "Partner Type", type: "select", placeholder: "Select type", options: [
          { label: "Community", value: "community" },
          { label: "Academic", value: "academic" },
          { label: "Industry", value: "industry" },
          { label: "Government", value: "government" },
          { label: "NGO", value: "ngo" },
        ] },
        { name: "partnership_level", label: "Partnership Level", type: "select", placeholder: "Select level", options: [
          { label: "Implementing", value: "implementing" },
          { label: "Strategic", value: "strategic" },
          { label: "Technical", value: "technical" },
          { label: "Community", value: "community" },
        ] },
        { name: "about", label: "About", type: "textarea" },
        { name: "collaboration_areas", label: "Collaboration Areas", type: "textarea" },
        { name: "key_achievements", label: "Key Achievements", type: "textarea" },
        { name: "website", label: "Website", type: "url" },
        { name: "email", label: "Email", type: "email" },
        { name: "country", label: "Country" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Inactive", value: "inactive" },
          { label: "Expired", value: "expired" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{
        partner_type: "community",
        partnership_level: "implementing",
        status: "active",
        is_active: true,
      }}
      emptyMessage="No farm partnerships were returned by the research service."
    />
  );
}
