"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Input, Label, PageHeader, PasswordInput } from "@ksu/ui/components";
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
  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "One number", valid: /[0-9]/.test(form.password) },
    { label: "Passwords match", valid: form.password.length > 0 && form.password === form.confirm_password },
  ];

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
            {error ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input id="new-user-email" type="email" autoComplete="username" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-first-name">First name</Label>
                <Input id="new-user-first-name" autoComplete="given-name" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-last-name">Last name</Label>
                <Input id="new-user-last-name" autoComplete="family-name" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Password</Label>
                <PasswordInput id="new-user-password" autoComplete="new-password" aria-describedby="new-user-password-rules" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-confirm-password">Confirm password</Label>
                <PasswordInput id="new-user-confirm-password" autoComplete="new-password" aria-describedby="new-user-password-rules" value={form.confirm_password} onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))} />
              </div>
            </div>

            <div className="rounded-md border bg-muted/40 p-3" id="new-user-password-rules" aria-live="polite">
              <p className="text-sm font-medium">Password requirements</p>
              <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                {passwordChecks.map((check) => (
                  <li key={check.label} className={check.valid ? "text-success" : undefined}>
                    {check.valid ? "Met:" : "Needed:"} {check.label}
                  </li>
                ))}
              </ul>
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
                      className="min-h-11 rounded-full"
                      disabled={!canAssignRoles}
                      aria-pressed={selected}
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

            <label className="flex min-h-11 items-center gap-3 text-sm">
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
