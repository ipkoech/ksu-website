"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { libraryServiceApi, type LibraryGenericPayload, type LibraryGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function LibraryEngagementPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("library.manage_services") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<LibraryGenericRecord, LibraryGenericPayload>
      title="Library Regulations"
      description="Publish and maintain borrowing, access, conduct, and fee regulations."
      backHref="/library"
      queryKey={["library", "regulations"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "category", label: "Category", placeholder: "general" },
        { name: "content", label: "Content", type: "textarea", required: true },
        { name: "effective_date", label: "Effective Date", type: "date" },
        { name: "status", label: "Status", placeholder: "active" },
      ]}
      list={() => libraryServiceApi.regulations.list({ page: 1, per_page: 50 })}
      create={(payload) => libraryServiceApi.regulations.create(payload)}
      update={(id, payload) => libraryServiceApi.regulations.update(id, payload)}
      delete={(id) => libraryServiceApi.regulations.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title ?? "Untitled regulation"}
      getRecordMeta={(record) => [record.category, record.effective_date, record.status].filter(Boolean).join(" · ")}
      emptyMessage="No regulations were returned by the library service."
      buildPayload={(values) => ({
        title: values.title,
        category: values.category || "general",
        content: values.content,
        effective_date: values.effective_date,
        status: values.status || "active",
      })}
    />
  );
}
