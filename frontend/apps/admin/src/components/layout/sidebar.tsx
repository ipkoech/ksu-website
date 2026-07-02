"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Minus,
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
  HandCoins,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Plus,
  Sprout,
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
  { title: "Dashboard", href: "/main", icon: LayoutDashboard },
  {
    title: "Content",
    href: "/content",
    icon: FileText,
    scope: "content.view",
    children: [
      {
        title: "News",
        href: "/content/news",
        icon: Newspaper,
        scope: "content.manage_news",
      },
      {
        title: "Blogs",
        href: "/content/blogs",
        icon: FileText,
        scope: "content.manage_blogs",
      },
      {
        title: "Events",
        href: "/content/events",
        icon: Calendar,
        scope: "content.manage_events",
      },
      {
        title: "Announcements",
        href: "/content/announcements",
        icon: Megaphone,
        scope: "content.manage_announcements",
      },
      {
        title: "Sliders",
        href: "/content/sliders",
        icon: Image,
        scope: "marketing.manage_sliders",
      },
    ],
  },
  {
    title: "Academic",
    href: "/academic",
    icon: GraduationCap,
    scope: "academic.view",
    children: [
      {
        title: "Schools",
        href: "/academic/schools",
        icon: Building,
        scope: "academic.manage_schools",
      },
      {
        title: "Departments",
        href: "/academic/departments",
        icon: Building2,
        scope: "academic.manage_departments",
      },
      {
        title: "Programmes",
        href: "/academic/programmes",
        icon: BookOpen,
        scope: "academic.manage_programmes",
      },
    ],
  },
  {
    title: "Admissions",
    href: "/admissions",
    icon: UserCheck,
    scope: [
      "admin:*",
      "admissions.view",
      "admissions.manage_intakes",
      "admissions.manage_info",
      "academic.view",
      "academic.write",
      "academic:write",
      "academic.manage",
    ],
    children: [
      {
        title: "Information",
        href: "/admissions/info",
        icon: FileText,
        scope: [
          "admin:*",
          "admissions.view",
          "admissions.manage_info",
          "academic.view",
          "academic.write",
          "academic:write",
          "academic.manage",
        ],
      },
      {
        title: "Intakes",
        href: "/admissions/intakes",
        icon: Calendar,
        scope: [
          "admin:*",
          "admissions.view",
          "admissions.manage_intakes",
          "academic.write",
          "academic:write",
          "academic.manage",
        ],
      },
    ],
  },
  {
    title: "People",
    href: "/people",
    icon: Users,
    scope: "persons.view",
    children: [
      {
        title: "Persons",
        href: "/people/persons",
        icon: Users,
        scope: ["persons.view", "persons.manage"],
      },
      {
        title: "Staff",
        href: "/people/staff",
        icon: UserCheck,
        scope: ["staff.view_assignments", "staff.manage_assignments"],
      },
    ],
  },
  {
    title: "Organization",
    href: "/organization",
    icon: Building2,
    scope: [
      "governance.view",
      "organization.manage_divisions",
      "governance.manage_boards",
    ],
    children: [
      {
        title: "Divisions",
        href: "/organization/divisions",
        icon: Building,
        scope: ["organization.manage_divisions", "governance.manage"],
      },
      {
        title: "Governance",
        href: "/organization/governance",
        icon: Shield,
        scope: ["governance.view", "governance.manage_boards"],
      },
    ],
  },
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle,
    scope: "support.view",
    children: [
      {
        title: "FAQs",
        href: "/support/faqs",
        icon: MessageSquare,
        scope: "support.manage_faqs",
      },
    ],
  },
  { title: "Media", href: "/media", icon: Image, scope: "media.view" },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    scope: ["analytics.view", "analytics.manage"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    scope: "settings.manage",
  },
];

