"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import type { Service } from "@ksu/auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { AdminAnalyticsTracker } from "@/components/analytics/admin-analytics-tracker";

interface DashboardShellProps {
  service: Service | "system";
  children: ReactNode;
}

export function DashboardShell({ service, children }: DashboardShellProps) {
  const { isCollapsed, isMobileOpen, setMobileOpen, toggle } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminAnalyticsTracker />
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        service={service}
        collapsed={isCollapsed}
        onToggle={toggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
