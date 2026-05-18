"use client";

import { ServiceGuard } from "@ksu/auth";
import { DashboardShell } from "@/components/layout";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceGuard service="research">
      <DashboardShell service="research">{children}</DashboardShell>
    </ServiceGuard>
  );
}
