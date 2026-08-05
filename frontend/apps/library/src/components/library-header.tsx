"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { LibraryTodayHours } from "@ksu/api-client";

const primaryNavItems = [
  { label: "Catalog", href: "/catalog" },
  { label: "E-resources", href: "/electronic" },
  { label: "Guides", href: "/guides" },
  { label: "Services", href: "/services" },
  { label: "Ask", href: "/ask" },
  { label: "Repository", href: "/repositories" },
  { label: "Hours", href: "/hours" },
  { label: "About", href: "/about" },
];

const secondaryNavItems = [
  { label: "Specialists", href: "/specialists" },
  { label: "Borrowing", href: "/borrowing" },
  { label: "Remote Access", href: "/remote-access" },
  { label: "Digital Scholarship", href: "/digital-scholarship" },
  { label: "Policies", href: "/policies" },
  { label: "Downloads", href: "/downloads" },
  { label: "Staff", href: "/staff" },
  { label: "Leadership", href: "/leadership" },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Articles", href: "/articles" },
];

const libraryNavItems = [...primaryNavItems, ...secondaryNavItems];

export function LibraryHeader({
  todayHours = null,
}: {
  todayHours?: LibraryTodayHours | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreActive = secondaryNavItems.some((item) => isActive(pathname, item.href));

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 shadow-[0_12px_36px_-32px_rgba(30,64,175,0.55)] backdrop-blur-md">
      <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex min-h-[76px] items-center justify-between gap-3 py-3 lg:min-h-[82px]">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 shrink items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:shrink-0"
            aria-label="Kisii University Library home"
          >
            <Image
              src="/logos/ksu-logo.png"
              alt="Kisii University"
              width={56}
              height={56}
              className="h-11 w-auto shrink-0 sm:h-12 lg:h-12"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-display)] text-base font-bold uppercase leading-none text-primary sm:text-xl lg:text-xl">
                Kisii University
              </span>
              <span className="mt-1 block truncate text-xs font-semibold leading-none text-slate-600 sm:text-sm lg:text-xs">
                Library
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 items-center gap-0.5 xl:flex">
            {primaryNavItems.map((item) => (
              <HeaderLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
              />
            ))}
            <div className="relative">
              <button
                type="button"
                className={
                  moreActive || isMoreOpen
                    ? "inline-flex min-h-11 items-center gap-1 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
                    : "inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary"
                }
                aria-haspopup="menu"
                aria-expanded={isMoreOpen}
                onClick={() => setIsMoreOpen((current) => !current)}
              >
                More
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 transition ${isMoreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMoreOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl"
                >
                  {secondaryNavItems.map((item) => (
                    <HeaderLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      active={isActive(pathname, item.href)}
                      menu
                      onClick={() => setIsMoreOpen(false)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary"
            aria-label="Search library"
            title={todayHours?.is_open ? "Library open now" : "View library hours"}
          >
            <Search aria-hidden className="h-5 w-5" />
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary xl:hidden"
            aria-label={isOpen ? "Close library menu" : "Open library menu"}
            aria-expanded={isOpen}
            onClick={() => {
              setIsOpen((current) => !current);
              setIsMoreOpen(false);
            }}
          >
            {isOpen ? (
              <X aria-hidden className="h-5 w-5" />
            ) : (
              <Menu aria-hidden className="h-5 w-5" />
            )}
          </button>
        </div>

        {isOpen ? (
          <div className="max-h-[calc(100dvh-96px)] overflow-y-auto border-t border-primary/10 py-3 xl:hidden">
            <div className="grid gap-1 sm:grid-cols-2">
              {libraryNavItems.map((item) => (
                <HeaderLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActive(pathname, item.href)}
                  mobile
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

function HeaderLink({
  href,
  label,
  active,
  mobile,
  menu,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
  menu?: boolean;
  onClick?: () => void;
}) {
  const widthClass = mobile || menu ? "w-full" : "";
  const shapeClass = menu ? "rounded-md" : "rounded-full";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={
        active
          ? `${widthClass} ${shapeClass} inline-flex min-h-11 items-center px-3 py-2 text-sm font-semibold text-primary ${menu ? "bg-primary/5" : "bg-primary/10"}`
          : `${widthClass} ${shapeClass} inline-flex min-h-11 items-center px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary`
      }
    >
      {label}
    </Link>
  );
}
