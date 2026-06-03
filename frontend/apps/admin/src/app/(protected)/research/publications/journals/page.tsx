"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchJournalsPage() {
  return (
    <ResearchResourcePage
      title="Research Journals"
      description="Manage journals and publication venues used by research publications."
      queryKey={["research", "journals"]}
      resource={researchServiceApi.journals}
      manageScopes={["research.manage_publications", "publications.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "abbreviation", label: "Abbreviation" },
        { name: "publisher", label: "Publisher" },
        { name: "issn", label: "ISSN" },
        { name: "journal_type", label: "Journal Type", placeholder: "academic" },
        { name: "website", label: "Website", type: "url" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ journal_type: "academic" }}
      emptyMessage="No journals were returned by the research service."
      metaFields={["abbreviation", "publisher", "journal_type"]}
    />
  );
}
