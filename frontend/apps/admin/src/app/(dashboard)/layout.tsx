"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ServiceGuard } from "@ksu/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ServiceGuard service="main">
      <DashboardShell service="main">{children}</DashboardShell>
    </ServiceGuard>
  );
}
