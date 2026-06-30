"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, CheckCircle2, Download, FileUp, Play, Upload } from "lucide-react";
import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordColumn,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ksu/ui/components";
import {
  auditLogsApi,
  importsApi,
  researchServiceApi,
  useImportJob,
  useImportResource,
  usePreviewImport,
  useStartImportCommit,
  type ImportCommitResult,
  type ImportPreview,
  type ImportPreviewRow,
  type ResearchGenericPayload,
  type ResearchGenericRecord,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getResearchFieldHelp,
  getResearchGuidance,
  ResearchSectionGuide,
} from "./research-guidance";

type ResourceApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => Promise<{
    data?: Record<string, any>[];
    meta?: { page?: number; per_page?: number; total?: number; pages?: number; total_pages?: number };
  }>;
  create: (data: any) => Promise<unknown>;
  update: (id: string, data: any) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
};

interface ResearchResourcePageProps {
  title: string;
  description: string;
  queryKey: readonly unknown[];
  resource: ResourceApi;
  fields: EditableField[];
  manageScopes?: string[];
  emptyMessage: string;
  defaults?: ResearchGenericPayload;
  listParams?: Record<string, string | number | boolean | undefined>;
  listFilters?: EditableListFilter[];
  recordColumns?: Array<EditableRecordColumn<ResearchGenericRecord>>;
  summarySlot?: ReactNode;
  metaFields?: string[];
  detailBaseHref?: string;
  detailHref?: (record: ResearchGenericRecord) => string | null | undefined;
  getRecordWorkflowActions?: (
    record: ResearchGenericRecord,
  ) => Array<EditableRecordWorkflowAction<ResearchGenericRecord, ResearchGenericPayload>>;
  importResource?: string;
  exportResource?: string;
  auditServiceName?: string;
  auditResourceType?: string;
  editorMode?: "dialog" | "sheet" | "auto";
  renderMobileRecord?: (record: ResearchGenericRecord, actions: ReactNode) => ReactNode;
  buildPayload?: (
    values: ResearchGenericPayload,
    editingRecord?: ResearchGenericRecord | null,
  ) => ResearchGenericPayload;
}

const FILTERABLE_RELATIONS: Record<string, EditableListFilter["relation"]> = {
  center_id: { adapter: "researchCenter", filters: { is_active: true } },
  project_id: { adapter: "researchProject", filters: { is_active: true } },
  grant_id: { adapter: "researchGrant", filters: { is_active: true } },
  donor_id: { adapter: "researchDonor", filters: { is_active: true } },
  program_id: { adapter: "researchProgram", filters: { is_active: true } },
};

const FILTERABLE_BOOLEAN_FIELDS = new Set(["is_active", "is_featured", "is_public", "is_open_access", "is_required"]);

function deriveListFilters(fields: EditableField[]) {
  const filters: EditableListFilter[] = [];

  for (const field of fields) {
    if (field.type === "select") {
      filters.push({
        name: field.name,
        label: field.label,
        type: "select",
        options: field.options,
        placeholder: field.placeholder,
      });
      continue;
    }

    if (field.type === "entity" && FILTERABLE_RELATIONS[field.name]) {
      filters.push({
        name: field.name,
        label: field.label,
        type: "entity",
        relation: FILTERABLE_RELATIONS[field.name],
      });
      continue;
    }

    if (field.type === "boolean" && FILTERABLE_BOOLEAN_FIELDS.has(field.name)) {
      filters.push({
        name: field.name,
        label: field.label,
        type: "boolean",
      });
    }
  }

  return filters;
}

function recordTitle(record: ResearchGenericRecord) {
  return record.title ?? record.name ?? record.slug ?? record.code ?? record.id;
}

function labelValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
}

function recordMeta(record: ResearchGenericRecord, fields: string[]) {
  return fields
    .map((field) => labelValue(record[field]))
    .concat(record.is_active === false ? ["Inactive"] : [])
    .filter(Boolean)
    .join(" · ");
}

