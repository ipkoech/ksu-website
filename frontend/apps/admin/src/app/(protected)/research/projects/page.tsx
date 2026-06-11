"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchProject, type ResearchProjectPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function ResearchProjectsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_projects") || hasScope("research:write");

  return (
    <EditableServiceResourcePage<ResearchProject, ResearchProjectPayload>
      title="Research Projects"
      description="Create, edit, and retire research projects from the research service."
      backHref="/research"
      queryKey={["research", "projects"]}
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Project title" },
        { name: "slug", label: "Slug", placeholder: "project-slug" },
        { name: "code", label: "Code", placeholder: "RP_001" },
        { name: "program_id", label: "Research Program", type: "entity", relation: { adapter: "researchProgram", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "pi_id", label: "Principal Investigator", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "project_type", label: "Project Type", type: "select", placeholder: "Select type", options: [
          { label: "Basic", value: "basic" },
          { label: "Applied", value: "applied" },
          { label: "Action", value: "action" },
          { label: "Collaborative", value: "collaborative" },
          { label: "Commissioned", value: "commissioned" },
        ] },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "abstract", label: "Abstract", type: "textarea" },
        { name: "background", label: "Background", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "deliverables", label: "Deliverables", type: "textarea" },
        { name: "budget", label: "Budget", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "grant_id", label: "Grant ID" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Proposal", value: "proposal" },
          { label: "Approved", value: "approved" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Completed", value: "completed" },
          { label: "Suspended", value: "suspended" },
          { label: "Cancelled", value: "cancelled" },
        ] },
        { name: "progress_percentage", label: "Progress %", type: "number" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      list={() => researchServiceApi.projects.list({ page: 1, per_page: 50 })}
      create={(payload) => researchServiceApi.projects.create(payload)}
      update={(id, payload) => researchServiceApi.projects.update(id, payload)}
      delete={(id) => researchServiceApi.projects.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) => [record.code, record.project_type, record.status].filter(Boolean).join(" · ")}
      emptyMessage="No research projects were returned by the research service."
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        code: values.code,
        program_id: values.program_id,
        center_id: values.center_id,
        pi_id: values.pi_id,
        project_type: values.project_type || "applied",
        start_date: values.start_date,
        end_date: values.end_date,
        summary: values.summary,
        abstract: values.abstract,
        background: values.background,
        objectives: values.objectives,
        methodology: values.methodology,
        expected_outcomes: values.expected_outcomes,
        impact: values.impact,
        deliverables: values.deliverables,
        budget: values.budget,
        currency: values.currency || "KES",
        grant_id: values.grant_id,
        cover_image_url: values.cover_image_url,
        status: values.status || "ongoing",
        progress_percentage: values.progress_percentage ?? 0,
        is_active: values.is_active,
        is_featured: values.is_featured,
        is_public: values.is_public,
      })}
    />
  );
}
