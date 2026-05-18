"use client";

import * as React from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, PageHeader } from "@ksu/ui/components";
import { usePermissions, useRoles } from "@ksu/api-client/hooks/admin";

export default function PermissionsPage() {
  const permissions = usePermissions();
  const roles = useRoles({ page: 1, limit: 100 });

  const groupedPermissions = React.useMemo(() => {
    return (permissions.data ?? []).reduce<Record<string, typeof permissions.data>>((acc, permission) => {
      const resourceKey = permission.resource ?? "uncategorized";
      acc[resourceKey] = [...(acc[resourceKey] ?? []), permission];
      return acc;
    }, {});
  }, [permissions.data]);

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Read-only system-defined permissions and the roles that currently grant them."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Permissions" }]}
      />
      <div className="space-y-6 p-6">
        {Object.keys(groupedPermissions).length === 0 && !permissions.isLoading ? (
          <EmptyState title="No permissions found" description="The backend did not return any system permissions." />
        ) : null}
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <Card key={resource}>
            <CardHeader>
              <CardTitle className="capitalize">{resource}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(resourcePermissions ?? []).map((permission) => {
                const matchingRoles = (roles.data?.data ?? []).filter((role) =>
                  (role.role_permissions ?? []).some((rp) => rp.permission?.name === permission.name)
                );
                return (
                  <div key={permission.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">{permission.description ?? `${permission.action} access for ${permission.resource}`}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchingRoles.length > 0 ? matchingRoles.map((role) => (
                          <Badge key={role.id} variant="secondary">{role.display_name ?? role.name}</Badge>
                        )) : <Badge variant="outline">No roles assigned</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
