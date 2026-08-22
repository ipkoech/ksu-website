"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@ksu/auth";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { isStaffProfileOnlyUser, staffProfileHref } from "@/lib/auth-routing";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [checkAuth, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?reason=session-expired");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
      return;
    }
    if (!user.mustChangePassword && pathname === "/change-password") {
      router.replace("/select-service");
      return;
    }
    if (isStaffProfileOnlyUser(user) && pathname !== staffProfileHref) {
      router.replace(staffProfileHref);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  if (user?.mustChangePassword && pathname !== "/change-password") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting to password change...</p>
      </div>
    );
  }

  return <RealtimeProvider enabled={isAuthenticated}>{children}</RealtimeProvider>;
}