const researchNavigation: NavItem[] = [
  { title: "Dashboard", href: "/research", icon: LayoutDashboard },
  {
    title: "Main Research",
    href: "/research/main",
    icon: FlaskConical,
    scope: ["research.view", "research.view_projects", "research.manage_projects"],
    children: [
      {
        title: "Projects",
        href: "/research/projects",
        icon: FlaskConical,
        scope: ["research.view_projects", "research.manage_projects"],
      },
      {
        title: "Centers",
        href: "/research/centers",
        icon: Building2,
        scope: ["research.view", "research.manage_projects"],
      },
      {
        title: "Programs",
        href: "/research/programs",
        icon: FlaskConical,
        scope: ["research.view", "research.manage_projects"],
      },
      {
        title: "Fundings",
        href: "/research/fundings",
        icon: HandCoins,
        scope: ["research.view", "funding.manage"],
        children: [
          {
            title: "Donations",
            href: "/research/donations",
            icon: HandCoins,
            scope: ["research.view", "donations.manage", "donations.view"],
          },
        ],
      },
      {
        title: "Impact",
        href: "/research/impact",
        icon: Leaf,
        scope: ["research.view", "research.manage_impact", "sustainability.manage"],
      },
      {
        title: "Publications",
        href: "/research/publications",
        icon: BookOpen,
        scope: ["research.view", "research.manage_publications", "publications.manage"],
      },
      {
        title: "Journals",
        href: "/research/publications/journals",
        icon: BookOpen,
        scope: ["research.view", "research.manage_publications", "publications.manage"],
      },
      {
        title: "Partnerships",
        href: "/research/partnerships",
        icon: HeartHandshake,
        scope: ["research.view", "partnerships.manage", "partnerships.manage_partners"],
      },
      {
        title: "Innovation & Output",
        href: "/research/innovations",
        icon: Lightbulb,
        scope: ["research.view", "innovation.review_disclosure", "innovation.manage_ecosystem", "research.manage_reports"],
      },
      {
        title: "Reports",
        href: "/research/reports",
        icon: FileText,
        scope: ["research.view", "research.manage_reports", "research.submit_reports"],
      },
      {
        title: "Themes",
        href: "/research/themes",
        icon: Leaf,
        scope: ["research.view", "research.manage_projects"],
      },
    ],
  },
  {
    title: "Research Content",
    href: "/research/content",
    icon: Newspaper,
    scope: ["research.view", "content.view"],
    children: [
      { title: "News", href: "/research/content/news", icon: Newspaper, scope: ["research.view", "content.manage_news"] },
      { title: "Blogs", href: "/research/content/blogs", icon: FileText, scope: ["research.view", "content.manage_blogs"] },
      { title: "Events", href: "/research/content/events", icon: Calendar, scope: ["research.view", "content.manage_events"] },
      { title: "Announcements", href: "/research/content/announcements", icon: Megaphone, scope: ["research.view", "content.manage_announcements"] },
      { title: "Sliders", href: "/research/content/sliders", icon: Image, scope: ["research.view", "marketing.manage_sliders"] },
      { title: "Boards", href: "/research/content/boards", icon: Shield, scope: ["research.view", "governance.manage"] },
      { title: "Staff", href: "/research/content/staff", icon: Users, scope: ["research.view", "staff.manage", "people.manage"] },
      { title: "Gallery", href: "/research/content/gallery", icon: Image, scope: ["research.view", "media.manage", "media.upload"] },
    ],
  },
  {
    title: "Sustainability",
    href: "/research/sustainability",
    icon: Leaf,
    scope: ["research.view", "sustainability.view", "sustainability.manage"],
    children: [
      { title: "Projects", href: "/research/sustainability/projects", icon: FlaskConical },
      { title: "Partners", href: "/research/sustainability/partners", icon: HeartHandshake },
      { title: "Activities", href: "/research/sustainability/activities", icon: Calendar },
      { title: "Content", href: "/research/content", icon: Newspaper },
    ],
  },
  {
    title: "University Farm",
    href: "/research/farm",
    icon: Sprout,
    scope: ["research.view", "research.manage_projects"],
    children: [
      { title: "Farm Profiles", href: "/research/farm/farms", icon: Sprout },
      { title: "Projects", href: "/research/farm/projects", icon: FlaskConical },
      { title: "Partnerships", href: "/research/farm/partnerships", icon: HeartHandshake },
      { title: "Impact Stories", href: "/research/farm/impact-stories", icon: FileText },
      { title: "Activities", href: "/research/farm/activities", icon: Calendar },
      { title: "Focus Areas", href: "/research/farm/focus-areas", icon: Leaf },
    ],
  },
  {
    title: "Capacity Building",
    href: "/research/capacity",
    icon: GraduationCap,
    scope: ["research.view", "training_program.manage", "scholarship.manage"],
    children: [
      { title: "Training Programs", href: "/research/capacity/training", icon: GraduationCap },
      { title: "Mentorship Programs", href: "/research/capacity/mentorship", icon: UserCheck },
      { title: "Mentorship Applications", href: "/research/capacity/mentorship-applications", icon: FileText },
      { title: "Mentorship Matches", href: "/research/capacity/mentorship-matches", icon: UserCheck },
      { title: "Scholarships", href: "/research/capacity/scholarships", icon: BookOpen },
      { title: "Scholarship Applications", href: "/research/capacity/scholarship-applications", icon: FileText },
      { title: "Consultancies", href: "/research/capacity/consultancies", icon: MessageSquare },
    ],
  },
  {
    title: "Settings",
    href: "/research/settings",
    icon: Settings,
    scope: ["research.view", "research.manage_guidelines", "donations.settings"],
    children: [
      {
        title: "Research Office",
        href: "/research/office",
        icon: Building2,
        scope: ["research.view", "research.manage_office"],
      },
      {
        title: "Office Staff",
        href: "/research/office/staff",
        icon: UserCheck,
        scope: ["research.view", "research.manage_office"],
      },
      {
        title: "General Settings",
        href: "/research/settings/general",
        icon: Settings,
        scope: ["research.view", "research.manage_guidelines", "donations.settings"],
      },
      {
        title: "Resources",
        href: "/research/settings/resources",
        icon: FileText,
        scope: ["research.view", "research.manage_guidelines"],
      },
      {
        title: "Services",
        href: "/research/settings/services",
        icon: MessageSquare,
        scope: ["research.view", "research.manage_guidelines"],
      },
      {
        title: "Guidelines",
        href: "/research/settings/guidelines",
        icon: FileText,
        scope: ["research.view", "research.manage_guidelines"],
      },
      {
        title: "Boards",
        href: "/research/settings/boards",
        icon: Building2,
        scope: ["research.view", "research.manage_office"],
      },
      {
        title: "Board Members",
        href: "/research/settings/board-members",
        icon: UserCheck,
        scope: ["research.view", "research.manage_office"],
      },
      {
        title: "Sliders",
        href: "/research/settings/sliders",
        icon: Image,
        scope: ["research.view", "content.manage"],
      },
    ],
  },
];

