"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { libraryServiceApi, type LibraryBranch, type LibraryBranchPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function LibraryBranchesPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("library.manage_services") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<LibraryBranch, LibraryBranchPayload>
      title="Library Branches"
      description="Create and maintain branch records used across catalog, services, and staff."
      backHref="/library"
      queryKey={["library", "branches"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "short_name", label: "Short Name" },
        { name: "slug", label: "Slug" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "library_type", label: "Library Type", placeholder: "main" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "sort_order", label: "Sort Order", type: "number" },
      ]}
      list={() => libraryServiceApi.branches.list({ active_only: false, page: 1, per_page: 100 })}
      create={(payload) => libraryServiceApi.branches.create(payload)}
      update={(id, payload) => libraryServiceApi.branches.update(id, payload)}
      delete={(id) => libraryServiceApi.branches.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.name}
      getRecordMeta={(record) => [record.short_name, record.library_type, record.is_public ? "Public" : "Internal"].filter(Boolean).join(" · ")}
      emptyMessage="No library branches were returned by the library service."
      buildPayload={(values) => ({
        name: values.name,
        short_name: values.short_name,
        slug: values.slug,
        description: values.description,
        email: values.email,
        phone: values.phone,
        library_type: values.library_type || "main",
        is_public: values.is_public,
        is_active: values.is_active,
        sort_order: values.sort_order ?? 0,
      })}
    />
  );
}
