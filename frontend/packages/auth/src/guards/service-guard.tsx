"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";
import type { Service } from "../types";

interface ServiceGuardProps {
  service: Service;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ServiceGuard({
  service,
  children,
  fallback,
  redirectTo = "/select-service",
}: ServiceGuardProps) {
  const router = useRouter();
  const { user, isLoading, activeService, checkAuth, switchService } = useAuth();
  const hasAccess = Boolean(user?.services.some((access) => access.service === service));

  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [checkAuth, user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!hasAccess) {
      router.push(redirectTo);
    } else if (activeService !== service) {
      switchService(service);
    }
  }, [isLoading, user, hasAccess, service, activeService, switchService, router, redirectTo]);

  if (isLoading) {
    return fallback || <ServiceLoadingSkeleton />;
  }

  if (!user || !hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

function ServiceLoadingSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Verifying access...</p>
      </div>
    </div>
  );
}
