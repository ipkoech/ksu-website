"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, usePermissions, type Service } from "@ksu/auth";
import {
  ScrollArea,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Logo,
  LogoIcon,
  ConfirmDialog,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  Building,
  Newspaper,
  Calendar,
  Image,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BookOpen,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Megaphone,
  Building2,
  FlaskConical,
  Library,
  Shield,
  KeyRound,
  Webhook,
  BellRing,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  scope?: string | string[];
  children?: NavItem[];
}

const mainNavigation: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Content",
    href: "/content",
    icon: FileText,
    scope: "content.view",
    children: [
      { title: "News", href: "/content/news", icon: Newspaper, scope: "content.manage_news" },
      { title: "Events", href: "/content/events", icon: Calendar, scope: "content.manage_events" },
      { title: "Announcements", href: "/content/announcements", icon: Megaphone, scope: "content.manage_announcements" },
      { title: "Sliders", href: "/content/sliders", icon: Image, scope: "marketing.manage_sliders" },
    ],
  },
  {
    title: "Academic",
    href: "/academic",
    icon: GraduationCap,
    scope: "academic.view",
    children: [
      { title: "Schools", href: "/academic/schools", icon: Building, scope: "academic.manage_schools" },
      { title: "Departments", href: "/academic/departments", icon: Building2, scope: "academic.manage_departments" },
      { title: "Programmes", href: "/academic/programmes", icon: BookOpen, scope: "academic.manage_programmes" },
    ],
  },
  {
    title: "Admissions",
    href: "/admissions",
    icon: UserCheck,
    scope: "admissions.view",
  },
  {
    title: "People",
    href: "/people",
    icon: Users,
    scope: "persons.view",
    children: [
      { title: "Persons", href: "/people/persons", icon: Users, scope: "staff.manage_persons" },
    ],
  },
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle,
    scope: "support.view",
    children: [
      { title: "FAQs", href: "/support/faqs", icon: MessageSquare, scope: "support.manage_faqs" },
    ],
  },
  { title: "Media", href: "/media", icon: Image, scope: "media.view" },
  { title: "Settings", href: "/settings", icon: Settings, scope: "settings.manage" },
];

const researchNavigation: NavItem[] = [
  { title: "Dashboard", href: "/research", icon: LayoutDashboard },
  { title: "Projects", href: "/research/projects", icon: FlaskConical, scope: "research.view_projects" },
  { title: "Publications", href: "/research/publications", icon: BookOpen, scope: "publications.view" },
  { title: "Grants", href: "/research/grants", icon: FileText, scope: "research.manage_grants" },
];

const libraryNavigation: NavItem[] = [
  { title: "Dashboard", href: "/library", icon: LayoutDashboard },
  { title: "Catalog", href: "/library/catalog", icon: Library, scope: "library.manage_resources" },
  { title: "Circulation", href: "/library/circulation", icon: BookOpen, scope: "library.manage_loans" },
  { title: "Patrons", href: "/library/patrons", icon: Users, scope: "library.view" },
];

const systemNavigation: NavItem[] = [
  { title: "Dashboard", href: "/system", icon: LayoutDashboard },
  { title: "Users", href: "/system/users", icon: Users, scope: "users.view" },
  { title: "Roles", href: "/system/roles", icon: Settings, scope: "roles.view" },
  { title: "Permissions", href: "/system/permissions", icon: Shield, scope: "permissions.view" },
  { title: "Audit Logs", href: "/system/audit", icon: FileText, scope: "audit.view" },
  { title: "Settings", href: "/system/settings", icon: Settings, scope: ["settings.view", "settings.manage"] },
  { title: "API Keys", href: "/system/settings/api-keys", icon: KeyRound, scope: ["api_keys.view", "api_keys.manage"] },
  { title: "Webhooks", href: "/system/settings/webhooks", icon: Webhook, scope: ["webhooks.view", "webhooks.manage"] },
  { title: "Notifications", href: "/system/notifications", icon: BellRing, scope: ["notifications.view", "notifications.send"] },
];

const navigationMap: Record<string, NavItem[]> = {
  main: mainNavigation,
  research: researchNavigation,
  library: libraryNavigation,
  system: systemNavigation,
};

interface SidebarProps {
  service: Service | "system";
  collapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ service, collapsed = false, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasScope } = usePermissions();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigation = navigationMap[service] || [];

  const filteredNav = navigation.filter((item) => {
    if (!item.scope) return true;
    return Array.isArray(item.scope) ? item.scope.some((scope) => hasScope(scope)) : hasScope(item.scope);
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar",
          "md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <motion.div 
          className="flex h-14 items-center justify-between border-b px-4"
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Logo href="/select-service" size="sm" showText variant="icon" />
              </motion.div>
            ) : (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Link href="/select-service">
                  <LogoIcon size="sm" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <Button variant="ghost" size="icon-sm" onClick={onToggle}>
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </motion.div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "justify-center px-2"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{user ? getInitials(user.name) : "?"}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/select-service">Switch Service</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Sign out"
        description="Are you sure you want to sign out? You'll need to sign in again to access the admin portal."
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
