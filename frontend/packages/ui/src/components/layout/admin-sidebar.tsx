"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Users, Building2, GraduationCap, Newspaper,
    Calendar, Settings, ChevronDown, ChevronsRight,
    Bell, Shield, FileText, School, Globe, Briefcase,
    UserCog, BarChart3, MessageSquare, ImageIcon, LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface NavItem {
    icon: LucideIcon;
    title: string;
    href: string;
    badge?: number;
    requiredScope?: string;
    children?: NavItem[];
}

const navigationConfig: NavItem[] = [
    { icon: Home, title: "Dashboard", href: "/dashboard" },
    {
        icon: Newspaper,
        title: "Content",
        href: "/content",
        requiredScope: "content:read",
        children: [
            { icon: Newspaper, title: "News", href: "/content/news", requiredScope: "content:manage_news" },
            { icon: FileText, title: "Blogs", href: "/content/blogs", requiredScope: "content:manage_blog" },
            { icon: Bell, title: "Announcements", href: "/content/announcements", requiredScope: "content:manage_announcements" },
            { icon: Calendar, title: "Events", href: "/content/events", requiredScope: "content:manage_events" },
            { icon: ImageIcon, title: "Sliders", href: "/content/sliders", requiredScope: "marketing:manage_sliders" },
        ]
    },
    {
        icon: Building2,
        title: "Organization",
        href: "/organization",
        requiredScope: "organization:read",
        children: [
            { icon: Building2, title: "Divisions", href: "/organization/divisions" },
            { icon: Briefcase, title: "Wings", href: "/organization/wings" },
            { icon: Shield, title: "Governance", href: "/organization/governance" },
        ]
    },
    {
        icon: School,
        title: "Academic",
        href: "/academic",
        requiredScope: "academic:read",
        children: [
            { icon: Globe, title: "Campuses", href: "/academic/campuses" },
            { icon: School, title: "Schools", href: "/academic/schools" },
            { icon: Building2, title: "Departments", href: "/academic/departments" },
            { icon: GraduationCap, title: "Programmes", href: "/academic/programmes" },
        ]
    },
    {
        icon: GraduationCap,
        title: "Admissions",
        href: "/admissions",
        requiredScope: "admissions:read",
        children: [
            { icon: Calendar, title: "Intakes", href: "/admissions/intakes" },
            { icon: FileText, title: "Applications", href: "/admissions/applications" },
        ]
    },
    {
        icon: Users,
        title: "People",
        href: "/people",
        requiredScope: "staff:read",
        children: [
            { icon: Users, title: "Persons", href: "/people/persons" },
            { icon: UserCog, title: "Staff", href: "/people/staff" },
            { icon: GraduationCap, title: "Alumni", href: "/people/alumni" },
        ]
    },
    {
        icon: MessageSquare,
        title: "Marketing",
        href: "/marketing",
        requiredScope: "marketing:read",
        children: [
            { icon: MessageSquare, title: "Testimonials", href: "/marketing/testimonials" },
            { icon: FileText, title: "Newsletters", href: "/marketing/newsletters" },
            { icon: Globe, title: "Social Posts", href: "/marketing/social-posts" },
        ]
    },
    {
        icon: BarChart3,
        title: "Reports",
        href: "/reports",
        requiredScope: "analytics:view",
    },
    {
        icon: Settings,
        title: "Settings",
        href: "/settings",
        requiredScope: "system:admin",
        children: [
            { icon: Settings, title: "General", href: "/settings/general" },
            { icon: Shield, title: "API Keys", href: "/settings/api-keys" },
            { icon: Bell, title: "Webhooks", href: "/settings/webhooks" },
        ]
    },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    className?: string;
    hasScope: (scope: string) => boolean;
}

export function AdminSidebar({ isCollapsed, onToggleCollapse, className, hasScope }: AdminSidebarProps) {
    const pathname = usePathname();
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

    const handleSubmenuToggle = (title: string) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const NavItemComponent = ({ item }: { item: NavItem }) => {
        const isActive = pathname.startsWith(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isSubmenuOpen = openSubmenus[item.title];

        if (item.requiredScope && !hasScope(item.requiredScope)) {
            return null;
        }

        const itemContent = (
            <div className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary"
            )}>
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                    <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                            <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {item.badge}
                            </span>
                        )}
                        {hasChildren && (
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isSubmenuOpen && "rotate-180")} />
                        )}
                    </>
                )}
            </div>
        );

        if (hasChildren) {
            return (
                <div>
                    <button
                        onClick={() => handleSubmenuToggle(item.title)}
                        className="w-full text-left"
                    >
                        {itemContent}
                    </button>
                    <AnimatePresence>
                        {!isCollapsed && isSubmenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 space-y-1 pl-6"
                            >
                                {item.children?.map((child) => (
                                    child.requiredScope && !hasScope(child.requiredScope) ? null : (
                                        <Link key={child.href} href={child.href} className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                            pathname === child.href && "bg-muted text-primary"
                                        )}>
                                            <child.icon className="h-4 w-4" />
                                            <span>{child.title}</span>
                                        </Link>
                                    )
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <Link href={item.href} className="w-full">
                {itemContent}
            </Link>
        );
    };

    return (
        <motion.div
            initial={{ width: isCollapsed ? 80 : 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "relative h-full border-r border-border bg-card transition-width duration-200 ease-in-out",
                className
            )}
        >
            <div className="flex h-16 items-center justify-center border-b border-border px-4">
                {!isCollapsed ? (
                    <h1 className="text-xl font-semibold text-primary">KSU Admin</h1>
                ) : (
                    <School className="h-6 w-6 text-primary" />
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-4 top-4 rounded-full border border-border bg-background shadow-md hidden lg:flex"
                    onClick={onToggleCollapse}
                >
                    <ChevronsRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </Button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-4">
                <ul className="grid gap-1">
                    {navigationConfig.map((item) => (
                        <li key={item.title}>
                            <NavItemComponent item={item} />
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
}
