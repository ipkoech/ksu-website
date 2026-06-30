"use client";

import { useMemo, useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@ksu/ui/components";
import { Link2, MoreVertical, Plus, Search, Unlink } from "lucide-react";
import { researchPartnerRelationshipAdapter } from "@/components/relationships/relationship-adapters";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../_components/research-detail-relationships";

export default function ResearchProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Project"
      description="View public profile fields, project dates, progress, and publication-ready details."
      resource={researchServiceApi.projects}
      backHref="/research/projects"
      publicHrefBase="/projects"
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
      auditResourceTypes={["research_project", "projects", "project"]}
      renderAfter={(record) => <ProjectRelations project={record} />}
    />
  );
}

function ProjectRelations({ project }: { project: ResearchGenericRecord }) {
  const projectId = String(project.id);
  const relationBaseKey = ["research", "projects", projectId] as const;

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="publications"
      tabs={[
        {
          value: "publications",
          label: "Publications",
          content: (
            <ProjectRelationBindingCard
              title="Related Publications"
              addLabel="Add publication"
              relationshipLabel="Publication"
              queryKey={["research", "projects", projectId, "publications"]}
              queryFn={() => researchServiceApi.publications.list({ page: 1, per_page: 6, project_id: projectId })}
              searchPlaceholder="Search publications to attach"
              candidateQueryFn={(search) => researchServiceApi.publications.list({ page: 1, per_page: 20, search: search || undefined })}
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
                candidateQueryFn={(search) => researchServiceApi.funders.list({ page: 1, per_page: 20, search: search || undefined })}
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
                candidateQueryFn={(search) => researchServiceApi.focusAreas.list({ page: 1, per_page: 20, search: search || undefined })}
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
              candidateQueryFn={(search) => eventsApi.listAdmin({ page: 1, per_page: 20, search: search || undefined, include_scope: true })}
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
                queryFn={() => researchServiceApi.outputs.list({ page: 1, per_page: 6, project_id: projectId })}
                searchPlaceholder="Search outputs to attach"
                candidateQueryFn={(search) => researchServiceApi.outputs.list({ page: 1, per_page: 20, search: search || undefined })}
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
                queryFn={() => researchServiceApi.innovations.list({ page: 1, per_page: 6, project_id: projectId })}
                searchPlaceholder="Search innovations to attach"
                candidateQueryFn={(search) => researchServiceApi.innovations.list({ page: 1, per_page: 20, search: search || undefined })}
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
                queryFn={() => researchServiceApi.projectRelations.impactMetrics.list(projectId)}
                emptyLabel="No impact metrics are linked to this project."
              />
              <RelatedRecordsCard
                title="Impact Stories"
                queryKey={["research", "projects", projectId, "impact-stories"]}
                queryFn={() => researchServiceApi.projectRelations.impactStories.list(projectId)}
                emptyLabel="No impact stories are linked to this project."
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
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
                              onClick={() => unbindMutation.mutate(String(record.id))}
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
                      onClick={() => bindMutation.mutate(String(candidate.id))}
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
