"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import { useAuth, usePermissions, ServiceGuard } from "@ksu/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { AdminAnalyticsTracker } from "@/components/analytics/admin-analytics-tracker";
import { Toolbar } from "@/components/layout/toolbar";
import { useSidebar } from "@/hooks/use-sidebar";
import { getPortalConfig } from "@/lib/portals/registry";
import type { PortalConfig, PortalKey, PortalNavItem } from "@/lib/portals/types";
import { useState, type ReactNode } from "react";

interface PortalShellProps {
  portalKey: PortalKey;
  children: ReactNode;
}

export function PortalShell({ portalKey, children }: PortalShellProps) {
  const portal = getPortalConfig(portalKey);

  if (!portal) return null;

  return (
    <ServiceGuard service={portal.service}>
      <PortalChrome portal={portal}>{children}</PortalChrome>
    </ServiceGuard>
  );
}

function PortalChrome({ portal, children }: { portal: PortalConfig; children: ReactNode }) {
  const { isCollapsed, isMobileOpen, setMobileOpen, toggle } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminAnalyticsTracker />
      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <PortalSidebar
        portal={portal}
        collapsed={isCollapsed}
        onToggle={toggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 overflow-y-auto bg-muted/30"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

interface PortalSidebarProps {
  portal: PortalConfig;
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function PortalSidebar({
  portal,
  collapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasScope } = usePermissions();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const PortalIcon = portal.icon;

  const hasItemScope = (item: PortalNavItem) => {
    if (!item.scope) return true;
    return Array.isArray(item.scope)
      ? item.scope.some((scope) => hasScope(scope))
      : hasScope(item.scope);
  };

  const filteredNav = portal.nav.filter(hasItemScope);

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar",
          "md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-3">
          <Link
            href={portal.baseHref}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5",
              collapsed && "justify-center",
            )}
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", portal.accentClassName)}>
              <PortalIcon className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Kisii University
                </p>
                <p className="truncate text-sm font-semibold">{portal.title}</p>
              </div>
            ) : null}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const className = cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                collapsed ? "h-10 w-10 justify-center px-0" : "px-3 py-2",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} onClick={onMobileClose} className={className}>
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href} onClick={onMobileClose} className={className}>
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{portal.shortTitle}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/select-service">Portal directory</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profile settings</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-destructive"
                >
                  <LogOut data-icon="inline-start" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Sign out"
        description="Are you sure you want to sign out? You'll need to sign in again to access the admin portals."
        confirmLabel="Sign out"
        variant="destructive"
        onConfirm={async () => {
          await logout();
          setShowLogoutConfirm(false);
        }}
      />
    </TooltipProvider>
  );
}
