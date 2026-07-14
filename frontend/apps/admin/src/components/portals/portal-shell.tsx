"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, LogOut, Menu, Minus, Plus } from "lucide-react";
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
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Toolbar portal={portal} />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30"
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
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { hasScope } = usePermissions();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set());

  const hasItemScope = useCallback((item: PortalNavItem) => {
    if (!item.scope) return true;
    return Array.isArray(item.scope)
      ? item.scope.some((scope) => hasScope(scope))
      : hasScope(item.scope);
  }, [hasScope]);

  const filterNavItem = useCallback(function filter(item: PortalNavItem): PortalNavItem | null {
    const children = item.children
      ?.map(filter)
      .filter((child): child is PortalNavItem => child !== null);
    if (!hasItemScope(item) && (!children || children.length === 0)) return null;
    return children && children.length > 0 ? { ...item, children } : { ...item, children: undefined };
  }, [hasItemScope]);

  const filteredNav = useMemo(
    () => portal.nav.map(filterNavItem).filter((item): item is PortalNavItem => item !== null),
    [filterNavItem, portal.nav],
  );

  const grouped = useMemo(
    () => filteredNav.reduce<{ group?: string; items: PortalNavItem[] }[]>(
      (acc, item) => {
        const last = acc[acc.length - 1];
        if (last && last.group === item.group) {
          last.items.push(item);
        } else {
          acc.push({ group: item.group, items: [item] });
        }
        return acc;
      },
      [],
    ),
    [filteredNav],
  );

  const activeHref = useMemo(
    () => getBestActiveHref(filteredNav, pathname, searchParams),
    [filteredNav, pathname, searchParams],
  );

  useEffect(() => {
    const activeGroups = grouped
      .filter((section) => section.group && section.items.some((item) => navItemContainsHref(item, activeHref)))
      .map((section) => section.group as string);
    if (activeGroups.length === 0) return;
    setExpandedGroups((current) => {
      let changed = false;
      const next = new Set(current);
      for (const group of activeGroups) {
        if (!next.has(group)) {
          next.add(group);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [activeHref, grouped]);

  useEffect(() => {
    const activeParents = filteredNav.flatMap((item) => collectActiveParents(item, activeHref));
    if (activeParents.length === 0) return;
    setExpandedItems((current) => {
      let changed = false;
      const next = new Set(current);
      for (const href of activeParents) {
        if (!next.has(href)) {
          next.add(href);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [activeHref, filteredNav]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const toggleItem = (href: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

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
        animate={{ width: isMobileOpen ? 280 : collapsed ? 68 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar",
          "md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="group/sidebar-header relative flex h-16 items-center justify-between border-b px-3">
          <Link
            href={portal.baseHref}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5",
              collapsed && !isMobileOpen && "justify-center",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background p-1.5 shadow-sm">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            {!collapsed || isMobileOpen ? (
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
            className={cn(
              collapsed && !isMobileOpen &&
                "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-sidebar/95 opacity-0 shadow-sm transition-opacity hover:bg-sidebar-accent focus-visible:opacity-100 group-hover/sidebar-header:opacity-100",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu /> : <ChevronLeft />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {grouped.map((section, sIdx) => (
              <div key={section.group ?? `_ungrouped_${sIdx}`}>
                {section.group && (!collapsed || isMobileOpen) ? (
                  <button
                    type="button"
                    className="mb-1 mt-3 flex w-full items-center justify-between gap-2 rounded-md px-3 py-1 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors first:mt-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    aria-expanded={expandedGroups.has(section.group)}
                    onClick={() => toggleGroup(section.group as string)}
                  >
                    <span className="truncate">{section.group}</span>
                    {expandedGroups.has(section.group) ? <Minus className="size-3" /> : <Plus className="size-3" />}
                  </button>
                ) : null}
                {(section.group && (!collapsed || isMobileOpen) && !expandedGroups.has(section.group) ? [] : section.items).map((item) => (
                  <PortalNavItemNode
                    key={item.href}
                    item={item}
                    activeHref={activeHref}
                    collapsed={collapsed}
                    isMobileOpen={isMobileOpen}
                    expandedItems={expandedItems}
                    onToggleItem={toggleItem}
                    onMobileClose={onMobileClose}
                  />
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-3", collapsed && !isMobileOpen && "justify-center px-2")}
              >
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed || isMobileOpen ? (
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

function PortalNavItemNode({
  item,
  activeHref,
  collapsed,
  isMobileOpen,
  expandedItems,
  onToggleItem,
  onMobileClose,
  depth = 0,
}: {
  item: PortalNavItem;
  activeHref: string;
  collapsed: boolean;
  isMobileOpen: boolean;
  expandedItems: Set<string>;
  onToggleItem: (href: string) => void;
  onMobileClose: () => void;
  depth?: number;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const active = item.href === activeHref;
  const activeChild = Boolean(item.children?.some((child) => navItemContainsHref(child, activeHref)));
  const expanded = expandedItems.has(item.href) || activeChild;
  const className = cn(
    "flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors",
    collapsed && !isMobileOpen
      ? "size-10 justify-center px-0 [&_svg]:size-5"
      : depth > 0
        ? "px-2 py-1.5 text-xs [&_svg]:size-3.5"
        : "px-3 py-2 [&_svg]:size-4",
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : activeChild
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

  if (collapsed && !isMobileOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} onClick={onMobileClose} className={className}>
            <Icon />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          className={className}
          aria-expanded={expanded}
          onClick={() => onToggleItem(item.href)}
        >
          <Icon />
          <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
          <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", expanded && "rotate-180")} />
        </button>
      ) : (
        <Link href={item.href} onClick={onMobileClose} className={className}>
          <Icon />
          <span className="truncate">{item.title}</span>
        </Link>
      )}
      {hasChildren && expanded ? (
        <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-2">
          {item.children?.map((child) => (
            <PortalNavItemNode
              key={child.href}
              item={child}
              activeHref={activeHref}
              collapsed={collapsed}
              isMobileOpen={isMobileOpen}
              expandedItems={expandedItems}
              onToggleItem={onToggleItem}
              onMobileClose={onMobileClose}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function navItemContainsHref(item: PortalNavItem, href: string): boolean {
  return item.href === href || Boolean(item.children?.some((child) => navItemContainsHref(child, href)));
}

function collectActiveParents(item: PortalNavItem, activeHref: string): string[] {
  if (!item.children?.length) return [];
  const childParents = item.children.flatMap((child) => collectActiveParents(child, activeHref));
  const hasActiveChild = item.children.some((child) => child.href === activeHref || navItemContainsHref(child, activeHref));
  return hasActiveChild ? [item.href, ...childParents] : childParents;
}

function getBestActiveHref(
  items: PortalNavItem[],
  pathname: string,
  searchParams: URLSearchParams,
) {
  let best: { href: string; score: number } | null = null;

  for (const item of flattenPortalNav(items)) {
    const score = activeScore(item.href, pathname, searchParams);
    if (score === null) continue;
    if (!best || score > best.score) {
      best = { href: item.href, score };
    }
  }

  return best?.href ?? "";
}

function flattenPortalNav(items: PortalNavItem[]): PortalNavItem[] {
  return items.flatMap((item) => [item, ...flattenPortalNav(item.children ?? [])]);
}

function activeScore(
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
) {
  const [itemPath, itemQuery] = href.split("?");
  if (!itemPath) return null;

  if (itemQuery) {
    if (pathname !== itemPath) return null;
    const requiredParams = new URLSearchParams(itemQuery);
    for (const [key, value] of requiredParams.entries()) {
      if (searchParams.get(key) !== value) return null;
    }
    return 10000 + href.length;
  }

  if (pathname === itemPath) return 5000 + href.length;
  if (pathname.startsWith(`${itemPath}/`)) return itemPath.length;
  return null;
}
