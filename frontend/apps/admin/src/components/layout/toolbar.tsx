"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Menu, ChevronRight, Home, Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@ksu/ui/components";
import { useAuth } from "@ksu/auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { NotificationBell } from "./notification-bell";
import { useRealtime } from "@/components/realtime/realtime-provider";
import type { PortalConfig } from "@/lib/portals/types";

type ToolbarProps = {
  portal?: Pick<PortalConfig, "shortTitle" | "title" | "baseHref">;
};

const researchPersonaLabels: Record<string, string> = {
  "research-admin": "Research admin",
  "research-content": "Research content",
  "research-farm": "Research farm",
  "research-sustainability": "Research sustainability",
};

function formatRole(role: string) {
  return role
    .replace(/_/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function realtimeLabel(status: ReturnType<typeof useRealtime>["status"]) {
  if (status === "connected") return "Live";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Offline";
  return "Idle";
}

function realtimeTone(status: ReturnType<typeof useRealtime>["status"]) {
  if (status === "connected") return "bg-emerald-500";
  if (status === "connecting") return "bg-amber-500";
  if (status === "error") return "bg-destructive";
  return "bg-muted-foreground";
}

export function Toolbar({ portal }: ToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle, toggleMobile, isCollapsed } = useSidebar();
  const { status } = useRealtime();
  const [search, setSearch] = useState("");

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentResearchRole = user?.roles.find((role) => researchPersonaLabels[role]);
  const personaLabel =
    currentResearchRole ? researchPersonaLabels[currentResearchRole] : user?.roles[0] ? formatRole(user.roles[0]) : "Portal user";
  const settingsHref = pathname.startsWith("/research") ? "/research/settings" : "/settings/profile";

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-4 md:px-6"
    >
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 md:hidden"
        onClick={toggleMobile}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </Button>

      {/* Toggle sidebar on desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden h-9 w-9 md:flex"
        onClick={toggle}
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {isCollapsed ? <Menu size={20} /> : <Menu size={20} />}
      </Button>

      {/* Breadcrumbs */}
      <nav className="hidden min-w-0 items-center gap-1 text-sm sm:flex">
        <Link
          href={portal?.baseHref ?? "/select-service"}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home size={16} />
        </Link>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <div key={href} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-muted-foreground" />
              {isLast ? (
                <span className="max-w-[180px] truncate font-medium text-foreground xl:max-w-none">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="max-w-[140px] truncate text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {portal ? (
        <div className="hidden min-w-0 flex-col leading-tight lg:flex">
          <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {portal.shortTitle}
          </span>
          <span className="truncate text-sm font-semibold">{personaLabel}</span>
        </div>
      ) : null}

      <Badge variant="outline" className="hidden h-9 gap-2 rounded-md px-2.5 md:inline-flex">
        <span className={`size-2 rounded-full ${realtimeTone(status)}`} />
        {realtimeLabel(status)}
      </Badge>

      {/* Search */}
      <form
        className="relative hidden w-44 lg:block xl:w-72"
        onSubmit={(event) => {
          event.preventDefault();
          const query = search.trim();
          if (query) router.push(`${pathname}?q=${encodeURIComponent(query)}`);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search this admin section"
          placeholder="Search this section"
          className="h-11 pl-9 pr-4"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Open settings"
      >
        <Link href={settingsHref}>
          <Settings size={18} />
        </Link>
      </Button>

      {/* Notifications */}
      <NotificationBell />

      {/* User menu */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-full border bg-background p-1 pr-2 hover:bg-muted/50 md:pr-3"
              aria-label="Open profile menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate text-sm font-medium md:inline-block">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <span className="block truncate">{user.name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Profile settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>Portal settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/select-service">Portal directory</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.header>
  );
}