const libraryNavigation: NavItem[] = [
  { title: "Dashboard", href: "/library", icon: LayoutDashboard },
  {
    title: "Catalog",
    href: "/library/catalog",
    icon: Library,
    scope: "library.manage_resources",
  },
  {
    title: "Circulation",
    href: "/library/circulation",
    icon: BookOpen,
    scope: "library.manage_loans",
  },
  {
    title: "Patrons",
    href: "/library/patrons",
    icon: Users,
    scope: "library.view",
  },
  {
    title: "Branches",
    href: "/library/branches",
    icon: Building,
    scope: ["library.view", "library.manage_services"],
  },
  {
    title: "Electronic",
    href: "/library/electronic",
    icon: KeyRound,
    scope: ["library.view", "library.manage_resources"],
  },
  {
    title: "Regulations",
    href: "/library/regulations",
    icon: FileText,
    scope: ["library.view", "library.manage_regulations"],
  },
  {
    title: "Guides",
    href: "/library/guides",
    icon: BookOpen,
    scope: ["library.view", "library.manage_services"],
  },
  {
    title: "Specialists",
    href: "/library/specialists",
    icon: UserCheck,
    scope: ["library.view", "library.manage_staff"],
  },
  {
    title: "Workflows",
    href: "/library/workflows",
    icon: Settings,
    scope: ["library.view", "library.manage_services"],
  },
  {
    title: "Policies",
    href: "/library/policies",
    icon: FileText,
    scope: ["library.view", "library.manage_regulations"],
  },
  {
    title: "Inquiries",
    href: "/library/inquiries",
    icon: MessageSquare,
    scope: ["library.view", "library.manage_services"],
  },
  {
    title: "Tickets",
    href: "/library/tickets",
    icon: HelpCircle,
    scope: ["library.view", "library.manage_services"],
  },
  {
    title: "Staff",
    href: "/library/staff",
    icon: UserCheck,
    scope: ["library.manage_staff", "library.view"],
  },
];

