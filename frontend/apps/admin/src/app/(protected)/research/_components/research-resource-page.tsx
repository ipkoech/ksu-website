"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertCircle, Download, Info, Play, Upload } from "lucide-react";
import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordColumn,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ksu/ui/components";
import {
  auditLogsApi,
  importsApi,
  researchServiceApi,
  useImportResource,
  usePreviewImport,
  useStartImportCommit,
  type ImportPreviewRow,
  type ResearchGenericPayload,
  type ResearchGenericRecord,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { useMemo, useState, type ReactNode } from "react";
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
  const [stagedRows, setStagedRows] = useState<StagedImportRow[]>([]);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const resourceQuery = useImportResource(resourceKey, { enabled: open });
  const previewImport = usePreviewImport();
  const startImportCommit = useStartImportCommit();
  const resource = resourceQuery.data?.data;
  const isSubmitting = startImportCommit.isPending;
  const rowIssues = useMemo(
    () => stagedRows.map((row) => getStagedRowIssues(row, resource?.columns ?? [])),
    [resource?.columns, stagedRows],
  );
  const issueCount = rowIssues.reduce((total, issues) => total + issues.length, 0);
  const validRowCount = stagedRows.length - rowIssues.filter((issues) => issues.length > 0).length;

  const resetImport = () => {
    setStagedRows([]);
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await importsApi.downloadTemplate(resourceKey);
      downloadBlob(blob, `${resourceKey}-import-template.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template download failed");
    }
  };

  const loadFile = async (nextFile: File | null) => {
    setStagedRows([]);

    if (!nextFile) return;

    try {
      const response = await previewImport.mutateAsync({ resource: resourceKey, file: nextFile });
      setStagedRows(response.data.rows.map(toStagedImportRow));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File load failed");
    }
  };

  const updateStagedValue = (rowNumber: number, key: string, value: string) => {
    setStagedRows((current) =>
      current.map((row) =>
        row.rowNumber === rowNumber
          ? {
              ...row,
              values: { ...row.values, [key]: value },
              importedErrors: [],
            }
          : row,
      ),
    );
  };

  const handleCommit = async () => {
    if (stagedRows.length === 0) {
      toast.error("Choose a CSV or JSON file first");
      return;
    }
    if (issueCount > 0) {
      toast.error("Fix required or invalid fields before submitting");
      return;
    }
    try {
      const response = await startImportCommit.mutateAsync({
        resource: resourceKey,
        data: { rows: stagedRows.map((row) => normalizeImportRow(row.values)), mode: "partial" },
      });
      queryClient.invalidateQueries({ queryKey: ["research"] });
      toast.success(`Import job queued (${response.data.job_id.slice(0, 8)}). The list will refresh when it completes.`);
      resetImport();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting && !nextOpen) return;
        onOpenChange(nextOpen);
        if (!nextOpen) resetImport();
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{resource ? `Import ${resource.label}` : "Import records"}</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file, review and edit imported records, then submit valid data.
          </DialogDescription>
        </DialogHeader>

        <div className={isSubmitting ? "pointer-events-none min-h-0 flex-1 space-y-4 overflow-hidden opacity-70" : "min-h-0 flex-1 space-y-4 overflow-hidden"}>
          <div className="grid gap-3 rounded-lg border bg-background p-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor={`research-import-${resourceKey}`}>CSV or JSON file</Label>
              <Input
                id={`research-import-${resourceKey}`}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                disabled={isSubmitting || previewImport.isPending}
                onChange={(event) => void loadFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleTemplateDownload} disabled={isSubmitting}>
              <Download data-icon="inline-start" />
              Template
            </Button>
          </div>

          {resourceQuery.isLoading ? (
            <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">Loading import template details...</p>
          ) : null}

          {previewImport.isPending ? (
            <p className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">Loading records from file...</p>
          ) : stagedRows.length > 0 ? (
            <div className="space-y-3">
              <div className="rounded-lg border">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold">Imported records</p>
                    <p className="text-xs text-muted-foreground">Edit cells before submitting. Required and invalid values are marked inline.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {resource?.columns?.length ? (
                      <IconTooltipButton
                        label="Field details"
                        tooltip="View field notes and required columns"
                        onClick={() => setFieldsOpen(true)}
                      >
                        <Info className="size-4" />
                      </IconTooltipButton>
                    ) : null}
                    <IconTooltipButton
                      label="Import stats"
                      tooltip="View import row counts and issue totals"
                      onClick={() => setStatsOpen(true)}
                    >
                      <Activity className="size-4" />
                    </IconTooltipButton>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div
                    className="grid min-w-max border-b bg-muted/40 text-xs font-medium uppercase text-muted-foreground"
                    style={{ gridTemplateColumns: `72px repeat(${resource?.columns.length ?? 1}, minmax(180px, 1fr)) 260px` }}
                  >
                    <div className="px-3 py-2">Row</div>
                    {(resource?.columns ?? []).map((column) => (
                      <div key={column.key} className="px-3 py-2">{column.key}</div>
                    ))}
                    <div className="px-3 py-2">Issues</div>
                  </div>
                  <div className="max-h-[48vh] min-w-max divide-y overflow-y-auto">
                    {stagedRows.map((row, rowIndex) => {
                      const issues = rowIssues[rowIndex] ?? [];
                      return (
                        <div
                          key={row.rowNumber}
                          className="grid min-w-max text-sm"
                          style={{ gridTemplateColumns: `72px repeat(${resource?.columns.length ?? 1}, minmax(180px, 1fr)) 260px` }}
                        >
                          <div className="px-3 py-2 text-muted-foreground">#{row.rowNumber}</div>
                          {(resource?.columns ?? []).map((column) => {
                            const value = row.values[column.key] ?? "";
                            const hasRequiredIssue = column.required && !String(value).trim();
                            return (
                              <div key={column.key} className="space-y-1 px-3 py-2">
                                <Input
                                  value={String(value)}
                                  disabled={isSubmitting}
                                  aria-invalid={hasRequiredIssue}
                                  className={hasRequiredIssue ? "border-destructive focus-visible:ring-destructive" : ""}
                                  onChange={(event) => updateStagedValue(row.rowNumber, column.key, event.target.value)}
                                />
                                {hasRequiredIssue ? (
                                  <p className="text-xs text-destructive">Required field is empty</p>
                                ) : null}
                              </div>
                            );
                          })}
                          <div className="space-y-1 px-3 py-2">
                            {issues.length > 0 ? (
                              issues.map((issue) => (
                                <div key={issue} className="flex gap-1.5 text-xs text-destructive">
                                  <AlertCircle className="mt-0.5 size-3 shrink-0" />
                                  <span>{issue}</span>
                                </div>
                              ))
                            ) : (
                              <Badge variant="outline">Ready</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              onOpenChange(false);
              resetImport();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCommit}
            disabled={stagedRows.length === 0 || issueCount > 0 || isSubmitting}
          >
            <Play data-icon="inline-start" />
            {isSubmitting ? "Submitting..." : `Submit ${stagedRows.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
      <ImportFieldsDialog
        open={fieldsOpen}
        onOpenChange={setFieldsOpen}
        columns={resource?.columns ?? []}
      />
      <ImportStatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        totalRows={stagedRows.length}
        validRows={validRowCount}
        issueCount={issueCount}
      />
    </Dialog>
  );
}

function IconTooltipButton({
  label,
  tooltip,
  onClick,
  children,
}: {
  label: string;
  tooltip: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label={label} onClick={onClick}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ImportFieldsDialog({
  open,
  onOpenChange,
  columns,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Array<{ key: string; required: boolean; description?: string | null }>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import fields</DialogTitle>
          <DialogDescription>Reference for required columns and field notes.</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border">
          <div className="grid divide-y text-sm">
            {columns.map((column) => (
              <div key={column.key} className="grid gap-2 px-3 py-2 sm:grid-cols-[180px_100px_1fr]">
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
      </DialogContent>
    </Dialog>
  );
}

function ImportStatsDialog({
  open,
  onOpenChange,
  totalRows,
  validRows,
  issueCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalRows: number;
  validRows: number;
  issueCount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import stats</DialogTitle>
          <DialogDescription>Current status of the records staged for import.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <ImportStat label="Rows" value={totalRows} />
          <ImportStat label="Ready" value={validRows} />
          <ImportStat label="Need fixes" value={totalRows - validRows} />
          <ImportStat label="Issues" value={issueCount} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type StagedImportRow = {
  rowNumber: number;
  values: Record<string, string>;
  importedErrors: string[];
  warnings: string[];
};

function toStagedImportRow(row: ImportPreviewRow): StagedImportRow {
  return {
    rowNumber: row.row_number,
    values: Object.fromEntries(
      Object.entries(row.raw).map(([key, value]) => [key, value == null ? "" : String(value)]),
    ),
    importedErrors: row.errors,
    warnings: row.warnings,
  };
}

function getStagedRowIssues(
  row: StagedImportRow,
  columns: Array<{ key: string; required: boolean }>,
) {
  const requiredIssues = columns
    .filter((column) => column.required && !String(row.values[column.key] ?? "").trim())
    .map((column) => `${column.key} is required`);

  return [...requiredIssues, ...row.importedErrors];
}

function normalizeImportRow(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value.trim() === "" ? null : value]),
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
