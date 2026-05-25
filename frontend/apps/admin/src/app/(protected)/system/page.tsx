"use client";

import Link from "next/link";
import { useAuth, usePermissions } from "@ksu/auth";
import { ActivityFeed, Button, Card, CardContent, CardHeader, CardTitle, PageHeader, StatsCard } from "@ksu/ui/components";
import { FileText, KeyRound, Shield, UserPlus, Users } from "lucide-react";
import { useUsers, useAuditLogs, useApiKeys } from "@ksu/api-client/hooks/admin";
import { canManageRoles, canManageSettings, canManageUsers, canViewApiKeys, canViewAudit, canViewUsers } from "./_lib/access";

export default function SystemDashboardPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const canCreateUsers = canManageUsers(user, hasScope);
  const canCreateRoles = canManageRoles(user, hasScope);
  const canEditSettings = canManageSettings(user, hasScope);
  const canReadUsers = canViewUsers(user, hasScope);
  const canReadAudit = canViewAudit(user, hasScope);
  const canReadApiKeys = canViewApiKeys(user, hasScope);
  const users = useUsers({ page: 1, limit: 1 }, { enabled: canReadUsers });
  const audit = useAuditLogs({ page: 1, limit: 10 }, { enabled: canReadAudit });
  const apiKeys = useApiKeys({ enabled: canReadApiKeys });

  const activityItems = (audit.data?.data ?? []).map((item) => ({
    id: item.id,
    user: { name: item.user_id || "System" },
    action: item.action.replace(/_/g, " "),
    target: item.resource_type ? { type: item.resource_type, name: item.resource_type } : undefined,
    timestamp: new Date(item.happened_at),
  }));

  return (
    <div>
      <PageHeader
        title="System Administration"
        description="Manage users, roles, permissions, audit activity, and platform settings."
        primaryAction={canCreateUsers ? { label: "Add user", href: "/system/users/new" } : undefined}
        secondaryActions={canReadAudit ? [
          { label: "View audit logs", href: "/system/audit", variant: "outline" },
        ] : undefined}
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total users" value={users.data?.meta.total ?? "--"} icon={<Users className="h-4 w-4 text-muted-foreground" />} href="/system/users" />
          <StatsCard title="Active sessions" value={users.data?.data.filter((user) => user.last_login_at).length ?? "--"} icon={<Shield className="h-4 w-4 text-muted-foreground" />} />
          <StatsCard title="Audit events (24h)" value={audit.data?.meta.total ?? "--"} icon={<FileText className="h-4 w-4 text-muted-foreground" />} href="/system/audit" />
          <StatsCard title="API keys" value={apiKeys.data?.length ?? "--"} icon={<KeyRound className="h-4 w-4 text-muted-foreground" />} href="/system/settings/api-keys" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent audit activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed items={activityItems} isLoading={audit.isLoading} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canCreateUsers ? <Button asChild className="w-full justify-start">
                <Link href="/system/users/new">
                  <UserPlus className="h-4 w-4" />
                  Create user
                </Link>
              </Button> : null}
              {canCreateRoles ? <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/system/roles/new">Create role</Link>
              </Button> : null}
              {canEditSettings ? <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/system/settings">Review settings</Link>
              </Button> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
