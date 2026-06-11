"use client";

import {
  EditableServiceResourcePage,
  type EditableField,
  type EditableListFilter,
  type EditableRecordWorkflowAction,
} from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchGenericPayload, type ResearchGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

type ResourceApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => Promise<{ data?: Record<string, any>[] }>;
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
  metaFields?: string[];
  detailBaseHref?: string;
  detailHref?: (record: ResearchGenericRecord) => string | null | undefined;
  getRecordWorkflowActions?: (
    record: ResearchGenericRecord,
  ) => Array<EditableRecordWorkflowAction<ResearchGenericRecord, ResearchGenericPayload>>;
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
  metaFields = ["code", "category", "status"],
  detailBaseHref,
  detailHref,
  getRecordWorkflowActions,
}: ResearchResourcePageProps) {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));
  const resolvedListFilters = listFilters ?? deriveListFilters(fields);

  return (
    <EditableServiceResourcePage<ResearchGenericRecord, ResearchGenericPayload>
      title={title}
      description={description}
      backHref="/research"
      queryKey={queryKey}
      fields={fields}
      listFilters={resolvedListFilters}
      list={async (filters) => {
        const response = await resource.list({ page: 1, per_page: 50, ...listParams, ...filters });
        return { data: (response.data ?? []) as ResearchGenericRecord[] };
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
      emptyMessage={emptyMessage}
      buildPayload={(values) => ({ ...defaults, ...values })}
    />
  );
}

export { researchServiceApi };
