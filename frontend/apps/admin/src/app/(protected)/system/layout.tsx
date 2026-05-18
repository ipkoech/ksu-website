"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, usePermissions } from "@ksu/auth";
import { AlertTriangle } from "lucide-react";
import { Button } from "@ksu/ui/components";
import { DashboardShell } from "@/components/layout";
import {
  canViewApiKeys,
  canViewAudit,
  canViewNotifications,
  canViewPermissions,
  canViewRoles,
  canViewSettings,
  canViewUsers,
  canViewWebhooks,
  hasSystemAdminAccess,
} from "./_lib/access";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, checkAuth } = useAuth();
  const { hasScope } = usePermissions();

  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [checkAuth, user]);

  const hasSystemAccess = Boolean(
    user &&
      (
        hasSystemAdminAccess(user) ||
        canViewUsers(user, hasScope) ||
        canViewRoles(user, hasScope) ||
        canViewPermissions(user, hasScope) ||
        canViewAudit(user, hasScope) ||
        canViewSettings(user, hasScope) ||
        canViewApiKeys(user, hasScope) ||
        canViewWebhooks(user, hasScope) ||
        canViewNotifications(user, hasScope)
      )
  );

  useEffect(() => {
    if (!isLoading && user && !hasSystemAccess) {
      router.push("/select-service");
    }
  }, [hasSystemAccess, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasSystemAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">403 Unauthorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have the required admin scope to access the system section.
          </p>
          <Button className="mt-6" onClick={() => router.push("/select-service")}>
            Back to services
          </Button>
        </div>
      </div>
    );
  }

  return <DashboardShell service="system">{children}</DashboardShell>;
}