function formatAuditLabel(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function deriveAuditResourceType({
  auditResourceType,
  importResource,
  exportResource,
  queryKey,
}: {
  auditResourceType?: string;
  importResource?: string;
  exportResource?: string;
  queryKey: readonly unknown[];
}) {
  const queryResource = [...queryKey].reverse().find((part) => typeof part === "string");
  return auditResourceType ?? importResource ?? exportResource ?? (typeof queryResource === "string" ? queryResource : undefined);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function withResearchFieldHelp(fields: EditableField[]) {
  return fields.map((field) => ({
    ...field,
    helpText: field.helpText ?? getResearchFieldHelp(field.name),
  }));
}

export function ResearchBulkActions({
  resourceKey,
  importResource,
  exportResource,
}: {
  resourceKey?: string;
  importResource?: string;
  exportResource?: string;
}) {
  const resolvedImportResource = importResource ?? resourceKey;
  const resolvedExportResource = exportResource ?? resourceKey;
  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleTemplateDownload = async () => {
    if (!resolvedImportResource) return;
    try {
      const blob = await importsApi.downloadTemplate(resolvedImportResource);
      downloadBlob(blob, `${resolvedImportResource}-import-template.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed");
    }
  };

  const handleExportDownload = async () => {
    if (!resolvedExportResource) return;
    setIsExporting(true);
    try {
      const queued = await researchServiceApi.startExport(resolvedExportResource, { format: "csv" });
      toast.success("Export queued. Download will start when the file is ready.");
      const job = await waitForExportJob(queued.data.job_id);
      if (job.status !== "SUCCESS") {
        throw new Error(job.error || "Research export failed");
      }
      const blob = await researchServiceApi.downloadExportJob(queued.data.job_id);
      downloadBlob(blob, `${resolvedExportResource}-export.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Research export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {resolvedImportResource ? (
        <>
          <Button variant="outline" size="sm" type="button" onClick={() => setImportOpen(true)}>
            <Upload data-icon="inline-start" />
            Import
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={handleTemplateDownload}>
            <Download data-icon="inline-start" />
            Template
          </Button>
          <ResearchImportDialog
            resourceKey={resolvedImportResource}
            open={importOpen}
            onOpenChange={setImportOpen}
          />
        </>
      ) : null}
      {resolvedExportResource ? (
        <Button variant="outline" size="sm" type="button" onClick={handleExportDownload} disabled={isExporting}>
          <Download data-icon="inline-start" />
          {isExporting ? "Preparing..." : "Export CSV"}
        </Button>
      ) : null}
    </>
  );
}

function ResearchImportDialog({
  resourceKey,
  open,
  onOpenChange,
}: {
  resourceKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [handledJobId, setHandledJobId] = useState<string | null>(null);

  const resourceQuery = useImportResource(resourceKey, { enabled: open });
  const previewImport = usePreviewImport();
  const startImportCommit = useStartImportCommit();
  const importJob = useImportJob(jobId, { enabled: open && Boolean(jobId) });
  const resource = resourceQuery.data?.data;
  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.status === "valid") ?? [],
    [preview],
  );

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setCommitResult(null);
    setJobId(null);
    setHandledJobId(null);
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await importsApi.downloadTemplate(resourceKey);
      downloadBlob(blob, `${resourceKey}-import-template.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed");
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Choose a CSV or JSON file first");
      return;
    }
    setCommitResult(null);
    setJobId(null);
    setHandledJobId(null);
    try {
      const response = await previewImport.mutateAsync({ resource: resourceKey, file });
      setPreview(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preview failed");
    }
  };

  const handleCommit = async () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    try {
      const response = await startImportCommit.mutateAsync({
        resource: resourceKey,
        data: { rows: validRows.map((row) => row.raw), mode: "partial" },
      });
      setCommitResult(null);
      setJobId(response.data.job_id);
      setHandledJobId(null);
      toast.success("Import queued. Keep this dialog open while it processes.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  };

  useEffect(() => {
    const job = importJob.data?.data;
    if (!job || !jobId || handledJobId === jobId) return;

    if (job.status === "SUCCESS" && job.result) {
      setCommitResult(job.result);
      setHandledJobId(jobId);
      queryClient.invalidateQueries({ queryKey: ["research"] });
      toast.success(`Created ${job.result.created_rows} record${job.result.created_rows === 1 ? "" : "s"}`);
    }

    if (job.status === "FAILURE") {
      setHandledJobId(jobId);
      toast.error(job.error || "Import failed");
    }
  }, [handledJobId, importJob.data, jobId, queryClient]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetImport();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{resource ? `Import ${resource.label}` : "Import records"}</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file, preview the rows, then import only valid records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border bg-background p-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor={`research-import-${resourceKey}`}>CSV or JSON file</Label>
              <Input
                id={`research-import-${resourceKey}`}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setPreview(null);
                  setCommitResult(null);
                  setJobId(null);
                }}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleTemplateDownload}>
              <Download data-icon="inline-start" />
              Template
            </Button>
            <Button type="button" onClick={handlePreview} disabled={!file || previewImport.isPending}>
              <FileUp data-icon="inline-start" />
              {previewImport.isPending ? "Previewing..." : "Preview"}
            </Button>
          </div>

          {resourceQuery.isLoading ? (
            <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">Loading import template details...</p>
          ) : resource?.columns?.length ? (
            <div className="rounded-lg border">
              <div className="grid max-h-48 divide-y overflow-y-auto text-sm">
                {resource.columns.map((column) => (
                  <div key={column.key} className="grid gap-2 px-3 py-2 sm:grid-cols-[160px_90px_1fr]">
                    <span className="font-medium">{column.key}</span>
                    <span>
                      <Badge variant={column.required ? "default" : "outline"}>
                        {column.required ? "Required" : "Optional"}
                      </Badge>
                    </span>
                    <span className="text-muted-foreground">{column.description || "No notes"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {preview ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-4">
                <ImportStat label="Rows" value={preview.total_rows} />
                <ImportStat label="Valid" value={preview.valid_rows} />
                <ImportStat label="Invalid" value={preview.invalid_rows} />
                <ImportStat label="Duplicates" value={preview.duplicate_rows} />
              </div>
              <div className="rounded-lg border">
                <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
                  <p className="text-sm font-semibold">Preview</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCommit}
                    disabled={validRows.length === 0 || startImportCommit.isPending || importJob.isFetching}
                  >
                    <Play data-icon="inline-start" />
                    {startImportCommit.isPending || importJob.isFetching ? "Processing..." : `Import ${validRows.length}`}
                  </Button>
                </div>
                <div className="grid max-h-56 divide-y overflow-y-auto text-sm">
                  {preview.rows.slice(0, 25).map((row) => (
                    <div key={row.row_number} className="grid gap-2 px-3 py-2 sm:grid-cols-[70px_110px_1fr]">
                      <span>Row {row.row_number}</span>
                      <span>
                        <Badge variant={importStatusVariant(row.status)}>{row.status}</Badge>
                      </span>
                      <span className="text-muted-foreground">
                        {[...row.errors, ...row.warnings].length > 0
                          ? [...row.errors, ...row.warnings].join("; ")
                          : "Ready"}
                      </span>
                    </div>
                  ))}
                </div>
                {preview.rows.length > 25 ? (
                  <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                    Showing first 25 rows of {preview.rows.length}.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {jobId && !commitResult ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Import job {importJob.data?.data.status?.toLowerCase() || "queued"}. Results will appear here.
              </AlertDescription>
            </Alert>
          ) : null}

          {commitResult ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Created {commitResult.created_rows}, skipped {commitResult.skipped_rows}, failed {commitResult.failed_rows}.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

function importStatusVariant(status: ImportPreviewRow["status"]) {
  if (status === "valid") return "default";
  if (status === "duplicate") return "outline";
  return "destructive";
}

export function ResearchResourceAuditPreview({
  serviceName,
  resourceType,
}: {
  serviceName: string;
  resourceType?: string;
}) {
  const auditQuery = useQuery({
    queryKey: ["research", "resource", "audit-preview", serviceName, resourceType],
    queryFn: () =>
      auditLogsApi.list({
        service_name: serviceName,
        resource_type: resourceType,
        per_page: 3,
      }),
    enabled: Boolean(resourceType),
  });
  const logs = auditQuery.data?.data ?? [];

  return (
    <section className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Audit Preview
      </div>
      <div className="mt-3 space-y-2">
        {!resourceType ? (
          <p className="text-sm text-muted-foreground">Audit preview needs a backend resource type.</p>
        ) : auditQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading recent audit entries...</p>
        ) : auditQuery.isError ? (
          <p className="text-sm text-muted-foreground">Audit entries are not available for this resource.</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent audit entries were returned.</p>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{formatAuditLabel(log.action ?? "activity")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[
                  formatAuditLabel(log.service_name ?? serviceName),
                  formatAuditLabel(log.resource_type ?? resourceType),
                  formatAuditDate(log.created_at ?? log.happened_at),
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

async function waitForExportJob(jobId: string) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const response = await researchServiceApi.getExportJob(jobId);
    if (!["PENDING", "STARTED", "RETRY"].includes(response.data.status)) {
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Export is still processing. Check again shortly.");
}

export function ResearchMobileRecordCard({
  record,
  actions,
  metaFields = ["code", "category", "status"],
}: {
  record: ResearchGenericRecord;
  actions: ReactNode;
  metaFields?: string[];
}) {
  const title = recordTitle(record);
  const meta = recordMeta(record, metaFields);
  const status = labelValue(record.status ?? record.is_active ?? record.is_public);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {meta ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {status ? <span className="rounded-md border px-2 py-1 capitalize">{status}</span> : null}
        {record.updated_at ? <span className="rounded-md border px-2 py-1">Updated {String(record.updated_at).slice(0, 10)}</span> : null}
      </div>
    </div>
  );
}

export function ResearchResourcePage({
  title,
  description,
  queryKey,
  resource,
  fields,
  manageScopes = ["research:write"],
  emptyMessage,
  defaults = {},
  listParams = {},
  listFilters,
  recordColumns,
  summarySlot,
  metaFields = ["code", "category", "status"],
  detailBaseHref,
  detailHref,
  getRecordWorkflowActions,
  importResource,
  exportResource,
  auditServiceName = "research",
  auditResourceType,
  editorMode = "auto",
  renderMobileRecord,
  buildPayload,
}: ResearchResourcePageProps) {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));
  const resolvedListFilters = listFilters ?? deriveListFilters(fields);
  const guidance = getResearchGuidance(title);
  const resolvedAuditResourceType = deriveAuditResourceType({
    auditResourceType,
    importResource,
    exportResource,
    queryKey,
  });
  const resolvedSummarySlot = (
    <div className="space-y-4">
      <ResearchSectionGuide title={title} />
      <ResearchResourceAuditPreview
        serviceName={auditServiceName}
        resourceType={resolvedAuditResourceType}
      />
      {summarySlot}
    </div>
  );

  return (
    <EditableServiceResourcePage<ResearchGenericRecord, ResearchGenericPayload>
      title={title}
      description={description}
      backHref="/research"
      queryKey={queryKey}
      fields={withResearchFieldHelp(fields)}
      listFilters={resolvedListFilters}
      recordColumns={recordColumns}
      summarySlot={resolvedSummarySlot}
      toolbarSlot={
        importResource || exportResource ? (
          <ResearchBulkActions importResource={importResource} exportResource={exportResource} />
        ) : undefined
      }
      list={async (filters) => {
        const response = await resource.list({ page: 1, per_page: 50, ...listParams, ...filters });
        return { data: (response.data ?? []) as ResearchGenericRecord[], meta: response.meta };
      }}
      create={(payload) => resource.create(payload)}
      update={(id, payload) => resource.update(id, payload)}
      delete={(id) => resource.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={recordTitle}
      getRecordMeta={(record) => recordMeta(record, metaFields)}
      getRecordDetailHref={(record) =>
        detailHref?.(record) ??
        (detailBaseHref && record.slug ? `${detailBaseHref}/${record.slug}` : null)
      }
      getRecordWorkflowActions={getRecordWorkflowActions}
      editorMode={editorMode}
      renderMobileRecord={
        renderMobileRecord ??
        ((record, actions) => (
          <ResearchMobileRecordCard record={record} actions={actions} metaFields={metaFields} />
        ))
      }
      emptyMessage={emptyMessage}
      emptyState={guidance?.emptyState}
      resourceKey={importResource}
      buildPayload={(values, editingRecord) => ({
        ...defaults,
        ...(buildPayload ? buildPayload(values, editingRecord) : values),
      })}
    />
  );
}

export { researchServiceApi };
