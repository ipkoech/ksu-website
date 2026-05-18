"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { DataTable, PageHeader, SearchFilter, StatusBadge, Badge } from "@ksu/ui/components";
import { useDeleteUser, useUpdateUser, useUsers, useRoles } from "@ksu/api-client/hooks/admin";
import type { User } from "@ksu/api-client/types/admin";
import { canDeleteUsers, canManageUsers, canViewRoles } from "../_lib/access";

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<string | null>(null);

  const canManage = canManageUsers(user, hasScope);
  const canDelete = canDeleteUsers(user, hasScope);
  const canReadRoles = canViewRoles(user, hasScope);
  const users = useUsers({ page, limit, search, status: status ?? undefined, role: role ?? undefined });
  const roles = useRoles({ page: 1, limit: 100 }, { enabled: canReadRoles });
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const rows = users.data?.data ?? [];
  const pagination = users.data
    ? {
        page: users.data.meta.page,
        limit: users.data.meta.per_page,
        total: users.data.meta.total,
        totalPages: users.data.meta.pages,
      }
    : { page, limit, total: 0, totalPages: 1 };

  const bulkToggle = async (selectedIds: string[], isActive: boolean) => {
    await Promise.all(selectedIds.map((id) => updateUser.mutateAsync({ id, data: { is_active: isActive } })));
  };

  const bulkDelete = async (selectedIds: string[]) => {
    await Promise.all(selectedIds.map((id) => deleteUser.mutateAsync(id)));
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage administrator accounts, activation state, and role assignments."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Users" }]}
        primaryAction={canManage ? { label: "Add user", href: "/system/users/new" } : undefined}
      />
      <div className="space-y-4 p-6">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email"
          filters={[
            {
              key: "status",
              label: "Status",
              value: status ?? undefined,
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
            ...(canReadRoles ? [{
              key: "role",
              label: "Role",
              value: role ?? undefined,
              options: (roles.data?.data ?? []).map((item) => ({ value: item.id, label: item.display_name ?? item.name })),
            }] : []),
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatus(value);
            if (key === "role") setRole(value);
            setPage(1);
          }}
          onClearAll={() => {
            setStatus(null);
            setRole(null);
            setSearch("");
          }}
        />

        <DataTable<User>
          columns={[
            {
              key: "name",
              header: "Name",
              sortable: true,
              cell: (row) => <div className="font-medium">{row.full_name}</div>,
            },
            { key: "email", header: "Email", accessor: "email", sortable: true },
            {
              key: "status",
              header: "Status",
              cell: (row) => (
                <StatusBadge
                  status={row.is_active ? "active" : "inactive"}
                  variant={row.is_active ? "success" : "error"}
                />
              ),
            },
            {
              key: "roles",
              header: "Roles",
              cell: (row) => (
                <div className="flex flex-wrap gap-2">
                  {(row.role_assignments || []).map((assignment, index: number) => (
                    <Badge key={assignment.id || assignment.role?.id || `${row.id}-role-${index}`} variant="secondary">
                      {assignment.role?.display_name || assignment.role?.name}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              key: "last_login",
              header: "Last login",
              cell: (row) => row.last_login_at ? new Date(row.last_login_at).toLocaleString() : "Never",
            },
          ]}
          data={rows}
          pagination={pagination}
          onPaginationChange={(nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          }}
          onSearch={setSearch}
          isLoading={users.isLoading}
          onRowClick={(row) => router.push(`/system/users/${row.id}`)}
          bulkActions={[
            ...(canManage ? [
              { label: "Activate", onClick: (ids: string[]) => void bulkToggle(ids, true) },
              { label: "Deactivate", onClick: (ids: string[]) => void bulkToggle(ids, false) },
            ] : []),
            ...(canDelete ? [
              { label: "Delete", onClick: (ids: string[]) => void bulkDelete(ids), variant: "destructive" as const },
            ] : []),
          ]}
        />
      </div>
    </div>
  );
}
