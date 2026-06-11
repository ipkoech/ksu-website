"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

const libraryNavItems = [
  { label: "Overview", href: "/" },
  { label: "About", href: "/about" },
  { label: "Catalog", href: "/catalog" },
  { label: "E-resources", href: "/electronic" },
  { label: "Services", href: "/services" },
  { label: "Ask", href: "/ask" },
  { label: "Branches", href: "/services#branches-heading" },
  { label: "Support", href: "/services#services-heading" },
  { label: "Hours", href: "/hours" },
  { label: "Leadership", href: "/leadership" },
  { label: "Staff", href: "/staff" },
  { label: "Downloads", href: "/downloads" },
];

export function LibraryHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 shadow-[0_12px_36px_-32px_rgba(30,64,175,0.55)] backdrop-blur-md">
      <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex h-[89px] items-center justify-between lg:h-[82px]">
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Kisii University Library home"
          >
            <Image
              src="/logos/ksu-logo.png"
              alt="Kisii University"
              width={56}
              height={56}
              className="h-12 w-auto sm:h-14 lg:h-12"
              priority
            />
            <span className="min-w-0">
              <span className="block text-lg font-bold uppercase leading-none text-primary sm:text-2xl lg:text-xl">
                KSU Library
              </span>
              <span className="mt-1 block text-xs font-semibold leading-none text-slate-600 sm:text-sm lg:text-xs">
                Catalog, e-resources & support
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 2xl:flex">
            {libraryNavItems.map((item) => (
              <HeaderLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>

          <Link
            href="/catalog"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary"
            aria-label="Search library catalog"
          >
            <Search aria-hidden className="h-5 w-5" />
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary 2xl:hidden"
            aria-label={isOpen ? "Close library menu" : "Open library menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X aria-hidden className="h-5 w-5" />
            ) : (
              <Menu aria-hidden className="h-5 w-5" />
            )}
          </button>
        </div>

        {isOpen ? (
          <div className="border-t border-primary/10 py-3 2xl:hidden">
            <div className="grid gap-1">
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
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={
        active
          ? `${mobile ? "w-full" : ""} inline-flex min-h-11 items-center rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary`
          : `${mobile ? "w-full" : ""} inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary`
      }
    >
      {label}
    </Link>
  );
}
