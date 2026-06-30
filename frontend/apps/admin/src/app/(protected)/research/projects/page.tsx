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
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";
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
    name: "pi_id",
    label: "Principal Investigator",
    type: "entity" as const,
    relation: { adapter: "person" as const, filters: { status: "active" }, allowClear: true },
  },
  { name: "project_type", label: "Project Type", type: "select" as const, placeholder: "Select type", options: projectTypeOptions },
  { name: "start_date", label: "Start Date", type: "date" as const },
  { name: "end_date", label: "End Date", type: "date" as const },
  { name: "summary", label: "Summary", type: "textarea" as const },
  { name: "abstract", label: "Abstract", type: "textarea" as const },
  { name: "background", label: "Background", type: "textarea" as const },
  { name: "objectives", label: "Objectives", type: "textarea" as const },
  { name: "methodology", label: "Methodology", type: "textarea" as const },
  { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" as const },
  { name: "impact", label: "Impact", type: "textarea" as const },
  { name: "deliverables", label: "Deliverables", type: "textarea" as const },
  { name: "budget", label: "Budget", type: "number" as const },
  { name: "currency", label: "Currency", placeholder: "KES" },
  {
    name: "grant_id",
    label: "Grant",
    type: "entity" as const,
    relation: { adapter: "researchGrant" as const, filters: { is_active: true }, allowClear: true },
  },
  { name: "cover_image_url", label: "Cover Image URL", type: "url" as const },
  { name: "status", label: "Status", type: "select" as const, placeholder: "Select status", options: statusOptions },
  { name: "progress_percentage", label: "Progress %", type: "number" as const },
  { name: "is_active", label: "Active", type: "boolean" as const },
  { name: "is_featured", label: "Featured", type: "boolean" as const },
  { name: "is_public", label: "Public", type: "boolean" as const },
];

const projectColumns: EditableRecordColumn<ResearchProject>[] = [
  {
    key: "title",
    label: "Project Title",
    className: "min-w-[260px]",
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
      <div className="flex flex-col gap-1">
        <Badge variant="outline">{labelize(record.status) || "Unspecified"}</Badge>
        {typeof record.progress_percentage === "number" ? (
          <span className="text-xs text-muted-foreground">{record.progress_percentage}% progress</span>
        ) : null}
      </div>
    ),
  },
  {
    key: "center",
    label: "Center / Program",
    className: "min-w-[220px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.center?.name ?? "No center"}</p>
        <p className="text-xs text-muted-foreground">{record.program?.name ?? "No program"}</p>
      </div>
    ),
  },
  {
    key: "pi",
    label: "Principal Investigator",
    className: "min-w-[190px]",
    render: (record) => <RelationCell id={record.pi_id} adapterKey="person" emptyLabel="No PI assigned" />,
  },
  {
    key: "grant",
    label: "Funding / Grant",
    className: "min-w-[190px]",
    render: (record) => <RelationCell id={record.grant_id} adapterKey="researchGrant" emptyLabel="Unfunded" />,
  },
  {
    key: "dates",
    label: "Start / End",
    render: (record) => (
      <div className="space-y-1 text-sm">
        <p>{formatDate(record.start_date) || "No start"}</p>
        <p className="text-muted-foreground">{formatDate(record.end_date) || "No end"}</p>
      </div>
    ),
  },
  {
    key: "updated",
    label: "Last Updated",
    render: (record) => <span className="text-sm text-muted-foreground">{formatDate(record.updated_at)}</span>,
  },
];

function ProjectMobileRecord(record: ResearchProject, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{record.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {[record.code, record.center?.name, record.program?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">{labelize(record.status) || "Unspecified"}</span>
        <span className="rounded-md border px-2 py-1">{record.grant_id ? "Funded" : "Unfunded"}</span>
        {typeof record.progress_percentage === "number" ? <span className="rounded-md border px-2 py-1">{record.progress_percentage}%</span> : null}
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
      editorMode="sheet"
      renderMobileRecord={ProjectMobileRecord}
      list={(filters) =>
        researchServiceApi.projects.list({
          page: 1,
          per_page: 25,
          fields: [
            "id",
            "title",
            "slug",
            "code",
            "program_id",
            "center_id",
            "pi_id",
            "grant_id",
            "project_type",
            "start_date",
            "end_date",
            "budget",
            "currency",
            "status",
            "progress_percentage",
            "is_public",
            "is_featured",
            "is_active",
            "updated_at",
          ].join(","),
          include: "center:id,name,code;program:id,name,code",
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
          record.center?.name,
          record.program?.name,
          labelize(record.project_type),
          labelize(record.status),
          record.grant_id ? "Funded" : "Unfunded",
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
                label: "Retire",
                variant: "outline",
                payload: { status: "completed", is_active: false },
                successMessage: "Research project retired",
                confirmTitle: `Retire ${record.title}?`,
                confirmDescription: "This marks the project completed and inactive while preserving the record.",
                confirmLabel: "Retire project",
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
      toolbarSlot={
        <>
          <ResearchBulkActions resourceKey="research-projects" />
          <ResearchSectionGuide title="Projects" />
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

function RelationCell({
  id,
  adapterKey,
  emptyLabel,
}: {
  id?: string | null;
  adapterKey: keyof typeof relationshipAdapters;
  emptyLabel: string;
}) {
  const adapter = relationshipAdapters[adapterKey] as RelationshipAdapter;
  const relationQuery = useQuery({
    queryKey: ["research", "projects", "relation", adapterKey, id],
    queryFn: () => adapter.get(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  if (!id) return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  if (relationQuery.isLoading) return <span className="text-sm text-muted-foreground">Loading...</span>;
  const option = relationQuery.data;
  return (
    <div className="space-y-1">
      <p className="font-medium">{option?.label ?? "Related record unavailable"}</p>
      {option?.description ? <p className="text-xs text-muted-foreground">{option.description}</p> : null}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function labelize(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
