"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { SustainabilityWorkspaceHeader, partnerColumns } from "../_components/sustainability-workspace";

export default function SustainabilityPartnersPage() {
  return (
    <ResearchResourcePage
      title="Sustainability Partners"
      description="Manage partners supporting sustainability and climate change work."
      queryKey={["research", "sustainability-partners"]}
      resource={researchServiceApi.partners}
      manageScopes={["sustainability.manage", "partnerships.manage", "research:write"]}
      summarySlot={<SustainabilityWorkspaceHeader />}
      recordColumns={partnerColumns}
      detailBaseHref="/research/sustainability/partners"
      listFilters={[
        { name: "search", label: "Search", type: "text", placeholder: "Search partner name, country, or collaboration area" },
        { name: "partner_type", label: "Partner Type", type: "select", options: [
          { label: "Community", value: "community" },
          { label: "Government", value: "government" },
          { label: "NGO", value: "ngo" },
          { label: "Industry", value: "industry" },
          { label: "Academic", value: "academic" },
          { label: "International", value: "international" },
        ] },
        { name: "partnership_level", label: "Partnership Level", type: "select", options: [
          { label: "Strategic", value: "strategic" },
          { label: "Implementing", value: "implementing" },
          { label: "Technical", value: "technical" },
          { label: "Advisory", value: "advisory" },
        ] },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Prospective", value: "prospective" },
        ] },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "partner_type", label: "Partner Type", type: "select", placeholder: "Select type", options: [
          { label: "Community", value: "community" },
          { label: "Government", value: "government" },
          { label: "NGO", value: "ngo" },
          { label: "Industry", value: "industry" },
          { label: "Academic", value: "academic" },
          { label: "International", value: "international" },
        ] },
        { name: "partnership_level", label: "Partnership Level", type: "select", placeholder: "Select level", options: [
          { label: "Strategic", value: "strategic" },
          { label: "Implementing", value: "implementing" },
          { label: "Technical", value: "technical" },
          { label: "Advisory", value: "advisory" },
        ] },
        { name: "collaboration_areas", label: "Collaboration Areas", type: "textarea" },
        { name: "contact_person_name", label: "Contact Person" },
        { name: "email", label: "Email", type: "email" },
        { name: "country", label: "Country" },
        { name: "website", label: "Website", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Prospective", value: "prospective" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ partner_type: "community", partnership_level: "implementing", status: "active" }}
      emptyMessage="No sustainability partners were returned by the research service."
    />
  );
}
