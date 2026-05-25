"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, usePermissions as useAuthPermissions } from "@ksu/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DeleteConfirmDialog, Input, Label, PageHeader, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { useDeleteRole, usePermissions, useRole, useUpdateRole, useUpdateRolePermissions, useUsers } from "@ksu/api-client/hooks/admin";
import { canDeleteRoles, canManageRoles, canViewPermissions, canViewUsers } from "../../_lib/access";

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasScope } = useAuthPermissions();
  const role = useRole(id);
  const canReadPermissions = canViewPermissions(currentUser, hasScope);
  const permissions = usePermissions(undefined, { enabled: canReadPermissions });
  const canReadUsers = canViewUsers(currentUser, hasScope);
  const users = useUsers({ page: 1, limit: 100 }, { enabled: canReadUsers });
  const updateRole = useUpdateRole();
  const updatePermissions = useUpdateRolePermissions();
  const deleteRole = useDeleteRole();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [form, setForm] = React.useState({ name: "", display_name: "", description: "" });
  const canManageRole = canManageRoles(currentUser, hasScope);
  const canDeleteRole = canDeleteRoles(currentUser, hasScope);

  React.useEffect(() => {
    if (!role.data) return;
    setForm({
      name: role.data.name,
      display_name: role.data.display_name ?? "",
      description: role.data.description ?? "",
    });
    setSelectedPermissions(
      role.data.permissions?.length
        ? role.data.permissions
        : (role.data.role_permissions ?? [])
            .map((assignment) => assignment.permission?.name)
            .filter((permissionName): permissionName is string => Boolean(permissionName))
    );
  }, [role.data]);

  const groupedPermissions = React.useMemo(() => {
    return (permissions.data ?? []).reduce<Record<string, typeof permissions.data>>((acc, permission) => {
      const resourceKey = permission.resource ?? "uncategorized";
      acc[resourceKey] = [...(acc[resourceKey] ?? []), permission];
      return acc;
    }, {});
  }, [permissions.data]);

  if (!role.data && role.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading role...</div>;
  }

  if (!role.data) {
    return <div className="p-6 text-sm text-destructive">Role not found.</div>;
  }

  const roleUsers = (users.data?.data ?? []).filter((user) =>
    (user.role_assignments ?? []).some((assignment) => assignment.role?.id === id)
  );

  return (
    <div>
      <PageHeader
        title={role.data.display_name ?? role.data.name}
        description={role.data.description ?? "No description provided."}
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Roles", href: "/system/roles" }, { label: role.data.display_name ?? role.data.name }]}
        backHref="/system/roles"
        primaryAction={canManageRole ? {
          label: "Save changes",
          onClick: async () => {
            await updateRole.mutateAsync({
              id,
              data: {
                display_name: form.display_name,
                description: richTextToPlainText(form.description),
              },
            });
            await updatePermissions.mutateAsync({ id, permissions: selectedPermissions });
          },
        } : undefined}
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.name} disabled={role.data.is_system || !canManageRole} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input disabled={!canManageRole} value={form.display_name} onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <RichTextEditor disabled={!canManageRole} value={form.description} onChange={(description) => setForm((current) => ({ ...current, description }))} toolbar="simple" minHeight="140px" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                <div key={resource} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium capitalize">{resource}</h3>
                    <div className="flex gap-2">
                      <Button disabled={!canManageRole} variant="ghost" size="sm" onClick={() => setSelectedPermissions((current) => Array.from(new Set([...current, ...(resourcePermissions ?? []).map((permission) => permission.name)])))}>
                        Select all
                      </Button>
                      <Button disabled={!canManageRole} variant="ghost" size="sm" onClick={() => setSelectedPermissions((current) => current.filter((permissionName) => !(resourcePermissions ?? []).some((permission) => permission.name === permissionName)))}>
                        Deselect
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(resourcePermissions ?? []).map((permission) => {
                      const selected = selectedPermissions.includes(permission.name);
                      return (
                        <button
                          key={permission.id}
                          type="button"
                          disabled={!canManageRole}
                          onClick={() =>
                            setSelectedPermissions((current) =>
                              selected ? current.filter((value) => value !== permission.name) : [...current, permission.name]
                            )
                          }
                        >
                          <Badge variant={selected ? "default" : "secondary"}>{permission.action}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!canReadPermissions ? <p className="text-sm text-muted-foreground">Permission visibility is not available for your current scope.</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users with this role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roleUsers.map((user) => (
                <button key={user.id} type="button" className="block w-full rounded-lg border p-3 text-left text-sm hover:border-primary" onClick={() => router.push(`/system/users/${user.id}`)}>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </button>
              ))}
              {!canReadUsers ? <p className="text-sm text-muted-foreground">User assignment visibility is not available for your current scope.</p> : null}
              {canReadUsers && roleUsers.length === 0 ? <p className="text-sm text-muted-foreground">No users currently assigned.</p> : null}
            </CardContent>
          </Card>

          {!role.data.is_system && canDeleteRole ? (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle>Danger zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}>
                  Delete role
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {canDeleteRole ? <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={role.data.display_name ?? role.data.name}
        requireConfirmation
        onConfirm={async () => {
          await deleteRole.mutateAsync(id);
          router.push("/system/roles");
        }}
        isDeleting={deleteRole.isPending}
      /> : null}
    </div>
  );
}