const systemNavigation: NavItem[] = [
  { title: "Dashboard", href: "/system", icon: LayoutDashboard },
  {
    title: "Users",
    href: "/system/users",
    icon: Users,
    scope: ["users.view", "users:read"],
  },
  {
    title: "Roles",
    href: "/system/roles",
    icon: Settings,
    scope: ["roles.view", "roles:read"],
  },
  {
    title: "Permissions",
    href: "/system/permissions",
    icon: Shield,
    scope: ["permissions.view", "permissions:read"],
  },
  {
    title: "Audit Logs",
    href: "/system/audit",
    icon: FileText,
    scope: ["audit.view", "audit:read"],
  },
  {
    title: "Settings",
    href: "/system/settings",
    icon: Settings,
    scope: [
      "settings.view",
      "settings.manage",
      "settings:read",
      "settings:write",
    ],
  },
  {
    title: "API Keys",
    href: "/system/settings/api-keys",
    icon: KeyRound,
    scope: [
      "api_keys.view",
      "api_keys.manage",
      "api_keys:read",
      "api_keys:write",
    ],
  },
  {
    title: "Webhooks",
    href: "/system/settings/webhooks",
    icon: Webhook,
    scope: [
      "webhooks.view",
      "webhooks.manage",
      "webhooks:read",
      "webhooks:write",
    ],
  },
  {
    title: "Notifications",
    href: "/system/notifications",
    icon: BellRing,
    scope: [
      "notifications.view",
      "notifications.send",
      "notifications:read",
      "notifications:send",
    ],
  },
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

export function Sidebar({
  service,
  collapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { hasScope } = usePermissions();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set());

  const navigation = useMemo(() => navigationMap[service] || [], [service]);

  const hasItemScope = useCallback((item: NavItem) => {
    if (!item.scope) return true;
    return Array.isArray(item.scope)
      ? item.scope.some((scope) => hasScope(scope))
      : hasScope(item.scope);
  }, [hasScope]);

  const filterNavItem = useCallback(function filter(item: NavItem): NavItem | null {
    const children = item.children
      ?.map(filter)
      .filter((child): child is NavItem => child !== null);
    if (!hasItemScope(item) && (!children || children.length === 0)) {
      return null;
    }
    return children && children.length > 0
      ? { ...item, children }
      : { ...item, children: undefined };
  }, [hasItemScope]);

  const filteredNav = useMemo(
    () => navigation
      .map(filterNavItem)
      .filter((item): item is NavItem => item !== null),
    [filterNavItem, navigation],
  );

  const isNavItemActive = useCallback(function check(item: NavItem): boolean {
    return (
      pathname === item.href ||
      pathname.startsWith(item.href + "/") ||
      Boolean(item.children?.some(check))
    );
  }, [pathname]);

  const hasActiveChild = useCallback((item: NavItem): boolean =>
    Boolean(item.children?.some(isNavItemActive)), [isNavItemActive]);

  useEffect(() => {
    const activeParents = filteredNav
      .filter((item) => item.children?.length && hasActiveChild(item))
      .map((item) => item.href);
    if (activeParents.length === 0) return;
    setExpandedSections((current) => {
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
  }, [filteredNav, hasActiveChild]);

  const toggleExpanded = (href: string) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderChildItems = (children: NavItem[], depth = 0) => (
    <div className={cn("mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-2", depth === 0 ? "ml-5" : "ml-3")}>
      {children.map((child) => {
        const ChildIcon = child.icon;
        const childHasChildren = Boolean(child.children?.length);
        const childIsActive = isNavItemActive(child);
        const childIsExpanded = expandedSections.has(child.href) || hasActiveChild(child);
        const childClassName = cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
          childIsActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        );

        return (
          <div key={child.href}>
            {childHasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpanded(child.href)}
                className={childClassName}
                aria-expanded={childIsExpanded}
              >
                <ChildIcon className="h-3.5 w-3.5" />
                <span className="min-w-0 flex-1 truncate">{child.title}</span>
                {childIsExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <Link
                href={child.href}
                onClick={onMobileClose}
                className={childClassName}
              >
                <ChildIcon className="h-3.5 w-3.5" />
                <span className="min-w-0 flex-1 truncate">{child.title}</span>
              </Link>
            )}
            {childHasChildren && childIsExpanded ? renderChildItems(child.children ?? [], depth + 1) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar",
          "md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <motion.div className="flex h-14 items-center justify-between border-b px-4">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Logo
                  href="/select-service"
                  size="sm"
                  showText
                  variant="icon"
                />
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                Boolean(
                  item.children?.some(
                    (child) =>
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/"),
                  ),
                );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
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
                <div key={item.href}>
                  {item.children && item.children.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                      aria-expanded={expandedSections.has(item.href) || hasActiveChild(item)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {expandedSections.has(item.href) || hasActiveChild(item) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )}
                  {item.children && item.children.length > 0 && (expandedSections.has(item.href) || hasActiveChild(item))
                    ? renderChildItems(item.children)
                    : null}
                </div>
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
                  collapsed && "justify-center px-2",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>
                    {user ? getInitials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/select-service">Switch Service</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profile Settings</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-destructive"
                >
                  <LogOut data-icon="inline-start" />
                  Logout
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
