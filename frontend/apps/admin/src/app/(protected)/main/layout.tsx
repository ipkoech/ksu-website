"use client";

import { ServiceGuard } from "@ksu/auth";
import { DashboardShell } from "@/components/layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceGuard service="main">
      <DashboardShell service="main">{children}</DashboardShell>
    </ServiceGuard>
  );
}
