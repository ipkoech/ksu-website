"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import {
  ActivityFeed,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DeleteConfirmDialog,
  Input,
  Label,
  PageHeader,
  StatusBadge,
} from "@ksu/ui/components";
import { useAuditLogs, useDeleteUser, useRoles, useUpdateUser, useUpdateUserRoles, useUser } from "@ksu/api-client/hooks/admin";
import { canDeleteUsers, canManageRoles, canManageUsers, canViewRoles } from "../../_lib/access";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasScope } = usePermissions();
  const canManage = canManageUsers(currentUser, hasScope);
  const canDelete = canDeleteUsers(currentUser, hasScope);
  const canAssignRoles = canManageRoles(currentUser, hasScope);
  const canReadRoles = canViewRoles(currentUser, hasScope);
  const user = useUser(id);
  const roles = useRoles({ page: 1, limit: 100 }, { enabled: canReadRoles });
  const audit = useAuditLogs({ user_id: id, page: 1, limit: 10 });
  const updateUser = useUpdateUser();
  const updateRoles = useUpdateUserRoles();
  const deleteUser = useDeleteUser();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [localState, setLocalState] = React.useState({
    email: "",
    full_name: "",
    is_active: false,
  });
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!user.data) return;
    const roleAssignments = ((user.data as typeof user.data & {
      role_assignments?: Array<{ role?: { id?: string } }>;
    }).role_assignments ?? []);

    setLocalState({
      email: user.data.email,
      full_name: user.data.full_name,
      is_active: user.data.is_active,
    });
    setSelectedRoles(
      roleAssignments
        .map((assignment) => assignment.role?.id)
        .filter((roleId): roleId is string => Boolean(roleId))
    );
  }, [user.data]);

  const activityItems = (audit.data?.data ?? []).map((item) => ({
    id: item.id,
    user: { name: item.user_id || "System" },
    action: item.action.replace(/_/g, " "),
    target: item.resource_type ? { type: item.resource_type, name: item.resource_type } : undefined,
    timestamp: new Date(item.happened_at),
  }));

  const save = async () => {
    await updateUser.mutateAsync({ id, data: localState });
    if (canAssignRoles) {
      await updateRoles.mutateAsync({ id, roles: selectedRoles.map((roleId) => ({ role_id: roleId })) });
    }
  };

  if (!user.data && user.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading user...</div>;
  }

  if (!user.data) {
    return <div className="p-6 text-sm text-destructive">User not found.</div>;
  }

  const roleAssignments = ((user.data as typeof user.data & {
    role_assignments?: Array<{
      id?: string;
      scope_type?: string | null;
      role?: { id?: string; display_name?: string; name?: string; is_active?: boolean };
    }>;
  }).role_assignments ?? []);

  return (
    <div>
      <PageHeader
        title={user.data.full_name}
        description={user.data.email}
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Users", href: "/system/users" }, { label: user.data.email }]}
        backHref="/system/users"
        primaryAction={canManage ? { label: "Save changes", onClick: () => void save() } : undefined}
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input disabled={!canManage} value={localState.email} onChange={(event) => setLocalState((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input disabled={!canManage} value={localState.full_name} onChange={(event) => setLocalState((current) => ({ ...current, full_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="pt-2">
                  <label className="flex items-center gap-3 text-sm">
                    <Checkbox disabled={!canManage} checked={localState.is_active} onCheckedChange={(checked) => setLocalState((current) => ({ ...current, is_active: Boolean(checked) }))} />
                    Active account
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {canReadRoles ? <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(roles.data?.data ?? []).map((role) => {
                  const selected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() =>
                        setSelectedRoles((current) =>
                          selected ? current.filter((value) => value !== role.id) : [...current, role.id]
                        )
                      }
                      disabled={!canAssignRoles}
                    >
                      <Badge variant={selected ? "default" : "secondary"}>
                        {role.display_name}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {roleAssignments.map((assignment, index: number) => (
                  <Badge key={assignment.id || assignment.role?.id || `${user.data.id}-assignment-${index}`} variant="outline">
                    {assignment.role?.display_name || assignment.role?.name}
                    {assignment.scope_type ? ` • ${assignment.scope_type}` : ""}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed items={activityItems} isLoading={audit.isLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={user.data.is_active ? "active" : "inactive"} variant={user.data.is_active ? "success" : "error"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verified</span>
                <StatusBadge status={user.data.is_verified ? "verified" : "unverified"} variant={user.data.is_verified ? "success" : "warning"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last login</span>
                <span>{user.data.last_login_at ? new Date(user.data.last_login_at).toLocaleString() : "Never"}</span>
              </div>
            </CardContent>
          </Card>

          {canManage || canDelete ? <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button disabled={!canManage} variant="outline" className="w-full" onClick={() => setLocalState((current) => ({ ...current, is_active: false }))}>
                Deactivate account
              </Button>
              <Button disabled={!canDelete} variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}>
                Delete account
              </Button>
            </CardContent>
          </Card> : null}
        </div>
      </div>

      {canDelete ? <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={user.data.email}
        requireConfirmation
        onConfirm={async () => {
          await deleteUser.mutateAsync(id);
          router.push("/system/users");
        }}
        isDeleting={deleteUser.isPending}
      /> : null}
    </div>
  );
}
