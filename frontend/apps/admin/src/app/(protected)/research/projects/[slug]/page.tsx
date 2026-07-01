"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi, researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { Activity, Building2, CalendarDays, Edit3, Eye, EyeOff, Filter, Link2, MoreVertical, Plus, Search, SortAsc, Target, Trash2, Unlink, UsersRound } from "lucide-react";
import { researchPartnerRelationshipAdapter } from "@/components/relationships/relationship-adapters";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { ResearchDetailGuide } from "../../_components/research-guidance";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

type ProjectActionConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  payload?: Record<string, unknown>;
  deleteRecord?: boolean;
};

type ProjectEditForm = {
  title: string;
  code: string;
  project_type: string;
  status: string;
  progress_percentage: string;
};

const PROJECT_TYPE_OPTIONS = [
  { value: "research", label: "Research" },
  { value: "collaborative", label: "Collaborative" },
  { value: "consultancy", label: "Consultancy" },
  { value: "community", label: "Community" },
  { value: "innovation", label: "Innovation" },
];

const PROJECT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "suspended", label: "Suspended" },
];

function renderProjectDetailActions(record: ResearchGenericRecord) {
  return <ProjectDetailActions project={record} />;
}

export default function ResearchProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Project"
      description="View public profile fields, project dates, progress, and publication-ready details."
      resource={researchServiceApi.projects}
      backHref="/research/projects"
      actionsSlot={renderProjectDetailActions}
      showDetailGuide={false}
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes", "deliverables"] },
        { title: "Impact and Funding", fields: ["impact", "budget", "currency"] },
      ]}
      renderAfter={(record) => <ProjectRelations project={record} />}
    />
  );
}

