"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FolderKanban, UsersRound, WalletCards } from "lucide-react";
import {
  Badge,
} from "@ksu/ui/components";
import {
  EditableServiceResourcePage,
  type EditableListFilter,
  type EditableRecordColumn,
} from "@/components/dashboard/editable-service-resource-page";
import {
  ResearchBulkActions,
  withResearchFieldHelp,
} from "../_components/research-resource-page";
import {
  getResearchGuidance,
  ResearchSectionGuide,
} from "../_components/research-guidance";
import { researchServiceApi, type ResearchProject, type ResearchProjectPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const statusOptions = [
  { label: "Proposal", value: "proposal" },
  { label: "Approved", value: "approved" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Suspended", value: "suspended" },
  { label: "Cancelled", value: "cancelled" },
];

const projectTypeOptions = [
  { label: "Basic", value: "basic" },
  { label: "Applied", value: "applied" },
  { label: "Action", value: "action" },
  { label: "Collaborative", value: "collaborative" },
  { label: "Commissioned", value: "commissioned" },
];

const PROJECT_LIST_FIELDS = "id,title,slug,code,project_type,status,is_active,is_public,is_featured";

const projectListFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search title, code, summary" },
  { name: "status", label: "Status", type: "select", options: statusOptions },
  {
    name: "center_id",
    label: "Research Center",
    type: "entity",
    relation: { adapter: "researchCenter", filters: { is_active: true } },
  },
  {
    name: "farm_id",
    label: "Research Farm / Field Site",
    type: "entity" as const,
    relation: { adapter: "researchFarm" as const, filters: { is_active: true } },
  },
  {
    name: "program_id",
    label: "Program",
    type: "entity",
    relation: { adapter: "researchProgram", filters: { is_active: true } },
  },
  {
    name: "pi_id",
    label: "Principal Investigator",
    type: "entity",
    relation: { adapter: "person", filters: { status: "active" } },
  },
  {
    name: "grant_id",
    label: "Grant",
    type: "entity",
    relation: { adapter: "researchGrant", filters: { is_active: true } },
  },
  {
    name: "has_grant",
    label: "Funding Status",
    type: "select",
    options: [
      { label: "Funded", value: "true" },
      { label: "Unfunded", value: "false" },
    ],
  },
  { name: "start_date_from", label: "Starts After", type: "date" },
  { name: "end_date_to", label: "Ends Before", type: "date" },
  { name: "project_type", label: "Project Type", type: "select", options: projectTypeOptions },
];

const projectFields = [
  { name: "title", label: "Title", required: true, placeholder: "Project title" },
  { name: "slug", label: "Slug", placeholder: "project-slug" },
  { name: "code", label: "Code", placeholder: "RP_001" },
  {
    name: "program_id",
    label: "Research Program",
    type: "entity" as const,
    relation: { adapter: "researchProgram" as const, filters: { is_active: true }, allowClear: true },
  },
  {
    name: "center_id",
    label: "Research Center",
    type: "entity" as const,
    relation: { adapter: "researchCenter" as const, filters: { is_active: true }, allowClear: true },
  },
  {
    name: "farm_id",
    label: "Research Farm / Field Site",
    type: "entity" as const,
    relation: { adapter: "researchFarm" as const, filters: { is_active: true }, allowClear: true },
  },
  {
    name: "pi_id",
    label: "Principal Investigator",
    type: "entity" as const,
    relation: { adapter: "person" as const, filters: { status: "active" }, allowClear: true },
  },
  { name: "project_type", label: "Project Type", type: "select" as const, placeholder: "Select type", options: projectTypeOptions },
  { name: "start_date", label: "Start Date", type: "date" as const },
  { name: "end_date", label: "End Date", type: "date" as const },
  { name: "summary", label: "Summary", type: "textarea" as const, required: true, placeholder: "A concise public overview of the research" },
  { name: "abstract", label: "Abstract", type: "richtext" as const },
  { name: "background", label: "Background", type: "richtext" as const },
  { name: "objectives", label: "Objectives", type: "richtext" as const },
  { name: "methodology", label: "Methodology", type: "richtext" as const },
  { name: "expected_outcomes", label: "Expected Outcomes", type: "richtext" as const },
  { name: "impact", label: "Impact", type: "richtext" as const },
  { name: "deliverables", label: "Deliverables", type: "richtext" as const },
  { name: "budget", label: "Budget", type: "number" as const },
  { name: "currency", label: "Currency", placeholder: "KES" },
  {
    name: "grant_id",
    label: "Grant",
    type: "entity" as const,
    relation: { adapter: "researchGrant" as const, filters: { is_active: true }, allowClear: true },
  },
  {
    name: "cover_image_id",
    label: "Project Cover Image",
    type: "media" as const,
    media: { mediaType: "image", accept: "image/*", uploadEntityType: "research_project", uploadRole: "cover-image", allowUpload: true, isPublic: true },
  },
  {
    name: "gallery_media_ids",
    label: "Project Gallery",
    type: "entity-multi" as const,
    relation: { adapter: "media" as const, filters: { media_type: "image" }, description: "Select public field, laboratory, team, and outcome images." },
  },
  {
    name: "document_media_ids",
    label: "Public Documents",
    type: "entity-multi" as const,
    relation: { adapter: "media" as const, description: "Select proposals, reports, policy briefs, and other public documents." },
  },
  {
    name: "attachment_media_ids",
    label: "Supporting Attachments",
    type: "entity-multi" as const,
    relation: { adapter: "media" as const, description: "Select supplementary files associated with this project." },
  },
  { name: "meta_title", label: "Search Title", placeholder: "Optional search-engine title" },
  { name: "meta_description", label: "Search Description", type: "textarea" as const },
  { name: "status", label: "Status", type: "select" as const, defaultValue: "ongoing", placeholder: "Select status", options: statusOptions },
  { name: "progress_percentage", label: "Progress %", type: "number" as const, defaultValue: 0 },
  { name: "is_active", label: "Active", type: "boolean" as const, defaultValue: true },
  { name: "is_featured", label: "Featured", type: "boolean" as const, defaultValue: false },
  { name: "is_public", label: "Public", type: "boolean" as const, defaultValue: true },
];

const projectColumns: EditableRecordColumn<ResearchProject>[] = [
  {
    key: "title",
    label: "Project Title",
    className: "min-w-[300px]",
    render: (record) => (
      <div className="space-y-1">
        <Link href={record.slug ? `/research/projects/${record.slug}` : "#"} className="font-medium hover:underline">
          {record.title}
        </Link>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.project_type)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (record) => (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{labelize(record.status) || "Unspecified"}</Badge>
        {record.is_active === false ? <Badge variant="secondary">Inactive</Badge> : null}
      </div>
    ),
  },
  {
    key: "visibility",
    label: "Visibility",
    render: (record) => (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={record.is_public ? "default" : "outline"}>{record.is_public ? "Public" : "Internal"}</Badge>
        {record.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
      </div>
    ),
  },
];

function ProjectMobileRecord(record: ResearchProject, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{record.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {[record.code, labelize(record.project_type)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">{labelize(record.status) || "Unspecified"}</span>
        <span className="rounded-md border px-2 py-1">{record.is_public ? "Public" : "Internal"}</span>
        {record.is_featured ? <span className="rounded-md border px-2 py-1">Featured</span> : null}
      </div>
    </div>
  );
}

export default function ResearchProjectsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_projects") || hasScope("research:write");
  const guidance = getResearchGuidance("Projects");

  return (
    <EditableServiceResourcePage<ResearchProject, ResearchProjectPayload>
      title="Research Projects"
      description="Create, edit, retire, and inspect research projects from the research service."
      resourceKey="projects"
      backHref="/research"
      queryKey={["research", "projects"]}
      hideHeader
      tableLayout="compact"
      actionsInMenuOnly
      summarySlot={<ProjectsSummaryStrip />}
      listFilters={projectListFilters}
      recordColumns={projectColumns}
      fields={withResearchFieldHelp(projectFields)}
      validate={(values) => {
        const errors: Record<string, string> = {};
        if (values.start_date && values.end_date && String(values.end_date) < String(values.start_date)) {
          errors.end_date = "End date must be on or after the start date";
        }
        const progress = Number(values.progress_percentage ?? 0);
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
          errors.progress_percentage = "Progress must be between 0 and 100";
        }
        if (values.budget != null && values.budget !== "" && Number(values.budget) < 0) {
          errors.budget = "Budget cannot be negative";
        }
        return errors;
      }}
      editorMode="sheet"
      renderMobileRecord={ProjectMobileRecord}
      list={(filters) =>
        researchServiceApi.projects.list({
          page: 1,
          per_page: 25,
          fields: PROJECT_LIST_FIELDS,
          ...filters,
        })
      }
      defaultSort={{ label: "Recently updated", sort: "updated_at", order: "desc" }}
      sortOptions={[
        { label: "Recently updated", sort: "updated_at", order: "desc" },
        { label: "Oldest updated", sort: "updated_at", order: "asc" },
        { label: "Project title A-Z", sort: "title", order: "asc" },
        { label: "Project title Z-A", sort: "title", order: "desc" },
        { label: "Start date newest", sort: "start_date", order: "desc" },
        { label: "Start date oldest", sort: "start_date", order: "asc" },
      ]}
      create={(payload) => researchServiceApi.projects.create(payload)}
      update={(id, payload) => researchServiceApi.projects.update(id, payload)}
      delete={(id) => researchServiceApi.projects.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) =>
        [
          record.code,
          labelize(record.project_type),
          labelize(record.status),
          record.is_public ? "Public" : "Internal",
          record.is_featured ? "Featured" : null,
        ]
          .filter(Boolean)
          .join(" · ")
      }
      getRecordDetailHref={(record) => record.slug ? `/research/projects/${record.slug}` : null}
      getRecordWorkflowActions={(record) =>
        record.is_active === false || record.status === "completed"
          ? []
          : [
              {
                label: "Mark completed",
                variant: "outline",
                payload: { status: "completed", is_active: false },
                successMessage: "Research project marked completed",
                confirmTitle: `Mark ${record.title} completed?`,
                confirmDescription: "This marks the project completed and inactive while preserving the record.",
                confirmLabel: "Mark completed",
              },
            ]
      }
      emptyMessage="No research projects were returned by the research service."
      emptyState={guidance?.emptyState}
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        code: values.code,
        program_id: values.program_id,
        center_id: values.center_id,
        farm_id: values.farm_id,
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
        cover_image_id: values.cover_image_id,
        gallery_media_ids: values.gallery_media_ids,
        document_media_ids: values.document_media_ids,
        attachment_media_ids: values.attachment_media_ids,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        status: values.status || "ongoing",
        progress_percentage: values.progress_percentage ?? 0,
        is_active: values.is_active,
        is_featured: values.is_featured,
        is_public: values.is_public,
      })}
      toolbarSlot={
        <>
          <ResearchBulkActions resourceKey="research-projects" />
          <ResearchSectionGuide title="Projects" className="sm:ml-auto" />
        </>
      }
    />
  );
}

