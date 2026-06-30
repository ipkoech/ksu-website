"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Download, Upload } from "lucide-react";
import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordColumn,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import { Button } from "@ksu/ui/components";
import { auditLogsApi, importsApi, researchServiceApi, type ResearchGenericPayload, type ResearchGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { useState, type ReactNode } from "react";
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
          <Button variant="outline" size="sm" asChild>
            <Link href={`/imports/${resolvedImportResource}`}>
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={handleTemplateDownload}>
            <Download data-icon="inline-start" />
            Template
          </Button>
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
