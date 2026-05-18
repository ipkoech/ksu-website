"use client";

import { ServiceGuard } from "@ksu/auth";
import { DashboardShell } from "@/components/layout";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceGuard service="library">
      <DashboardShell service="library">{children}</DashboardShell>
    </ServiceGuard>
  );
}
