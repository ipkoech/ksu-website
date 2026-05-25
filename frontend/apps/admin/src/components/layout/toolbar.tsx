"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@ksu/ui/components";
import { Input } from "@ksu/ui/components";
import { Avatar, AvatarFallback, AvatarImage } from "@ksu/ui/components";
import { useAuth } from "@ksu/auth";
import { useSidebar } from "@/hooks/use-sidebar";

export function Toolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle, toggleMobile, isCollapsed } = useSidebar();
  const [search, setSearch] = useState("");

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 md:hidden"
        onClick={toggleMobile}
      >
        <Menu size={20} />
      </Button>

      {/* Toggle sidebar on desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden h-9 w-9 md:flex"
        onClick={toggle}
      >
        {isCollapsed ? (
          <Menu size={20} />
        ) : (
          <Menu size={20} />
        )}
      </Button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/select-service"
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
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Search */}
      <form
        className="relative hidden w-48 lg:block lg:w-64"
        onSubmit={(event) => {
          event.preventDefault();
          const query = search.trim();
          if (query) router.push(`${pathname}?q=${encodeURIComponent(query)}`);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-9 pl-9 pr-4"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      {/* Notifications */}
      <Button asChild variant="ghost" size="icon" className="relative h-9 w-9">
        <Link href="/system/notifications" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Link>
      </Button>

      {/* User menu */}
      {user && (
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 rounded-full border bg-background p-1 pr-3 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-xs">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline-block">
            {user.name}
          </span>
        </Link>
      )}
    </motion.header>
  );
}
