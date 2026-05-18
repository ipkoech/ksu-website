"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Service } from "@ksu/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [service] = useState<Service>("main");

  return <DashboardShell service={service}>{children}</DashboardShell>;
}