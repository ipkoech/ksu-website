"use client";

import { EditableServiceResourcePage, type EditableField } from "@/components/dashboard/editable-service-resource-page";
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
  metaFields?: string[];
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
  metaFields = ["code", "category", "status"],
}: ResearchResourcePageProps) {
  const { hasScope } = usePermissions();
  const canManage = manageScopes.some((scope) => hasScope(scope));

  return (
    <EditableServiceResourcePage<ResearchGenericRecord, ResearchGenericPayload>
      title={title}
      description={description}
      backHref="/research"
      queryKey={queryKey}
      fields={fields}
      list={async () => {
        const response = await resource.list({ page: 1, per_page: 50, ...listParams });
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
      emptyMessage={emptyMessage}
      buildPayload={(values) => ({ ...defaults, ...values })}
    />
  );
}

export { researchServiceApi };