function ProjectsSummaryStrip() {
  const projectsQuery = useQuery({
    queryKey: ["research", "projects", "summary"],
    queryFn: () =>
      researchServiceApi.projects.list({
        page: 1,
        per_page: 100,
        fields: "id,status,grant_id,pi_id,is_active",
      }),
  });
  const records = projectsQuery.data?.data ?? [];
  const total = projectsQuery.data?.meta?.total ?? records.length;
  const active = records.filter((record) => ["approved", "ongoing"].includes(record.status ?? "") || record.is_active).length;
  const completed = records.filter((record) => record.status === "completed").length;
  const funded = records.filter((record) => Boolean(record.grant_id)).length;
  const withoutPi = records.filter((record) => !record.pi_id).length;

  return (
    <div className="flex flex-wrap gap-2">
      <ProjectMetricCard title="Projects" value={total} icon={<FolderKanban className="h-4 w-4" />} loading={projectsQuery.isLoading} />
      <ProjectMetricCard title="Active" value={active} icon={<CalendarDays className="h-4 w-4" />} loading={projectsQuery.isLoading} />
      <ProjectMetricCard title="Completed" value={completed} icon={<FolderKanban className="h-4 w-4" />} loading={projectsQuery.isLoading} />
      <ProjectMetricCard title="Funded" value={funded} icon={<WalletCards className="h-4 w-4" />} loading={projectsQuery.isLoading} />
      <ProjectMetricCard title="Without PI" value={withoutPi} icon={<UsersRound className="h-4 w-4" />} loading={projectsQuery.isLoading} />
    </div>
  );
}

function ProjectMetricCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <span className="flex size-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        {icon}
      </span>
      <span className="text-muted-foreground">{title}</span>
      <span className="font-semibold">{loading ? "--" : value.toLocaleString()}</span>
    </div>
  );
}

function labelize(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
