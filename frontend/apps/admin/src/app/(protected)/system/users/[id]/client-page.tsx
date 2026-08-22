"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { Plus, Trash2 } from "lucide-react";
import {
  ActivityFeed,
  Alert,
  AlertDescription,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from "@ksu/ui/components";
import { useAuditLogs, useDeleteUser, useRoles, useUpdateUser, useUpdateUserRoles, useUser } from "@ksu/api-client/hooks/admin";
import type { UserRoleAssignmentPayload } from "@ksu/api-client/types/admin";
import { MainScopePicker } from "@/components/relationships";
import { canDeleteUsers, canManageRoles, canManageUsers, canViewAudit, canViewRoles } from "../../_lib/access";

type RoleAssignmentForm = {
  key: string;
  role_id: string;
  scope_type: string;
  scope_id: string;
  expires_at: string;
  note: string;
};

const serviceOptions = ["main", "research", "library", "heri", "system"] as const;

function roleAssignmentsToPayload(assignments: RoleAssignmentForm[]): UserRoleAssignmentPayload[] {
  return assignments
    .filter((assignment) => assignment.role_id)
    .map((assignment) => ({
      role_id: assignment.role_id,
      scope_type: assignment.scope_type || null,
      scope_id:
        assignment.scope_type === "university" ||
        assignment.scope_id === "__university__"
          ? null
          : assignment.scope_id || null,
      expires_at: assignment.expires_at || null,
      note: assignment.note || null,
    }));
}

function validateRoleAssignments(assignments: RoleAssignmentForm[]) {
  for (const assignment of assignments) {
    if (!assignment.role_id) continue;
    if (
      assignment.scope_type &&
      assignment.scope_type !== "university" &&
      !assignment.scope_id
    ) {
      return "Choose the scoped record for every scoped role assignment.";
    }
  }
  return null;
}

function scopeSummary(assignment: RoleAssignmentForm, scope?: { name?: string | null; type?: string | null } | null) {
  if (!assignment.scope_type) return "Global";
  return scope?.name || assignment.scope_type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasScope } = usePermissions();
  const canManage = canManageUsers(currentUser, hasScope);
  const canDelete = canDeleteUsers(currentUser, hasScope);
  const canAssignRoles = canManageRoles(currentUser, hasScope);
  const canReadRoles = canViewRoles(currentUser, hasScope);
  const canReadAudit = canViewAudit(currentUser, hasScope);
  const user = useUser(id);
  const roles = useRoles({ page: 1, limit: 100 }, { enabled: canReadRoles });
  const audit = useAuditLogs({ user_id: id, page: 1, limit: 10 }, { enabled: canReadAudit });
  const updateUser = useUpdateUser();
  const updateRoles = useUpdateUserRoles();
  const deleteUser = useDeleteUser();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [localState, setLocalState] = React.useState({
    email: "",
    full_name: "",
    is_active: false,
    service_memberships: [] as Array<(typeof serviceOptions)[number]>,
    must_change_password: false,
  });
  const [roleAssignmentsForm, setRoleAssignmentsForm] = React.useState<RoleAssignmentForm[]>([]);
  const [roleError, setRoleError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user.data) return;
    const roleAssignments = user.data.role_assignments ?? [];

    setLocalState({
      email: user.data.email,
      full_name: user.data.full_name,
      is_active: user.data.is_active,
      service_memberships: user.data.service_memberships ?? [],
      must_change_password: user.data.must_change_password ?? false,
    });
    setRoleAssignmentsForm(
      roleAssignments
        .map((assignment, index) => ({
          key: assignment.id ?? `${assignment.role?.id ?? "role"}-${index}`,
          role_id: assignment.role?.id ?? assignment.role_id ?? "",
          scope_type: assignment.scope_type ?? "",
          scope_id: assignment.scope_id ?? "",
          expires_at: (assignment.expires_at ?? "").slice(0, 10),
          note: assignment.note ?? "",
        }))
        .filter((assignment) => assignment.role_id)
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
    const nextRoleError = validateRoleAssignments(roleAssignmentsForm);
    if (nextRoleError) {
      setRoleError(nextRoleError);
      return;
    }
    setRoleError(null);
    await updateUser.mutateAsync({ id, data: localState });
    if (canAssignRoles) {
      await updateRoles.mutateAsync({ id, roles: roleAssignmentsToPayload(roleAssignmentsForm) });
    }
  };

  const addRoleAssignment = () => {
    setRoleAssignmentsForm((current) => [
      ...current,
      { key: `new-${Date.now()}`, role_id: "", scope_type: "", scope_id: "", expires_at: "", note: "" },
    ]);
  };

  const updateRoleAssignment = (key: string, patch: Partial<RoleAssignmentForm>) => {
    setRoleError(null);
    setRoleAssignmentsForm((current) =>
      current.map((assignment) => (assignment.key === key ? { ...assignment, ...patch } : assignment))
    );
  };

  const removeRoleAssignment = (key: string) => {
    setRoleAssignmentsForm((current) => current.filter((assignment) => assignment.key !== key));
  };

  if (!user.data && user.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading user...</div>;
  }

  if (!user.data) {
    return <div className="p-6 text-sm text-destructive">User not found.</div>;
  }

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
              <div className="space-y-2 md:col-span-2">
                <Label>Service memberships</Label>
                <div className="flex flex-wrap gap-4 rounded-md border p-3">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center gap-2 text-sm capitalize">
                      <Checkbox
                        disabled={!canManage}
                        checked={localState.service_memberships.includes(service)}
                        onCheckedChange={(checked) =>
                          setLocalState((current) => ({
                            ...current,
                            service_memberships: checked
                              ? [...current.service_memberships, service]
                              : current.service_memberships.filter((item) => item !== service),
                          }))
                        }
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Password security</Label>
                <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                  <Checkbox
                    disabled={!canManage}
                    checked={localState.must_change_password}
                    onCheckedChange={(checked) =>
                      setLocalState((current) => ({ ...current, must_change_password: Boolean(checked) }))
                    }
                  />
                  Require password change at next login
                </label>
              </div>
            </CardContent>
          </Card>

          {canReadRoles ? <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Role assignments</CardTitle>
                {canAssignRoles ? (
                  <Button type="button" variant="outline" size="sm" onClick={addRoleAssignment}>
                    <Plus className="h-4 w-4" />
                    Add role
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleError ? (
                <Alert variant="destructive">
                  <AlertDescription>{roleError}</AlertDescription>
                </Alert>
              ) : null}
              {roleAssignmentsForm.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No roles are assigned to this user.
                </p>
              ) : null}

              {roleAssignmentsForm.map((assignment) => {
                const role = (roles.data?.data ?? []).find((item) => item.id === assignment.role_id);
                return (
                  <div key={assignment.key} className="space-y-4 rounded-lg border p-4">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          disabled={!canAssignRoles}
                          value={assignment.role_id}
                          onValueChange={(nextValue) => updateRoleAssignment(assignment.key, { role_id: nextValue })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {(roles.data?.data ?? []).map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.display_name ?? item.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!canAssignRoles}
                        onClick={() => removeRoleAssignment(assignment.key)}
                        aria-label={`Remove ${role?.display_name ?? role?.name ?? "role"}`}
                        className="mt-7"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <MainScopePicker
                      label="Scope"
                      description="Limit the role to a university, office, academic unit, intake, or library branch when needed."
                      typeValue={assignment.scope_type}
                      idValue={assignment.scope_id}
                      disabled={!canAssignRoles}
                      onChange={({ type, id: nextId }) => updateRoleAssignment(assignment.key, { scope_type: type, scope_id: nextId })}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Expires</Label>
                        <Input
                          type="date"
                          disabled={!canAssignRoles}
                          value={assignment.expires_at}
                          onChange={(event) => updateRoleAssignment(assignment.key, { expires_at: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Note</Label>
                        <Input
                          disabled={!canAssignRoles}
                          value={assignment.note}
                          onChange={(event) => updateRoleAssignment(assignment.key, { note: event.target.value })}
                          placeholder="Optional assignment note"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2">
                {roleAssignmentsForm.filter((assignment) => assignment.role_id).map((assignment) => {
                  const role = (roles.data?.data ?? []).find((item) => item.id === assignment.role_id);
                  const persistedAssignment = user.data.role_assignments?.find((item) => item.id === assignment.key);
                  return (
                    <Badge key={`${assignment.key}-summary`} variant="outline">
                      {role?.display_name ?? role?.name ?? "Selected role"}
                      {` • ${scopeSummary(assignment, persistedAssignment?.scope)}`}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card> : null}

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {canReadAudit ? (
                <ActivityFeed items={activityItems} isLoading={audit.isLoading} />
              ) : (
                <p className="text-sm text-muted-foreground">Audit visibility is not available for your current scope.</p>
              )}
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
