"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { Badge, DataTable, PageHeader, SearchFilter, StatusBadge } from "@ksu/ui/components";
import { useRoles, useDeleteRole } from "@ksu/api-client/hooks/admin";
import type { Role } from "@ksu/api-client/types/admin";
import { canDeleteRoles, canManageRoles } from "../_lib/access";

export default function RolesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [systemOnly, setSystemOnly] = React.useState<string | null>(null);
  const roles = useRoles({ page, limit, search, system: systemOnly === "system" ? true : systemOnly === "custom" ? false : undefined });
  const deleteRole = useDeleteRole();
  const canManage = canManageRoles(user, hasScope);
  const canDelete = canDeleteRoles(user, hasScope);

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Define reusable permission bundles for administrators."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Roles" }]}
        primaryAction={canManage ? { label: "Add role", href: "/system/roles/new" } : undefined}
      />
      <div className="space-y-4 p-6">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              key: "system",
              label: "Type",
              value: systemOnly ?? undefined,
              options: [
                { value: "system", label: "System" },
                { value: "custom", label: "Custom" },
              ],
            },
          ]}
          onFilterChange={(_, value) => setSystemOnly(value)}
          onClearAll={() => {
            setSearch("");
            setSystemOnly(null);
          }}
        />
        <DataTable<Role>
          columns={[
            { key: "name", header: "Name", accessor: "name", sortable: true },
            { key: "display_name", header: "Display name", accessor: "display_name", sortable: true },
            {
              key: "users_count",
              header: "Users count",
              cell: (row) => String((row as Role & { users_count?: number }).users_count ?? 0),
            },
            {
              key: "system",
              header: "System",
              cell: (row) => <Badge variant={row.is_system ? "secondary" : "outline"}>{row.is_system ? "System" : "Custom"}</Badge>,
            },
            {
              key: "status",
              header: "Status",
              cell: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} variant={row.is_active ? "success" : "error"} />,
            },
          ]}
          data={roles.data?.data ?? []}
          pagination={roles.data ? { page: roles.data.meta.page, limit: roles.data.meta.per_page, total: roles.data.meta.total, totalPages: roles.data.meta.pages } : { page, limit, total: 0, totalPages: 1 }}
          onPaginationChange={(nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          }}
          onSearch={setSearch}
          isLoading={roles.isLoading}
          onRowClick={(row) => router.push(`/system/roles/${row.id}`)}
          bulkActions={canDelete ? [
            { label: "Delete", onClick: (ids) => void Promise.all(ids.map((id) => deleteRole.mutateAsync(id))), variant: "destructive" },
          ] : undefined}
        />
      </div>
    </div>
  );
}
