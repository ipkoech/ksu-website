"use client";

import { mediaApi, type MediaFolder } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { EditableServiceResourcePage, type EditableListFilter, type EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { DateValue, StatusBadge, titleOf } from "../../_components/research-workspace";
import { ContentWorkspaceHeader } from "../_components/content-workspace";

const galleryFilters: EditableListFilter[] = [
  { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" } } },
];

type GalleryRecord = MediaFolder & Record<string, any>;

const galleryColumns: Array<EditableRecordColumn<GalleryRecord>> = [
  { key: "name", label: "Folder", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "slug", label: "Slug", className: "hidden min-w-[160px] md:table-cell", render: (record) => <span>{record.slug}</span> },
  { key: "scope", label: "Scope", className: "hidden w-[120px] lg:table-cell", render: (record) => <span>{record.scope_type ?? "global"}</span> },
  { key: "public", label: "Visibility", className: "w-[120px]", render: (record) => <StatusBadge value={record.is_public ? "public" : "private"} /> },
  { key: "updated", label: "Updated", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.updated_at} /> },
];

export default function ResearchGalleryPage() {
  const { hasScope } = usePermissions();
  const canManage = ["media.manage", "media.upload", "content.manage", "research:write"].some((scope) => hasScope(scope));

  return (
    <EditableServiceResourcePage<GalleryRecord, Record<string, any>>
      title="Research Gallery"
      description="Manage research-scoped media folders used by the main media service."
      backHref="/research/content"
      queryKey={["research", "content", "gallery"]}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={galleryFilters}
      recordColumns={galleryColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" }, allowClear: true } },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      list={(filters) => mediaApi.listFolders({ scope_type: "research", fields: "id,name,slug,parent_id,description,is_public,scope_type,scope_id,created_at,updated_at", ...filters })}
      create={(payload) => mediaApi.createFolder({ ...payload, scope_type: "research", scope_id: null } as any)}
      update={(id, payload) => mediaApi.updateFolder(id, { ...payload, scope_type: "research", scope_id: null } as any)}
      delete={(id) => mediaApi.deleteFolder(id)}
      getRecordTitle={(record) => record.name}
      getRecordMeta={(record) => [record.scope_type, record.is_public ? "public" : "private"].filter(Boolean).join(" · ")}
      emptyMessage="No research gallery folders were returned by the media service."
      buildPayload={(values) => ({ is_public: true, ...values, scope_type: "research", scope_id: null })}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      resourceKey="content"
    />
  );
}
