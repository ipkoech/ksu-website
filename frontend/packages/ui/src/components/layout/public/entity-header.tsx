"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, Home, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { cn } from "../../../lib/utils";

export interface EntityHeaderNavItem {
  label: string;
  href?: string;
  external?: boolean;
  exact?: boolean;
  children?: EntityHeaderNavItem[];
}

export interface EntityHeaderProps {
  eyebrow: string;
  title: string;
  href: string;
  navItems: EntityHeaderNavItem[];
  parentLabel?: string;
  parentHref?: string;
  className?: string;
}

type DropdownFrame = {
  left: number;
  top: number;
  width: number;
};

export function EntityHeader({
  eyebrow,
  title,
  href,
  navItems,
  parentLabel = "Kisii University",
  parentHref = "/",
  className,
}: EntityHeaderProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-300",
        className
      )}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex h-[74px] items-center justify-between gap-4 lg:h-[68px]">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="z-10 flex shrink-0 items-center gap-3 border-0 bg-transparent shadow-none ring-0"
              aria-label="Kisii University home"
            >
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={56}
                height={56}
                className="h-11 w-auto border-0 shadow-none ring-0 sm:h-12"
                priority
              />
            </Link>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Link
                  href={parentHref}
                  className="truncate transition hover:text-primary"
                >
                  {parentLabel}
                </Link>
                <span className="h-1 w-1 shrink-0 rounded-full bg-secondary" />
                <span className="truncate text-secondary">{eyebrow}</span>
              </div>
              <Link
                href={href}
                className="mt-1 block truncate font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground transition hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl"
              >
                {title}
              </Link>
            </div>
          </div>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <EntityHeaderLink
                key={item.href ?? item.label}
                item={item}
                active={isActiveNavItem(pathname, item)}
                open={openDropdown === item.label}
                onOpen={() => setOpenDropdown(item.label)}
                onClose={() => setOpenDropdown(null)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/85 transition hover:bg-accent hover:text-primary"
              aria-label="University home"
            >
              <Home aria-hidden className="h-5 w-5" />
            </Link>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90"
                  aria-label="Open section menu"
                >
                  <Menu aria-hidden className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(22rem,calc(100vw-1rem))] overflow-y-auto p-0"
              >
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="flex items-center gap-3 text-left">
                    <Image
                      src="/logos/ksu-logo.png"
                      alt="Kisii University"
                      width={40}
                      height={40}
                      className="h-10 w-auto border-0 shadow-none ring-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase text-secondary">
                        {eyebrow}
                      </span>
                      <span className="block truncate text-base">{title}</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="border-b px-4 py-3">
                  <Link
                    href={parentHref}
                    className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Home aria-hidden className="h-4 w-4" />
                    {parentLabel}
                  </Link>
                </div>
                <nav aria-label={`${title} navigation`} className="py-3">
                  {navItems.map((item) => (
                    <MobileEntityHeaderLink
                      key={item.href ?? item.label}
                      item={item}
                      active={isActiveNavItem(pathname, item)}
                      onClick={() => setIsMobileOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

function EntityHeaderLink({
  item,
  active,
  open,
  onOpen,
  onClose,
}: {
  item: EntityHeaderNavItem;
  active: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const className = cn(
    "inline-flex min-h-10 items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
    active
      ? "bg-primary/10 text-primary"
      : "text-foreground/85 hover:bg-accent hover:text-foreground"
  );
  const hasDropdown = item.children !== undefined;
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownFrame, setDropdownFrame] = useState<DropdownFrame | null>(
    null,
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const getDropdownFrame = (): DropdownFrame | null => {
    if (!triggerRef.current || typeof window === "undefined") return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const headerRect = triggerRef.current
      .closest("header")
      ?.getBoundingClientRect();
    const gutter = 16;
    const availableWidth = Math.max(280, window.innerWidth - gutter * 2);
    const childCount = item.children?.length ?? 0;
    const targetWidth =
      childCount > 10 ? 1040 : childCount > 5 ? 840 : childCount > 2 ? 640 : 420;
    const width = Math.min(targetWidth, availableWidth);
    const preferredLeft = rect.left + rect.width / 2 - width / 2;
    const maxLeft = Math.max(gutter, window.innerWidth - width - gutter);

    return {
      left: Math.min(Math.max(preferredLeft, gutter), maxLeft),
      top: (headerRect?.height ?? rect.bottom) + 1,
      width,
    };
  };

  const updateDropdownFrame = () => {
    const nextFrame = getDropdownFrame();
    if (nextFrame) {
      setDropdownFrame(nextFrame);
    }
  };

  const openDropdown = () => {
    clearCloseTimeout();
    updateDropdownFrame();
    onOpen();
  };

  const closeDropdown = () => {
    clearCloseTimeout();
    onClose();
  };

  const scheduleCloseDropdown = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      closeTimeoutRef.current = null;
    }, 280);
  };

  useEffect(() => clearCloseTimeout, []);

  useEffect(() => {
    if (!open || !hasDropdown) {
      setDropdownFrame(null);
      return;
    }

    updateDropdownFrame();

    const handleViewportChange = () => updateDropdownFrame();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [hasDropdown, item.children?.length, open]);

  if (hasDropdown) {
    return (
      <div
        ref={triggerRef}
        className="relative"
        onMouseEnter={openDropdown}
        onMouseLeave={scheduleCloseDropdown}
        onFocus={openDropdown}
      >
        <button
          type="button"
          className={className}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => (open ? closeDropdown() : openDropdown())}
        >
          {item.label}
          <ChevronDown
            aria-hidden
            className={cn("h-4 w-4 transition", open && "rotate-180")}
          />
        </button>

        {open && dropdownFrame ? (
          <div
            role="menu"
            className="fixed z-50 rounded-2xl border border-border bg-white p-3 shadow-xl"
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleCloseDropdown}
            style={{
              left: dropdownFrame.left,
              top: dropdownFrame.top,
              width: dropdownFrame.width,
            }}
          >
            {item.children?.length ? (
              <div
                className="grid max-h-[min(31rem,calc(100vh-12rem))] gap-1.5 overflow-y-auto pr-1"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(14rem, 100%), 1fr))",
                }}
              >
                {item.children.map((child) => (
                  <EntityHeaderDropdownLink
                    key={child.href ?? child.label}
                    item={child}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-surface-subtle px-3 py-4 text-sm font-medium text-muted-foreground">
                No departments have been published for this school yet.
              </p>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  if (!item.href) {
    return (
      <span className={cn(className, "cursor-default text-muted-foreground/70")}>
        {item.label}
      </span>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {item.label}
        <ExternalLink aria-hidden className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

function EntityHeaderDropdownLink({ item }: { item: EntityHeaderNavItem }) {
  if (!item.href) {
    return (
      <span className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground">
        {item.label}
      </span>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/85 transition hover:bg-primary/5 hover:text-primary"
      >
        <span className="min-w-0 flex-1 break-words">{item.label}</span>
        <ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0" />
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className="block min-h-10 rounded-xl px-3 py-2 text-sm font-semibold leading-6 text-foreground/85 transition hover:bg-primary/5 hover:text-primary"
    >
      {item.label}
    </Link>
  );
}

function MobileEntityHeaderLink({
  item,
  active,
  onClick,
}: {
  item: EntityHeaderNavItem;
  active: boolean;
  onClick: () => void;
}) {
  if (item.children !== undefined) {
    return (
      <details className="group border-b border-border last:border-b-0">
        <summary
          className={cn(
            "flex min-h-12 cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-semibold transition [&::-webkit-details-marker]:hidden",
            active
              ? "bg-primary/10 text-primary"
              : "text-foreground/85 hover:bg-surface-subtle hover:text-primary",
          )}
        >
          <span>{item.label}</span>
          <ChevronDown
            aria-hidden
            className="h-4 w-4 transition group-open:rotate-180"
          />
        </summary>
        <div className="bg-surface-subtle py-2">
          {item.children.length ? (
            item.children.map((child) => (
              <MobileEntityHeaderChildLink
                key={child.href ?? child.label}
                item={child}
                onClick={onClick}
              />
            ))
          ) : (
            <p className="px-8 py-3 text-sm font-medium text-muted-foreground">
              No departments have been published for this school yet.
            </p>
          )}
        </div>
      </details>
    );
  }

  const className = cn(
    "flex min-h-12 items-center justify-between px-5 py-3 text-sm font-semibold transition",
    active
      ? "bg-primary/10 text-primary"
      : "text-foreground/85 hover:bg-surface-subtle hover:text-primary"
  );

  if (!item.href) {
    return <span className={cn(className, "text-muted-foreground/70")}>{item.label}</span>;
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {item.label}
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function MobileEntityHeaderChildLink({
  item,
  onClick,
}: {
  item: EntityHeaderNavItem;
  onClick: () => void;
}) {
  if (!item.href) {
    return (
      <span className="block px-8 py-2.5 text-sm font-medium text-muted-foreground">
        {item.label}
      </span>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-10 items-center justify-between gap-3 px-8 py-2.5 text-sm font-semibold text-foreground/85 transition hover:text-primary"
        onClick={onClick}
      >
        <span className="min-w-0 flex-1">{item.label}</span>
        <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className="block min-h-10 px-8 py-2.5 text-sm font-semibold text-foreground/85 transition hover:text-primary"
      onClick={onClick}
    >
      {item.label}
    </Link>
  );
}

function isActiveNavItem(
  pathname: string | null,
  item: EntityHeaderNavItem,
): boolean {
  return (
    isActivePath(pathname, item.href, item.exact) ||
    Boolean(item.children?.some((child) => isActiveNavItem(pathname, child)))
  );
}

function isActivePath(pathname: string | null, href?: string, exact = false) {
  if (!pathname) return false;
  if (!href) return false;
  if (href === "/" || exact) return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}
