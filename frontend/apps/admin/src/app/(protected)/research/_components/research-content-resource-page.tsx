"use client";

import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordColumn,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import { usePermissions } from "@ksu/auth";
import type { ReactNode } from "react";

type ContentRecord = Record<string, any> & {
  id: string;
  title?: string;
  name?: string;
  slug?: string | null;
  status?: string | null;
  is_published?: boolean | null;
  is_active?: boolean | null;
};

type ContentResourceApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => Promise<{ data?: ContentRecord[] }>;
  create: (data: any) => Promise<unknown>;
  update: (id: string, data: any) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
};

interface ResearchContentResourcePageProps {
  title: string;
  description: string;
  queryKey: readonly unknown[];
  resource: ContentResourceApi;
  fields: EditableField[];
  emptyMessage: string;
  defaults?: Record<string, any>;
  listParams?: Record<string, string | number | boolean | undefined>;
  listFilters?: EditableListFilter[];
  recordColumns?: Array<EditableRecordColumn<ContentRecord>>;
  summarySlot?: ReactNode;
  manageScopes?: string[];
  metaFields?: string[];
  getRecordWorkflowActions?: (
    record: ContentRecord,
  ) => Array<EditableRecordWorkflowAction<ContentRecord, Record<string, any>>>;
  buildPayload?: (
    values: Record<string, any>,
    editingRecord?: ContentRecord | null,
  ) => Record<string, any>;
}

function recordTitle(record: ContentRecord) {
  return record.title ?? record.name ?? record.slug ?? record.id;
}

function labelValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
}

function recordMeta(record: ContentRecord, fields: string[]) {
  return fields
    .map((field) => labelValue(record[field]))
    .concat(record.scope_type ? [`Scope: ${record.scope_type}`] : [])
    .filter(Boolean)
    .join(" · ");
}

export function ResearchContentResourcePage({
  title,
  description,
  queryKey,
  resource,
  fields,
  emptyMessage,
  defaults = {},
  listParams = {},
  listFilters,
  recordColumns,
  summarySlot,
  manageScopes = ["content.manage", "content.write", "research:write"],
  metaFields = ["category", "status"],
  getRecordWorkflowActions,
  buildPayload,
}: ResearchContentResourcePageProps) {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));

  return (
    <EditableServiceResourcePage<ContentRecord, Record<string, any>>
      title={title}
      description={description}
      backHref="/research/content"
      queryKey={queryKey}
      fields={fields}
      listFilters={listFilters}
      recordColumns={recordColumns}
      summarySlot={summarySlot}
      list={async (filters) => resource.list({ page: 1, per_page: 50, scope_type: "research", ...listParams, ...filters })}
      create={(payload) => resource.create({ ...payload, scope_type: "research" })}
      update={(id, payload) => resource.update(id, { ...payload, scope_type: "research" })}
      delete={(id) => resource.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={recordTitle}
      getRecordMeta={(record) => recordMeta(record, metaFields)}
      getRecordWorkflowActions={getRecordWorkflowActions}
      emptyMessage={emptyMessage}
      buildPayload={(values, editingRecord) => ({
        ...defaults,
        ...(buildPayload ? buildPayload(values, editingRecord) : values),
        scope_type: "research",
      })}
    />
  );
}