function ProjectDetailActions({ project }: { project: ResearchGenericRecord }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ProjectActionConfirmation | null>(null);
  const [form, setForm] = useState<ProjectEditForm>(() => buildProjectEditForm(project));

  const refreshProject = async () => {
    await queryClient.invalidateQueries({ queryKey: ["research", "detail"] });
    await queryClient.invalidateQueries({ queryKey: ["research", "projects"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => researchServiceApi.projects.update(project.id, payload),
    onSuccess: async () => {
      toast.success("Project updated");
      setEditOpen(false);
      setConfirmation(null);
      await refreshProject();
    },
    onError: () => toast.error("Could not update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => researchServiceApi.projects.delete(project.id),
    onSuccess: async () => {
      toast.success("Project deleted");
      setConfirmation(null);
      await queryClient.invalidateQueries({ queryKey: ["research", "projects"] });
      router.push("/research/projects");
    },
    onError: () => toast.error("Could not delete project"),
  });

  const isBusy = updateMutation.isPending || deleteMutation.isPending;
  const isPublic = Boolean(project.is_public);
  const isActive = project.is_active !== false;

  const submitEdit = () => {
    const progress = Number(form.progress_percentage);
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }
    updateMutation.mutate({
      title: form.title.trim(),
      code: form.code.trim() || null,
      project_type: form.project_type || null,
      status: form.status || null,
      progress_percentage: progress,
    });
  };

  const confirmAction = () => {
    if (!confirmation) return;
    if (confirmation.deleteRecord) {
      deleteMutation.mutate();
      return;
    }
    updateMutation.mutate(confirmation.payload ?? {});
  };

  return (
    <>
      <ResearchDetailGuide title="Research Project" status={project.status} isPublic={project.is_public}>
        <ProjectRelationshipGuideContent />
      </ResearchDetailGuide>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setForm(buildProjectEditForm(project));
          setEditOpen(true);
        }}
      >
        <Edit3 className="mr-2 h-4 w-4" />
        Edit Project
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            <MoreVertical className="mr-2 h-4 w-4" />
            More actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Project actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              setConfirmation({
                title: isPublic ? "Unpublish project?" : "Publish project?",
                description: isPublic
                  ? "This project will no longer be visible on the public research site."
                  : "This project will become visible on the public research site.",
                confirmText: isPublic ? "Unpublish" : "Publish",
                payload: { is_public: !isPublic },
              })
            }
          >
            {isPublic ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {isPublic ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setConfirmation({
                title: isActive ? "Deactivate project?" : "Activate project?",
                description: isActive
                  ? "The project will remain in the system but will be marked inactive."
                  : "The project will be available again for active research workflows.",
                confirmText: isActive ? "Deactivate" : "Activate",
                payload: { is_active: !isActive },
              })
            }
          >
            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          {project.status !== "completed" ? (
            <DropdownMenuItem
              onClick={() =>
                setConfirmation({
                  title: "Mark project completed?",
                  description: "This will update the project status to completed. Use Deactivate separately if the project should no longer appear in active workflows.",
                  confirmText: "Mark completed",
                  payload: { status: "completed" },
                })
              }
            >
              Mark completed
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() =>
              setConfirmation({
                title: "Delete project?",
                description: "This removes the project record from the admin system. This action cannot be undone.",
                confirmText: "Delete project",
                variant: "destructive",
                deleteRecord: true,
              })
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={(open) => !isBusy && setEditOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update the key project fields shown on this detail page.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              <span>Title</span>
              <Input value={form.title} disabled={isBusy} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Code</span>
              <Input value={form.code} disabled={isBusy} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Progress</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress_percentage}
                disabled={isBusy}
                onChange={(event) => setForm((current) => ({ ...current, progress_percentage: event.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Type</span>
              <Select value={form.project_type || "none"} disabled={isBusy} onValueChange={(value) => setForm((current) => ({ ...current, project_type: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No type</SelectItem>
                    {PROJECT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Status</span>
              <Select value={form.status || "none"} disabled={isBusy} onValueChange={(value) => setForm((current) => ({ ...current, status: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No status</SelectItem>
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isBusy} onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isBusy} onClick={submitEdit}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !isBusy) setConfirmation(null);
        }}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant ?? "default"}
        isLoading={isBusy}
        onConfirm={confirmAction}
      />
    </>
  );
}

function buildProjectEditForm(project: ResearchGenericRecord): ProjectEditForm {
  return {
    title: String(project.title ?? ""),
    code: String(project.code ?? ""),
    project_type: String(project.project_type ?? ""),
    status: String(project.status ?? ""),
    progress_percentage: String(project.progress_percentage ?? 0),
  };
}

function ProjectRelations({ project }: { project: ResearchGenericRecord }) {
  const projectId = String(project.id);
  const relationBaseKey = ["research", "projects", projectId] as const;

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="relationships"
      tabs={[
        {
          value: "relationships",
          label: "Relationships",
          content: <ProjectRelationshipWorkspace projectId={projectId} relationBaseKey={relationBaseKey} />,
        },
        {
          value: "publications",
          label: "Publications",
          content: (
            <ProjectRelationBindingCard
              title="Related Publications"
              addLabel="Add publication"
              relationshipLabel="Publication"
              queryKey={["research", "projects", projectId, "publications"]}
              queryFn={() => researchServiceApi.publications.list({ page: 1, per_page: 6, project_id: projectId, fields: "id,title,publication_type,status,year" })}
              searchPlaceholder="Search publications to attach"
              candidateQueryFn={(search) => researchServiceApi.publications.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,title,publication_type,status,year,project_id" })}
              bindRecord={(recordId) => researchServiceApi.publications.update(recordId, { project_id: projectId })}
              unbindRecord={(recordId) => researchServiceApi.publications.update(recordId, { project_id: null })}
              invalidateKeys={[relationBaseKey]}
              emptyLabel="No publications are linked to this project."
            />
          ),
        },
        {
          value: "grants",
          label: "Grants",
          content: (
            <RelatedRecordsGrid>
              <ProjectRelationBindingCard
                title="Funders"
                addLabel="Add funder"
                relationshipLabel="Funder"
                queryKey={["research", "projects", projectId, "funders"]}
                queryFn={() => researchServiceApi.projectRelations.funders.list(projectId)}
                searchPlaceholder="Search funders to attach"
                candidateQueryFn={(search) => researchServiceApi.funders.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,name,code,funder_type,status" })}
                bindRecord={(recordId) => researchServiceApi.projectRelations.funders.add(projectId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.projectRelations.funders.remove(projectId, recordId)}
                invalidateKeys={[relationBaseKey]}
                emptyLabel="No funders are linked to this project."
              />
              <RelatedRecordsCard
                title="Grant Reports"
                queryKey={["research", "projects", projectId, "grant-reports"]}
                queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 6, project_id: projectId })}
                emptyLabel="No grant reports are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "partners",
          label: "Partners",
          content: (
            <RelatedRecordsGrid>
              <ProjectRelationBindingCard
                title="Partners"
                addLabel="Add partner"
                relationshipLabel="Partner"
                queryKey={["research", "projects", projectId, "partners"]}
                queryFn={() => researchServiceApi.projectRelations.partners.list(projectId)}
                searchPlaceholder="Search partners to attach"
                candidateSearch={(search) => researchPartnerRelationshipAdapter.search({ search, limit: 20 })}
                bindRecord={(recordId) => researchServiceApi.projectRelations.partners.add(projectId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.projectRelations.partners.remove(projectId, recordId)}
                invalidateKeys={[relationBaseKey]}
                emptyLabel="No partners are linked to this project."
              />
              <ProjectRelationBindingCard
                title="Focus Areas"
                addLabel="Add focus area"
                relationshipLabel="Focus Area"
                queryKey={["research", "projects", projectId, "focus-areas"]}
                queryFn={() => researchServiceApi.projectRelations.focusAreas.list(projectId)}
                searchPlaceholder="Search focus areas to attach"
                candidateQueryFn={(search) => researchServiceApi.focusAreas.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,name,code,status" })}
                bindRecord={(recordId) => researchServiceApi.projectRelations.focusAreas.add(projectId, recordId)}
                unbindRecord={(recordId) => researchServiceApi.projectRelations.focusAreas.remove(projectId, recordId)}
                invalidateKeys={[relationBaseKey]}
                emptyLabel="No focus areas are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "activities",
          label: "Activities",
          content: (
            <ProjectRelationBindingCard
              title="Project Activities"
              addLabel="Add activity"
              relationshipLabel="Activity"
              queryKey={["research", "projects", projectId, "activities"]}
              queryFn={() => researchServiceApi.projectRelations.activities.list(projectId)}
              searchPlaceholder="Search activities to attach"
              candidateQueryFn={(search) => eventsApi.listAdmin({ page: 1, per_page: 20, search: search || undefined, include_scope: true, fields: "id,title,event_type,status,start_date,scope_type,scope_id" })}
              bindRecord={(recordId) => eventsApi.update(recordId, { scope_type: "research_project", scope_id: projectId })}
              unbindRecord={(recordId) => eventsApi.update(recordId, { scope_type: null, scope_id: null })}
              invalidateKeys={[relationBaseKey, ["events"]]}
              emptyLabel="No research-scoped activities are linked to this project."
            />
          ),
        },
        {
          value: "outputs",
          label: "Outputs",
          content: (
            <RelatedRecordsGrid>
              <ProjectRelationBindingCard
                title="Research Outputs"
                addLabel="Add output"
                relationshipLabel="Output"
                queryKey={["research", "projects", projectId, "outputs"]}
                queryFn={() => researchServiceApi.outputs.list({ page: 1, per_page: 6, project_id: projectId, fields: "id,title,output_type,status,access_type" })}
                searchPlaceholder="Search outputs to attach"
                candidateQueryFn={(search) => researchServiceApi.outputs.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,title,output_type,status,access_type,project_id" })}
                bindRecord={(recordId) => researchServiceApi.outputs.update(recordId, { project_id: projectId })}
                unbindRecord={(recordId) => researchServiceApi.outputs.update(recordId, { project_id: null })}
                invalidateKeys={[relationBaseKey]}
                emptyLabel="No outputs are linked to this project."
              />
              <ProjectRelationBindingCard
                title="Innovations"
                addLabel="Add innovation"
                relationshipLabel="Innovation"
                queryKey={["research", "projects", projectId, "innovations"]}
                queryFn={() => researchServiceApi.innovations.list({ page: 1, per_page: 6, project_id: projectId, fields: "id,title,innovation_type,status,development_stage" })}
                searchPlaceholder="Search innovations to attach"
                candidateQueryFn={(search) => researchServiceApi.innovations.list({ page: 1, per_page: 20, search: search || undefined, fields: "id,title,innovation_type,status,development_stage,project_id" })}
                bindRecord={(recordId) => researchServiceApi.innovations.update(recordId, { project_id: projectId })}
                unbindRecord={(recordId) => researchServiceApi.innovations.update(recordId, { project_id: null })}
                invalidateKeys={[relationBaseKey]}
                emptyLabel="No innovations are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Impact Metrics"
                queryKey={["research", "projects", projectId, "impact-metrics"]}
                queryFn={() => researchServiceApi.impactMetrics.list({ page: 1, per_page: 6, project_id: projectId, fields: "id,name,metric_type,category,value,unit,reporting_year" })}
                emptyLabel="No impact metrics are linked to this project."
              />
              <RelatedRecordsCard
                title="Impact Stories"
                queryKey={["research", "projects", projectId, "impact-stories"]}
                queryFn={() => researchServiceApi.stories.list({ page: 1, per_page: 6, project_id: projectId, fields: "id,title,story_type,story_date,status" })}
                emptyLabel="No impact stories are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}

type RelationshipKind = "partners" | "funders" | "focusAreas" | "publications" | "outputs" | "impactMetrics" | "activities";

type RelationshipConfig = {
  key: RelationshipKind;
  label: string;
  relationship: string;
  icon: typeof UsersRound;
  linkedQueryKey: readonly unknown[];
  linkedQueryFn: () => Promise<{ data?: ResearchGenericRecord[] }>;
  candidateQueryFn?: (search: string) => Promise<{ data?: ResearchGenericRecord[] }>;
  candidateSearch?: (search: string) => Promise<Array<{ id: string; label: string; description?: string; raw?: unknown }>>;
  bindRecord?: (recordId: string) => Promise<unknown>;
  unbindRecord?: (recordId: string) => Promise<unknown>;
};

type RelationshipConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  onConfirm: () => void;
};

function ProjectRelationshipWorkspace({
  projectId,
  relationBaseKey,
}: {
  projectId: string;
  relationBaseKey: readonly unknown[];
}) {
  const queryClient = useQueryClient();
  const [activeKind, setActiveKind] = useState<RelationshipKind>("partners");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<RelationshipConfirmation | null>(null);

  const configs = useMemo<RelationshipConfig[]>(() => [
    {
      key: "partners",
      label: "Partners",
      relationship: "Partner",
      icon: UsersRound,
      linkedQueryKey: ["research", "projects", projectId, "partners"],
      linkedQueryFn: () => researchServiceApi.projectRelations.partners.list(projectId),
      candidateSearch: (term) => researchPartnerRelationshipAdapter.search({ search: term, limit: 20 }),
      bindRecord: (recordId) => researchServiceApi.projectRelations.partners.add(projectId, recordId),
      unbindRecord: (recordId) => researchServiceApi.projectRelations.partners.remove(projectId, recordId),
    },
    {
      key: "funders",
      label: "Funders",
      relationship: "Funder",
      icon: Building2,
      linkedQueryKey: ["research", "projects", projectId, "funders"],
      linkedQueryFn: () => researchServiceApi.projectRelations.funders.list(projectId),
      candidateQueryFn: (term) => researchServiceApi.funders.list({ page: 1, per_page: 20, search: term || undefined, fields: "id,name,code,funder_type,status" }),
      bindRecord: (recordId) => researchServiceApi.projectRelations.funders.add(projectId, recordId),
      unbindRecord: (recordId) => researchServiceApi.projectRelations.funders.remove(projectId, recordId),
    },
    {
      key: "focusAreas",
      label: "Focus Areas",
      relationship: "Focus Area",
      icon: Target,
      linkedQueryKey: ["research", "projects", projectId, "focus-areas"],
      linkedQueryFn: () => researchServiceApi.projectRelations.focusAreas.list(projectId),
      candidateQueryFn: (term) => researchServiceApi.focusAreas.list({ page: 1, per_page: 20, search: term || undefined, fields: "id,name,code,status" }),
      bindRecord: (recordId) => researchServiceApi.projectRelations.focusAreas.add(projectId, recordId),
      unbindRecord: (recordId) => researchServiceApi.projectRelations.focusAreas.remove(projectId, recordId),
    },
    {
      key: "publications",
      label: "Publications",
      relationship: "Publication",
      icon: Link2,
      linkedQueryKey: ["research", "projects", projectId, "publications"],
      linkedQueryFn: () => researchServiceApi.publications.list({ page: 1, per_page: 20, project_id: projectId, fields: "id,title,publication_type,status,year" }),
      candidateQueryFn: (term) => researchServiceApi.publications.list({ page: 1, per_page: 20, search: term || undefined, fields: "id,title,publication_type,status,year,project_id" }),
      bindRecord: (recordId) => researchServiceApi.publications.update(recordId, { project_id: projectId }),
      unbindRecord: (recordId) => researchServiceApi.publications.update(recordId, { project_id: null }),
    },
    {
      key: "outputs",
      label: "Outputs",
      relationship: "Output",
      icon: Link2,
      linkedQueryKey: ["research", "projects", projectId, "outputs"],
      linkedQueryFn: () => researchServiceApi.outputs.list({ page: 1, per_page: 20, project_id: projectId, fields: "id,title,output_type,status,access_type" }),
      candidateQueryFn: (term) => researchServiceApi.outputs.list({ page: 1, per_page: 20, search: term || undefined, fields: "id,title,output_type,status,access_type,project_id" }),
      bindRecord: (recordId) => researchServiceApi.outputs.update(recordId, { project_id: projectId }),
      unbindRecord: (recordId) => researchServiceApi.outputs.update(recordId, { project_id: null }),
    },
    {
      key: "impactMetrics",
      label: "Impact Metrics",
      relationship: "Impact Metric",
      icon: Activity,
      linkedQueryKey: ["research", "projects", projectId, "impact-metrics"],
      linkedQueryFn: () => researchServiceApi.impactMetrics.list({ page: 1, per_page: 20, project_id: projectId, fields: "id,name,metric_type,category,value,unit,reporting_year" }),
      candidateQueryFn: (term) => researchServiceApi.impactMetrics.list({ page: 1, per_page: 20, search: term || undefined, fields: "id,name,metric_type,category,value,unit,reporting_year,project_id" }),
    },
    {
      key: "activities",
      label: "Activities",
      relationship: "Activity",
      icon: CalendarDays,
      linkedQueryKey: ["research", "projects", projectId, "activities"],
      linkedQueryFn: () => researchServiceApi.projectRelations.activities.list(projectId),
      candidateQueryFn: (term) => eventsApi.listAdmin({ page: 1, per_page: 20, search: term || undefined, include_scope: true, fields: "id,title,event_type,status,start_date,scope_type,scope_id" }),
      bindRecord: (recordId) => eventsApi.update(recordId, { scope_type: "research_project", scope_id: projectId }),
      unbindRecord: (recordId) => eventsApi.update(recordId, { scope_type: null, scope_id: null }),
    },
  ], [projectId]);

  const active = configs.find((config) => config.key === activeKind) ?? configs[0];
  const linkedQuery = useQuery({ queryKey: active.linkedQueryKey, queryFn: active.linkedQueryFn });
  const linkedRecords = useMemo(() => linkedQuery.data?.data ?? [], [linkedQuery.data]);
  const linkedIds = useMemo(() => new Set(linkedRecords.map((record) => String(record.id))), [linkedRecords]);
  const candidatesQuery = useQuery({
    queryKey: [...active.linkedQueryKey, "available", search],
    queryFn: async () => {
      if (active.candidateSearch) return active.candidateSearch(search);
      const response = await active.candidateQueryFn?.(search);
      return (response?.data ?? []).map(recordToOption);
    },
    enabled: Boolean(active.candidateQueryFn || active.candidateSearch),
  });
  const candidates = (candidatesQuery.data ?? []).filter((candidate) => !linkedIds.has(String(candidate.id)));

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: active.linkedQueryKey }),
      queryClient.invalidateQueries({ queryKey: relationBaseKey }),
    ]);
  };
  const bindMutation = useMutation({
    mutationFn: async (recordId: string) => active.bindRecord?.(recordId),
    onSuccess: async () => {
      setSelected([]);
      await invalidate();
      toast.success(`${active.relationship} linked`);
    },
    onError: () => toast.error(`Failed to link ${active.relationship.toLowerCase()}`),
  });
  const unbindMutation = useMutation({
    mutationFn: async (recordId: string) => active.unbindRecord?.(recordId),
    onSuccess: async () => {
      await invalidate();
      toast.success(`${active.relationship} unbound`);
    },
    onError: () => toast.error(`Failed to unbind ${active.relationship.toLowerCase()}`),
  });

  const bindSelected = () => {
    for (const id of selected) bindMutation.mutate(id);
  };
  const requestRelationshipConfirmation = (nextConfirmation: RelationshipConfirmation) => {
    setConfirmation(nextConfirmation);
  };
  const requestBindConfirmation = (id: string, label: string) => {
    requestRelationshipConfirmation({
      title: `Bind ${active.relationship.toLowerCase()}`,
      description: `Bind "${label}" to this project as ${active.relationship.toLowerCase()}?`,
      confirmText: "Bind",
      onConfirm: () => bindMutation.mutate(id),
    });
  };
  const requestBindSelectedConfirmation = () => {
    requestRelationshipConfirmation({
      title: `Bind selected ${active.label.toLowerCase()}`,
      description: `Bind ${selected.length} selected ${active.label.toLowerCase()} to this project?`,
      confirmText: "Bind selected",
      onConfirm: bindSelected,
    });
  };
  const requestUnbindConfirmation = (id: string, label: string) => {
    requestRelationshipConfirmation({
      title: `Unbind ${active.relationship.toLowerCase()}`,
      description: `Remove the relationship between this project and "${label}"? The related record itself will not be deleted.`,
      confirmText: "Unbind",
      variant: "destructive",
      onConfirm: () => unbindMutation.mutate(id),
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Relationship mapping and binding</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {configs.map((config) => {
              const Icon = config.icon;
              return (
                <Button
                  key={config.key}
                  type="button"
                  size="sm"
                  variant={active.key === config.key ? "default" : "outline"}
                  onClick={() => {
                    setActiveKind(config.key);
                    setSelected([]);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search relationships" className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button type="button" variant="outline" size="sm">
              <SortAsc className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <RelationshipTable
            title="Linked relationships"
            count={linkedRecords.length}
            records={linkedRecords.map((record) => ({ id: String(record.id), label: recordTitle(record), description: recordMeta(record, ["status", "code", "type", "event_type", "publication_type", "output_type"]), relationship: active.relationship }))}
            isLoading={linkedQuery.isLoading}
            emptyLabel={`No ${active.label.toLowerCase()} are linked.`}
            actionLabel="Unbind"
            onAction={active.unbindRecord ? requestUnbindConfirmation : undefined}
            actionPending={unbindMutation.isPending}
          />
          <RelationshipCandidateTable
            title="Available to bind"
            count={candidates.length}
            candidates={candidates}
            selected={selected}
            setSelected={setSelected}
            relationship={active.relationship}
            canBind={Boolean(active.bindRecord)}
            isLoading={candidatesQuery.isLoading}
            onBind={requestBindConfirmation}
            onBindSelected={requestBindSelectedConfirmation}
            actionPending={bindMutation.isPending}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {configs.slice(0, 4).map((config) => (
            <RelationshipMetricCard key={config.key} config={config} />
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm relationship change"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={bindMutation.isPending || unbindMutation.isPending}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
      />
    </>
  );
}

function RelationshipTable({
  title,
  count,
  records,
  isLoading,
  emptyLabel,
  actionLabel,
  onAction,
  actionPending,
}: {
  title: string;
  count: number;
  records: Array<{ id: string; label: string; description?: string; relationship: string }>;
  isLoading: boolean;
  emptyLabel: string;
  actionLabel: string;
  onAction?: (id: string, label: string) => void;
  actionPending: boolean;
}) {
  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {title}
          <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[11px]">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(0,1fr)_120px_80px_36px] gap-3 border-b px-3 py-2 text-[11px] font-medium text-muted-foreground">
          <span>Related record</span>
          <span>Relationship</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading linked relationships...</p>
        ) : records.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="max-h-[290px] overflow-y-auto">
            {records.map((record) => (
              <div key={record.id} className="grid grid-cols-[minmax(0,1fr)_120px_80px_36px] items-center gap-3 border-b px-3 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{record.label}</p>
                  {record.description ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.description}</p> : null}
                </div>
                <span className="text-xs text-muted-foreground">{record.relationship}</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Active
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Relationship</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem disabled>Change relationship</DropdownMenuItem>
                    {onAction ? (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={actionPending}
                        onClick={() => onAction(record.id, record.label)}
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        {actionLabel}
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RelationshipCandidateTable({
  title,
  count,
  candidates,
  selected,
  setSelected,
  relationship,
  canBind,
  isLoading,
  onBind,
  onBindSelected,
  actionPending,
}: {
  title: string;
  count: number;
  candidates: Array<{ id: string; label: string; description?: string }>;
  selected: string[];
  setSelected: (next: string[]) => void;
  relationship: string;
  canBind: boolean;
  isLoading: boolean;
  onBind: (id: string, label: string) => void;
  onBindSelected: () => void;
  actionPending: boolean;
}) {
  const toggle = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {title}
          <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[11px]">{count}</Badge>
        </CardTitle>
        <Button type="button" size="sm" disabled={!canBind || selected.length === 0 || actionPending} onClick={onBindSelected}>
          <Link2 className="mr-2 h-4 w-4" />
          Bind selected
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[24px_minmax(0,1fr)_110px_80px] gap-3 border-b px-3 py-2 text-[11px] font-medium text-muted-foreground">
          <span />
          <span>Related record</span>
          <span>Relationship</span>
          <span className="text-right">Actions</span>
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading available records...</p>
        ) : candidates.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No available records to bind.</p>
        ) : (
          <div className="max-h-[290px] overflow-y-auto">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="grid grid-cols-[24px_minmax(0,1fr)_110px_80px] items-center gap-3 border-b px-3 py-3 last:border-b-0">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={selected.includes(candidate.id)}
                  onChange={() => toggle(candidate.id)}
                  disabled={!canBind}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{candidate.label}</p>
                  {candidate.description ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{candidate.description}</p> : null}
                </div>
                <span className="text-xs text-muted-foreground">{relationship}</span>
                <Button type="button" size="sm" variant="outline" disabled={!canBind || actionPending} onClick={() => onBind(candidate.id, candidate.label)}>
                  Bind
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RelationshipMetricCard({ config }: { config: RelationshipConfig }) {
  const linked = useQuery({ queryKey: config.linkedQueryKey, queryFn: config.linkedQueryFn });
  const available = useQuery({
    queryKey: [...config.linkedQueryKey, "metric", "available"],
    queryFn: async () => {
      if (config.candidateSearch) return config.candidateSearch("");
      const response = await config.candidateQueryFn?.("");
      return (response?.data ?? []).map(recordToOption);
    },
    enabled: Boolean(config.candidateSearch || config.candidateQueryFn),
  });
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {config.label}
        </div>
        <div className="mt-3 text-2xl font-semibold">{linked.data?.data?.length ?? 0}</div>
        <p className="text-xs text-muted-foreground">linked</p>
        <div className="mt-3 border-t pt-3 text-sm">
          <span className="font-medium">{available.data?.length ?? 0}</span>
          <span className="ml-2 text-xs text-muted-foreground">available to bind</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectRelationshipGuideContent() {
  return (
    <div className="space-y-4 border-t pt-5">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Relationship mapping</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Map this project to existing records in the system to build connections and enable reporting.
        </p>
      </div>
      {[
        ["1", "Choose a relationship type", "Select the type of relationship that best describes the connection."],
        ["2", "Bind existing records", "Search and select existing records to link to this project."],
        ["3", "Review visibility", "Set the appropriate visibility for each relationship."],
        ["4", "Save mapping", "Bind the relationship to keep your project data connected and up to date."],
      ].map(([step, title, description]) => (
        <div key={step} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{step}</span>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
      <div className="rounded-md border bg-background p-3 text-center text-xs">
        <p className="font-medium">Project</p>
        <p className="mt-1 text-muted-foreground">Current project</p>
        <div className="my-2 text-muted-foreground">↓</div>
        <div className="rounded-md border p-2">
          <p className="font-medium">Relationship Type</p>
          <p className="text-muted-foreground">Partner, Funder, Activity</p>
        </div>
        <div className="my-2 text-muted-foreground">↓</div>
        <div className="rounded-md border p-2">
          <p className="font-medium">Related Record</p>
          <p className="text-muted-foreground">Existing record in the system</p>
        </div>
      </div>
    </div>
  );
}

type ProjectRelationBindingCardProps = {
  title: string;
  addLabel: string;
  relationshipLabel: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data?: ResearchGenericRecord[] }>;
  candidateQueryFn?: (search: string) => Promise<{ data?: ResearchGenericRecord[] }>;
  candidateSearch?: (search: string) => Promise<Array<{ id: string; label: string; description?: string }>>;
  bindRecord: (recordId: string) => Promise<unknown>;
  unbindRecord?: (recordId: string) => Promise<unknown>;
  invalidateKeys?: Array<readonly unknown[]>;
  emptyLabel: string;
  searchPlaceholder: string;
  metaFields?: string[];
};

function ProjectRelationBindingCard({
  title,
  addLabel,
  relationshipLabel,
  queryKey,
  queryFn,
  candidateQueryFn,
  candidateSearch,
  bindRecord,
  unbindRecord,
  invalidateKeys = [],
  emptyLabel,
  searchPlaceholder,
  metaFields = ["status", "updated_at"],
}: ProjectRelationBindingCardProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState<RelationshipConfirmation | null>(null);
  const linkedQuery = useQuery({ queryKey, queryFn });
  const linkedRecords = useMemo(() => linkedQuery.data?.data ?? [], [linkedQuery.data]);
  const linkedIds = useMemo(() => new Set(linkedRecords.map((record) => String(record.id))), [linkedRecords]);

  const candidatesQuery = useQuery({
    queryKey: [...queryKey, "candidates", search],
    queryFn: async () => {
      if (candidateSearch) {
        return candidateSearch(search);
      }
      const response = await candidateQueryFn?.(search);
      return (response?.data ?? []).map(recordToOption);
    },
    enabled: dialogOpen && (Boolean(candidateSearch) || Boolean(candidateQueryFn)),
  });
  const candidates = (candidatesQuery.data ?? []).filter((candidate) => !linkedIds.has(String(candidate.id)));

  const invalidate = async () => {
    const keys = [queryKey, ...invalidateKeys];
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  const bindMutation = useMutation({
    mutationFn: bindRecord,
    onSuccess: async () => {
      await invalidate();
      toast.success(`${relationshipLabel} attached`);
    },
    onError: () => toast.error(`Failed to attach ${relationshipLabel.toLowerCase()}`),
  });

  const unbindMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!unbindRecord) return;
      await unbindRecord(recordId);
    },
    onSuccess: async () => {
      await invalidate();
      toast.success(`${relationshipLabel} detached`);
    },
    onError: () => toast.error(`Failed to detach ${relationshipLabel.toLowerCase()}`),
  });
  const requestRelationshipConfirmation = (nextConfirmation: RelationshipConfirmation) => {
    setConfirmation(nextConfirmation);
  };
  const requestBindConfirmation = (id: string, label: string) => {
    requestRelationshipConfirmation({
      title: `Bind ${relationshipLabel.toLowerCase()}`,
      description: `Bind "${label}" to this project as ${relationshipLabel.toLowerCase()}?`,
      confirmText: "Bind",
      onConfirm: () => bindMutation.mutate(id),
    });
  };
  const requestUnbindConfirmation = (id: string, label: string) => {
    requestRelationshipConfirmation({
      title: `Unbind ${relationshipLabel.toLowerCase()}`,
      description: `Remove the relationship between this project and "${label}"? The related record itself will not be deleted.`,
      confirmText: "Unbind",
      variant: "destructive",
      onConfirm: () => unbindMutation.mutate(id),
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {linkedRecords.length} linked {linkedRecords.length === 1 ? "record" : "records"}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        </CardHeader>
        <CardContent>
          {linkedQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading linked records...</p>
          ) : linkedQuery.isError ? (
            <p className="text-sm text-destructive">Unable to load linked records.</p>
          ) : linkedRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="divide-y">
                {linkedRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{recordTitle(record)}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {recordMeta(record, metaFields) || relationshipLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        Linked
                      </Badge>
                      {unbindRecord ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Relationship</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={unbindMutation.isPending}
                              onClick={() => requestUnbindConfirmation(String(record.id), recordTitle(record))}
                            >
                              <Unlink className="mr-2 h-4 w-4" />
                              Unbind
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{addLabel}</DialogTitle>
            <DialogDescription>
              Search existing {relationshipLabel.toLowerCase()} records and bind them to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border">
            {candidatesQuery.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Searching records...</p>
            ) : candidatesQuery.isError ? (
              <p className="p-4 text-sm text-destructive">Unable to search records.</p>
            ) : candidates.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No available records to bind.</p>
            ) : (
              <div className="divide-y">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{candidate.label}</p>
                      {candidate.description ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{candidate.description}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bindMutation.isPending}
                      onClick={() => requestBindConfirmation(String(candidate.id), candidate.label)}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Bind
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm relationship change"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={bindMutation.isPending || unbindMutation.isPending}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
      />
    </>
  );
}

function recordToOption(record: ResearchGenericRecord) {
  return {
    id: String(record.id),
    label: recordTitle(record),
    description: recordMeta(record, ["code", "status", "type", "project_type", "output_type", "publication_type", "event_type"]),
  };
}

function recordTitle(record: ResearchGenericRecord) {
  return String(record.title ?? record.name ?? record.display_name ?? record.organization_name ?? record.code ?? "Untitled record");
}

function recordMeta(record: ResearchGenericRecord, fields: string[]) {
  return fields
    .map((field) => record[field])
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value).replace(/_/g, " "))
    .join(" · ");
}
