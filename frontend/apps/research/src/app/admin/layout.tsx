import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "../../features/admin/admin-shell";
import "../../features/admin/workspace.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Research administration", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function ResearchAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
