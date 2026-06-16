"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions as useAuthPermissions } from "@ksu/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageHeader, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { useCreateRole, usePermissions } from "@ksu/api-client/hooks/admin";
import { createRoleSchema } from "../../_lib/schemas";
import { canManageRoles, canViewPermissions } from "../../_lib/access";

export default function CreateRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = useAuthPermissions();
  const createRole = useCreateRole();
  const canReadPermissions = canViewPermissions(user, hasScope);
  const permissions = usePermissions(undefined, { enabled: canReadPermissions });
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    display_name: "",
    description: "",
    permissions: [] as string[],
  });
  const canManage = canManageRoles(user, hasScope);
  const permissionItems = React.useMemo(() => permissions.data ?? [], [permissions.data]);

  const groupedPermissions = React.useMemo(() => {
    return permissionItems.reduce<Record<string, typeof permissionItems>>((acc, permission) => {
      const key = permission.resource ?? "uncategorized";
      acc[key] = [...(acc[key] ?? []), permission];
      return acc;
    }, {});
  }, [permissionItems]);

  const submit = async () => {
    const parsed = createRoleSchema.safeParse({ ...form, description: richTextToPlainText(form.description) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid role");
      return;
    }
    const result = await createRole.mutateAsync(parsed.data);
    const createdRole = "data" in result ? result.data : result;
    router.push(`/system/roles/${createdRole.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Create role"
        description="Create a custom role and assign the permissions it should grant."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Roles", href: "/system/roles" }, { label: "Create role" }]}
        backHref="/system/roles"
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Role details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role slug</Label>
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="system_operator" />
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input value={form.display_name} onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor value={form.description} onChange={(description) => setForm((current) => ({ ...current, description }))} toolbar="simple" minHeight="140px" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <div key={resource} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{resource}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                            permissions: Array.from(new Set([...current.permissions, ...(resourcePermissions ?? []).map((permission) => permission.name)])),
                      }))
                    }
                  >
                    Select all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(resourcePermissions ?? []).map((permission) => {
                    const selected = form.permissions.includes(permission.name);
                    return (
                      <button
                        key={permission.id}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            permissions: selected
                              ? current.permissions.filter((value) => value !== permission.name)
                              : [...current.permissions, permission.name],
                          }))
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/system/roles")}>Cancel</Button>
          <Button disabled={!canManage} onClick={() => void submit()} loading={createRole.isPending}>Create role</Button>
        </div>
      </div>
    </div>
  );
}
