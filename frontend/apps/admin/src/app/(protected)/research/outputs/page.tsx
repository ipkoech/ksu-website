"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchOutputsPage() {
  return (
    <ResearchResourcePage
      title="Research Outputs"
      description="Manage datasets, software, tools, reports, briefs, methodologies, models, and published deliverables."
      queryKey={["research", "outputs"]}
      resource={researchServiceApi.outputs}
      manageScopes={["research.manage_reports", "research.submit_reports", "research:write"]}
      listParams={{ is_active: true }}
      metaFields={["output_type", "access_type", "release_date", "status"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "output_type", label: "Output Type", type: "select", placeholder: "Select output type", options: [
          { label: "Dataset", value: "dataset" },
          { label: "Software", value: "software" },
          { label: "Tool", value: "tool" },
          { label: "Report", value: "report" },
          { label: "Brief", value: "brief" },
          { label: "Guideline", value: "guideline" },
        ] },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "usage_notes", label: "Usage Notes", type: "textarea" },
        { name: "citation", label: "Citation", type: "textarea" },
        { name: "access_type", label: "Access Type", type: "select", placeholder: "Select access", options: [
          { label: "Open", value: "open" },
          { label: "Restricted", value: "restricted" },
          { label: "Request", value: "request" },
          { label: "Proprietary", value: "proprietary" },
        ] },
        { name: "access_url", label: "Access URL", type: "url" },
        { name: "download_url", label: "Download URL", type: "url" },
        { name: "repository_url", label: "Repository URL", type: "url" },
        { name: "doi", label: "DOI" },
        { name: "version", label: "Version" },
        { name: "release_date", label: "Release Date", type: "date" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
          { label: "Deprecated", value: "deprecated" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{
        output_type: "dataset",
        access_type: "open",
        status: "published",
        is_active: true,
      }}
      emptyMessage="No research outputs were returned by the research service."
      importResource="research-outputs"
    />
  );
}
