"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowRight, ChevronDown, Clock3, Menu, Search, X } from "lucide-react";
import type { LibraryTodayHours } from "@ksu/api-client";

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
    label: "Search & Find",
    href: "/catalog",
    items: [
      {
        label: "Catalog",
        href: "/catalog",
        description: "Books, journals, theses, and print holdings across branches.",
      },
      {
        label: "E-resources A-Z",
        href: "/electronic",
        description: "Subscribed databases, e-journals, and e-book platforms.",
      },
      {
        label: "Repository & off-campus access",
        href: "/electronic#external-links",
        description: "Institutional repository, OPAC, and remote sign-in.",
      },
      {
        label: "Documents & forms",
        href: "/electronic#downloads",
        description: "Downloadable library guides, forms, and policies.",
      },
    ],
  },
  {
    label: "Get Help",
    href: "/ask",
    items: [
      {
        label: "Ask a Librarian",
        href: "/ask",
        description: "Get an answer from the library team about your research.",
      },
      {
        label: "Library services",
        href: "/services",
        description: "Borrowing, training, and research support at every branch.",
      },
      {
        label: "Remote access help",
        href: "/electronic#external-links",
        description: "Reach subscribed resources from off campus.",
      },
    ],
  },
  {
    label: "Visit",
    href: "/contact",
    items: [
      {
        label: "Contact & hours",
        href: "/contact",
        description: "Opening hours, phone, and email for every branch.",
      },
      {
        label: "Branches",
        href: "/services#branches-heading",
        description: "Find your nearest KSU library and its services.",
      },
      {
        label: "Library regulations",
        href: "/services#regulations-heading",
        description: "Rules that govern borrowing and library use.",
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    items: [
      {
        label: "About the Library",
        href: "/about",
        description: "Mandate, mission, and how the library serves KSU.",
      },
      {
        label: "Leadership",
        href: "/about#leadership",
        description: "The University Librarian and library governance.",
      },
      {
        label: "Staff directory",
        href: "/about#staff",
        description: "Find library staff at your branch.",
      },
    ],
  },
  {
    label: "What's On",
    href: "/updates",
    items: [
      {
        label: "News",
        href: "/updates",
        description: "Service updates and library notices.",
      },
      {
        label: "Events",
        href: "/updates?type=events",
        description: "Workshops, training sessions, and exhibitions.",
      },
      {
        label: "Articles",
        href: "/updates?type=articles",
        description: "Guides and learning articles from librarians.",
      },
    ],
  },
];

const quickLinks = [
  { label: "Ask a Librarian", href: "/ask" },
  { label: "Remote access help", href: "/electronic#external-links" },
];

function todayHoursCopy(todayHours: LibraryTodayHours | null): {
  label: string;
  detail: string;
} {
  if (!todayHours) {
    return { label: "Today's opening hours", detail: "See branch schedules" };
  }
  const times =
    todayHours.opens_at && todayHours.closes_at
      ? `${todayHours.opens_at} - ${todayHours.closes_at}`
      : null;
  if (todayHours.is_closed) {
    return {
      label: "Closed today",
      detail: todayHours.note ?? "See branch schedules",
    };
  }
  if (todayHours.is_open) {
    return { label: "Open now", detail: times ?? "See branch schedules" };
  }
  return {
    label: "Today's hours",
    detail: times ?? "See branch schedules",
  };
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function LibraryHeader({
  todayHours = null,
}: {
  todayHours?: LibraryTodayHours | null;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [condensed, setCondensed] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > 16);
  });

  useEffect(() => {
    setIsOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openGroup]);

  const activePanel = libraryNavGroups.find((group) => group.label === openGroup);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 backdrop-blur-md">
      <nav
        ref={navRef}
        aria-label="Library"
        className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div
          className={`flex items-center justify-between gap-3 transition-[padding] duration-300 ${
            condensed ? "py-2" : "py-3 lg:py-4"
          }`}
        >
          <Link
            href="/"
            className="flex min-h-11 min-w-0 shrink items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:shrink-0"
            aria-label="Kisii University Library home"
          >
            <Image
              src="/logos/ksu-logo.png"
              alt=""
              width={56}
              height={56}
              className={`shrink-0 transition-[height,width] duration-300 ${
                condensed ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"
              }`}
              priority
            />
            <span className="min-w-0 border-l border-border pl-3">
              <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Kisii University
              </span>
              <span className="mt-0.5 block truncate font-[family-name:var(--app-font-display)] text-xl leading-none text-primary sm:text-2xl">
                Library
              </span>
            </span>
          </Link>

          <div
            className="hidden min-w-0 items-center xl:flex"
            onMouseLeave={() => setHoverGroup(null)}
          >
            {libraryNavGroups.map((group) => {
              const active = isActiveGroup(pathname, group);
              const open = openGroup === group.label;
              const underlined =
                hoverGroup === group.label || (!hoverGroup && (open || active));
              return (
                <button
                  key={group.label}
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenGroup((current) =>
                      current === group.label ? null : group.label,
                    )
                  }
                  onMouseEnter={() => {
                    setHoverGroup(group.label);
                    setOpenGroup((current) => (current ? group.label : current));
                  }}
                  className={`relative inline-flex min-h-11 items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    open || active ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                  {underlined ? (
                    <motion.span
                      layoutId={reduce ? undefined : "library-nav-underline"}
                      className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-secondary"
                      transition={{ type: "spring", stiffness: 480, damping: 40 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Search aria-hidden className="h-4 w-4" />
              <span className="hidden lg:inline">Search the library</span>
              <span className="sr-only lg:hidden">Search the library</span>
            </Link>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 xl:hidden"
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
        </div>

        <AnimatePresence>
          {activePanel ? (
            <motion.div
              key={activePanel.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-white shadow-[0_32px_64px_-40px_rgba(15,23,42,0.35)] xl:block"
            >
              <div className="mx-auto grid max-w-[1680px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8 xl:px-10 2xl:px-12">
                <div className="grid content-start gap-1 sm:grid-cols-2">
                  {activePanel.items.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: EASE_OUT,
                        delay: 0.04 + index * 0.03,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenGroup(null)}
                        className="group block rounded-lg px-4 py-4 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-primary">
                          {item.label}
                          <ArrowRight
                            aria-hidden
                            className="h-3.5 w-3.5 text-secondary opacity-0 transition-all motion-safe:-translate-x-1 group-hover:opacity-100 motion-safe:group-hover:translate-x-0"
                          />
                        </span>
                        {item.description ? (
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="border-l border-border pl-8">
                  <p className="font-[family-name:var(--app-font-display)] text-lg text-foreground">
                    Quick help
                  </p>
                  <Link
                    href="/contact#hours"
                    onClick={() => setOpenGroup(null)}
                    className="mt-4 block rounded-lg border border-border p-4 transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock3 aria-hidden className="h-4 w-4 text-secondary" />
                      {todayHoursCopy(todayHours).label}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {todayHoursCopy(todayHours).detail}
                    </span>
                  </Link>
                  <ul className="mt-3 space-y-1">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpenGroup(null)}
                          className="group inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
                        >
                          {link.label}
                          <ArrowRight
                            aria-hidden
                            className="h-3.5 w-3.5 text-secondary opacity-0 transition-all motion-safe:-translate-x-1 group-hover:opacity-100 motion-safe:group-hover:translate-x-0"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={
                reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }
              }
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="overflow-hidden xl:hidden"
            >
              <div className="max-h-[calc(100dvh-96px)] overflow-y-auto border-t border-primary/10 py-4">
                <Link
                  href="/contact#hours"
                  onClick={() => setIsOpen(false)}
                  className="mb-4 flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Clock3 aria-hidden className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">
                    {todayHoursCopy(todayHours).label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {todayHoursCopy(todayHours).detail}
                  </span>
                </Link>
                <div className="grid gap-6 sm:grid-cols-2">
                  {libraryNavGroups.map((group) => (
                    <section key={group.label}>
                      <p className="px-3 font-[family-name:var(--app-font-display)] text-lg text-foreground">
                        {group.label}
                      </p>
                      <div className="mt-2 grid gap-1">
                        {group.items.map((item) => {
                          const active = isActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setIsOpen(false)}
                              className={`inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold transition ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
