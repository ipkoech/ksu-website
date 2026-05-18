"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Input, Label, PageHeader } from "@ksu/ui/components";
import { useCreateUser, useRoles, useUpdateUserRoles } from "@ksu/api-client/hooks/admin";
import { createUserSchema } from "../../_lib/schemas";
import { canManageRoles, canManageUsers, canViewRoles } from "../../_lib/access";

export default function CreateUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const canManage = canManageUsers(user, hasScope);
  const canAssignRoles = canManageRoles(user, hasScope);
  const canReadRoles = canViewRoles(user, hasScope);
  const createUser = useCreateUser();
  const updateUserRoles = useUpdateUserRoles();
  const roles = useRoles({ page: 1, limit: 100 }, { enabled: canReadRoles });
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    send_welcome_email: true,
    role_ids: [] as string[],
  });

  const submit = async () => {
    const parsed = createUserSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    const payload = {
      email: parsed.data.email,
      full_name: `${parsed.data.first_name} ${parsed.data.last_name}`.trim(),
      password: parsed.data.password,
    };
    const result = await createUser.mutateAsync(payload);
    const createdUser = "data" in result ? result.data : result;
    if (canAssignRoles && form.role_ids.length > 0) {
      await updateUserRoles.mutateAsync({
        id: createdUser.id,
        roles: form.role_ids.map((roleId) => ({ role_id: roleId })),
      });
    }
    router.push(`/system/users/${createdUser.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Create user"
        description="Provision a new administrative user and optionally assign initial roles."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Users", href: "/system/users" }, { label: "Create user" }]}
        backHref="/system/users"
      />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>User details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input type="password" value={form.confirm_password} onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))} />
              </div>
            </div>

            {canReadRoles ? <div className="space-y-3">
              <Label>Initial roles</Label>
              <div className="flex flex-wrap gap-2">
                {(roles.data?.data ?? []).map((role) => {
                  const selected = form.role_ids.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      className="rounded-full"
                      disabled={!canAssignRoles}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          role_ids: selected
                            ? current.role_ids.filter((id) => id !== role.id)
                            : [...current.role_ids, role.id],
                        }))
                      }
                    >
                      <Badge variant={selected ? "default" : "secondary"}>{role.display_name}</Badge>
                    </button>
                  );
                })}
              </div>
            </div> : null}

            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={form.send_welcome_email}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, send_welcome_email: Boolean(checked) }))}
              />
              Send welcome email
            </label>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/system/users")}>Cancel</Button>
              <Button disabled={!canManage} onClick={() => void submit()} loading={createUser.isPending || updateUserRoles.isPending}>Create user</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
