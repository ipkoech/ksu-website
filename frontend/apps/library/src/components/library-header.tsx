"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";

type LibraryNavItem = {
  label: string;
  href: string;
  description?: string;
};

type LibraryNavGroup = {
  label: string;
  href: string;
  items: LibraryNavItem[];
};

const libraryNavGroups: LibraryNavGroup[] = [
  {
    label: "Discovery",
    href: "/catalog",
    items: [
      {
        label: "Catalog",
        href: "/catalog",
        description: "Print, branch, and shelf-held library records.",
      },
      {
        label: "E-resources",
        href: "/electronic",
        description: "Databases, e-books, journals, and online platforms.",
      },
      {
        label: "Repository & access links",
        href: "/electronic#external-links",
        description: "Institutional repository, OPAC, and off-campus access.",
      },
      {
        label: "Documents & forms",
        href: "/electronic#downloads",
        description: "Guides, forms, and library documents.",
      },
    ],
  },
  {
    label: "Services",
    href: "/services",
    items: [
      {
        label: "Library Services",
        href: "/services",
        description: "Borrowing, research support, training, and user services.",
      },
      {
        label: "Ask a Librarian",
        href: "/ask",
        description: "Send a question to the library team.",
      },
      {
        label: "Contact & Hours",
        href: "/contact",
        description: "Branch contacts, inquiries, and opening hours.",
      },
    ],
  },
  {
    label: "People & About",
    href: "/about",
    items: [
      {
        label: "About",
        href: "/about",
        description: "Library mandate, branches, and service context.",
      },
      {
        label: "Leadership",
        href: "/about#leadership",
        description: "Library leadership and governance records.",
      },
      {
        label: "Staff directory",
        href: "/about#staff",
        description: "Find library staff and subject support contacts.",
      },
    ],
  },
  {
    label: "Updates",
    href: "/updates",
    items: [
      {
        label: "News",
        href: "/updates",
        description: "Library notices and service updates.",
      },
      {
        label: "Events",
        href: "/updates?type=events",
        description: "Training, workshops, and library events.",
      },
      {
        label: "Articles",
        href: "/updates?type=articles",
        description: "Learning articles and library guidance.",
      },
    ],
  },
];

export function LibraryHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(false);
    setOpenGroup(null);
  }, [pathname]);

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
              className="h-11 w-11 shrink-0 sm:h-12 sm:w-12 lg:h-12 lg:w-12"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-display)] text-base font-bold uppercase leading-none text-primary sm:text-xl lg:text-xl">
                Kisii University
              </span>
              <span className="mt-1 block truncate text-xs font-semibold leading-none text-muted-foreground sm:text-sm lg:text-xs">
                Library
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 items-center gap-1 xl:flex">
            {libraryNavGroups.map((group) => (
              <HeaderGroup
                key={group.label}
                group={group}
                active={isActiveGroup(pathname, group)}
                open={openGroup === group.label}
                onToggle={() =>
                  setOpenGroup((current) =>
                    current === group.label ? null : group.label,
                  )
                }
                onClose={() => setOpenGroup(null)}
              />
            ))}
          </div>

          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary"
            aria-label="Search library"
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
              setOpenGroup(null);
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
            <div className="grid gap-3 sm:grid-cols-2">
              {libraryNavGroups.map((group) => (
                <section key={group.label} className="rounded-lg border border-border bg-white p-3">
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    {group.label}
                  </p>
                  <div className="mt-2 grid gap-1">
                    {group.items.map((item) => (
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
                </section>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0].split("?")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

function isActiveGroup(pathname: string, group: LibraryNavGroup) {
  return group.items.some((item) => isActive(pathname, item.href));
}

function HeaderGroup({
  group,
  active,
  open,
  onToggle,
  onClose,
}: {
  group: LibraryNavGroup;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        className={
          active || open
            ? "inline-flex min-h-11 items-center gap-1 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            : "inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-border bg-white p-2 shadow-xl"
        >
          <div className="grid gap-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={onClose}
                className="block rounded-md px-3 py-3 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <span className="block text-sm font-semibold text-foreground">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
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
  const shapeClass = "rounded-md";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={
        active
          ? `${widthClass} ${shapeClass} inline-flex min-h-11 items-center px-3 py-2 text-sm font-semibold text-primary ${menu ? "bg-primary/5" : "bg-primary/10"}`
          : `${widthClass} ${shapeClass} inline-flex min-h-11 items-center px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary`
      }
    >
      {label}
    </Link>
  );
}
