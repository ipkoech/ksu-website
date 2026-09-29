"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keep public URLs and server-rendered chrome unchanged; isolate /admin. */
export function ResearchRouteFrame({ children, before, after }:
  { children: ReactNode; before: ReactNode; after: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;
  return <>{before}{children}{after}</>;
}
