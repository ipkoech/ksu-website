"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import {
  libraryServiceApi,
  type LibraryElectronicResource,
  type LibraryGenericPayload,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

type ElectronicResourceRecord = LibraryElectronicResource & Record<string, unknown>;

export default function LibraryElectronicPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("library.manage_resources") || hasScope("library:write");

  return (
    <EditableServiceResourcePage<ElectronicResourceRecord, LibraryGenericPayload>
      title="Electronic Resources"
      description="Manage databases, e-book platforms, aggregators, and online access records."
      backHref="/library"
      queryKey={["library", "databases"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "provider", label: "Provider" },
        { name: "access_url", label: "Access URL", required: true },
        { name: "section_letter", label: "A-Z Letter", required: true, placeholder: "A" },
        { name: "resource_type", label: "Resource Type", placeholder: "database" },
        { name: "access_level", label: "Access Level", placeholder: "all" },
        { name: "access_type", label: "Access Type", placeholder: "both" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "requires_vpn", label: "Requires VPN", type: "boolean" },
        { name: "requires_registration", label: "Requires Registration", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "sort_order", label: "Sort Order", type: "number" },
      ]}
      list={async () => {
        const response = await libraryServiceApi.databases.list({ page: 1, per_page: 50 });
        return { data: response.data as ElectronicResourceRecord[] };
      }}
      create={(payload) => libraryServiceApi.databases.create(payload)}
      update={(id, payload) => libraryServiceApi.databases.update(id, payload)}
      delete={(id) => libraryServiceApi.databases.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.name ?? "Untitled resource"}
      getRecordMeta={(record) => [record.provider, record.resource_type, record.access_level].filter(Boolean).join(" · ")}
      emptyMessage="No electronic resources were returned by the library service."
      buildPayload={(values) => ({
        name: values.name,
        slug: values.slug,
        provider: values.provider,
        access_url: values.access_url,
        section_letter: String(values.section_letter || "A").slice(0, 1).toUpperCase(),
        resource_type: values.resource_type || "database",
        access_level: values.access_level || "all",
        access_type: values.access_type || "both",
        description: values.description,
        requires_vpn: values.requires_vpn,
        requires_registration: values.requires_registration,
        is_active: values.is_active,
        is_featured: values.is_featured,
        sort_order: values.sort_order ?? 0,
      })}
    />
  );
}
