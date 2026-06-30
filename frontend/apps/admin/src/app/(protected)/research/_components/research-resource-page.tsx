"use client";

import Link from "next/link";
import { Download, Upload } from "lucide-react";
import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordColumn,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import { Button } from "@ksu/ui/components";
import { importsApi, researchServiceApi, type ResearchGenericPayload, type ResearchGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import type { ReactNode } from "react";
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
    try {
      const blob = await researchServiceApi.downloadExport(resolvedExportResource, { format: "csv" });
      downloadBlob(blob, `${resolvedExportResource}-export.csv`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Research export failed");
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
        <Button variant="outline" size="sm" type="button" onClick={handleExportDownload}>
          <Download data-icon="inline-start" />
          Export CSV
        </Button>
      ) : null}
    </>
  );
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
  editorMode = "auto",
  renderMobileRecord,
  buildPayload,
}: ResearchResourcePageProps) {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));
  const resolvedListFilters = listFilters ?? deriveListFilters(fields);
  const guidance = getResearchGuidance(title);
  const resolvedSummarySlot = (
    <div className="space-y-4">
      <ResearchSectionGuide title={title} />
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
