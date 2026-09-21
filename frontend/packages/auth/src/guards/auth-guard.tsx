"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";
import { SessionError } from "./session-error";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, checkAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [checkAuth, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      const separator = redirectTo.includes("?") ? "&" : "?";
      router.push(`${redirectTo}${separator}reason=session-expired`);
    }
  }, [isLoading, isAuthenticated, error, router, redirectTo]);

  if (isLoading) {
    return fallback || <AuthLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    if (error) return <SessionError retry={checkAuth} />;
    return fallback || null;
  }

  if (error) return <SessionError retry={checkAuth} />;

  return <>{children}</>;
}

function AuthLoadingSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
