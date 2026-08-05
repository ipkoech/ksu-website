"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ksu/ui/lib/utils";
import { publicFrontendUrl } from "../lib/service-urls";
import { researchNavConfig, popularSearches } from "../config/research-nav";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Linkedin,
  Mail,
  Menu,
  MapPin,
  Phone,
  Search,
  X,
  Youtube,
} from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@ksu/ui/components";
import { Dialog, DialogContent, DialogTitle } from "@ksu/ui/components";
import { Input } from "@ksu/ui/components";
import { Button } from "@ksu/ui/components";

function useScrollState() {
const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return isScrolled;
}

const mobileQuickLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Funding", href: "/funding" },
  { label: "Partners", href: "/partners" },
];

export function ResearchHeader({
  publicHref = publicFrontendUrl,
}: {
  publicHref?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const isScrolled = useScrollState();
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "hidden border-b border-white/10 bg-primary text-xs text-white transition-all duration-300 xl:block",
          isScrolled ? "h-0 overflow-hidden py-0" : "h-auto",
        )}
      >
        <div className="flex min-h-9 w-full items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex items-center gap-5 text-[11px] font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Main Campus, Kisii, Kenya
            </span>
            <a href="mailto:research@kisiiuniversity.ac.ke" className="flex items-center gap-1.5 transition hover:text-white/80">
              <Mail className="h-3.5 w-3.5" />
              research@kisiiuniversity.ac.ke
            </a>
            <a href="tel:+254773452323" className="flex items-center gap-1.5 transition hover:text-white/80">
              <Phone className="h-3.5 w-3.5" />
              +254 773 452 323
            </a>
          </div>
          <div className="flex items-center gap-5">
            <nav className="flex items-center gap-5" aria-label="Research utility">
              <Link href="/training" className="text-[11px] font-semibold transition-colors hover:text-white/80">
                Student Portal
              </Link>
              <Link href="https://research-portal.nacosti.go.ke/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold transition-colors hover:text-white/80">
                Apply NACOSTI
              </Link>
              <Link href="/team" className="text-[11px] font-semibold transition-colors hover:text-white/80">
                Staff Portal
              </Link>
              <Link href="/resources-tools" className="text-[11px] font-semibold transition-colors hover:text-white/80">
                Library
              </Link>
              <Link href="/news" className="text-[11px] font-semibold transition-colors hover:text-white/80">
                News & Events
              </Link>
            </nav>
            <span className="h-5 w-px bg-white/25" />
            <div className="flex items-center gap-3">
              <Link href="https://linkedin.com/school/kisiiuniversity" aria-label="Kisii University LinkedIn" className="transition hover:text-white/80">
                <Linkedin className="h-3.5 w-3.5" />
              </Link>
              <Link href="https://twitter.com/kisiiuniversity" aria-label="Kisii University X" className="text-[11px] font-bold transition hover:text-white/80">
                X
              </Link>
              <Link href="https://youtube.com/@kisiiuniversity" aria-label="Kisii University YouTube" className="transition hover:text-white/80">
                <Youtube className="h-3.5 w-3.5" />
              </Link>
              <Link href="https://facebook.com/kisiiuniversity" aria-label="Kisii University Facebook" className="text-[11px] font-bold transition hover:text-white/80">
                f
              </Link>
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex p-1.5 rounded-md transition-colors hover:bg-white/10"
              aria-label="Search research"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-[100] w-full border-b border-border transition-all duration-300 ease-out",
          isScrolled
            ? "bg-white/95 shadow-lg shadow-primary/10 backdrop-blur"
            : "bg-white",
        )}
      >
        <nav
          className="mx-auto flex h-[92px] max-w-[1920px] items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
          aria-label="Research navigation"
        >
          {/* Logo & Brand */}
          <Link href="/" className="group flex max-w-[250px] min-w-0 shrink items-center gap-2 sm:max-w-none sm:gap-3">
            <motion.div
              className="shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={58}
                height={58}
                className="h-12 w-12 object-contain sm:h-[58px] sm:w-[58px]"
              />
            </motion.div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate font-[family-name:var(--app-font-display)] text-base font-normal uppercase tracking-tight text-foreground sm:text-xl">
                Kisii <em className="italic">University</em>
              </p>
              <p className="hidden max-w-[230px] text-[8px] font-bold uppercase leading-4 tracking-[0.1em] text-primary sm:block sm:text-[9px]">
                Research, Extension, Innovation & Resource Mobilization
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden flex-1 justify-center px-4 xl:flex">
            <nav className="flex items-center gap-0.5">
              {researchNavConfig.map((item, index) => {
                const isActive = item.activePaths.some(
                  (p) => pathname === p || pathname.startsWith(p + "/"),
                );
                const hasDropdown = item.columns.length > 0;

                if (!hasDropdown) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative rounded-lg px-3 py-2 text-xs font-bold tracking-tight whitespace-nowrap transition-all 2xl:px-4 2xl:text-sm",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                }

                const isOpen = openDesktopMenu === item.title;

                return (
                  <div
                    key={item.title}
                    className="group relative"
                    onMouseEnter={() => setOpenDesktopMenu(item.title)}
                    onMouseLeave={() => setOpenDesktopMenu(null)}
                    onFocus={() => setOpenDesktopMenu(item.title)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setOpenDesktopMenu(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenDesktopMenu((current) =>
                          current === item.title ? null : item.title,
                        )
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold tracking-tight whitespace-nowrap transition-all 2xl:px-4 2xl:text-sm",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      {item.title}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 opacity-50 transition-transform duration-300 group-hover:rotate-180 group-hover:opacity-100",
                          isOpen ? "rotate-180 opacity-100" : undefined,
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "invisible absolute top-full z-50 -translate-y-2 pt-3 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                        isOpen ? "visible translate-y-0 opacity-100" : undefined,
                        index > 2 ? "right-0" : "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <div className="overflow-hidden rounded-2xl ring-1 ring-primary/10 bg-white shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                          {/* Featured panel */}
                          <div className="flex flex-col justify-between border-b border-border bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] p-6 md:border-b-0 md:border-r">
                            <div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] text-primary ring-1 ring-primary/10">
                                <item.icon className="h-6 w-6" />
                              </div>
                              <h3 className="mt-4 font-[family-name:var(--app-font-display)] text-lg font-normal tracking-tight text-foreground">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                            <Link
                              href={item.href}
                              className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary/80"
                            >
                              Go to section
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>

                          {/* Sub-items */}
                          <div className="grid gap-6 p-6 sm:grid-cols-2 min-w-[400px] lg:min-w-[500px]">
                            {item.columns.map((col, colIdx) => (
                              <div key={col.heading} className="space-y-1">
                                <h4 className="border-b border-border pb-3 mb-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                                  {col.heading}
                                </h4>
                                {col.items.map((sub, sIdx) => (
                                  <motion.div
                                    key={`${col.heading}-${sIdx}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: colIdx * 0.1 + sIdx * 0.05,
                                    }}
                                  >
                                    <Link
                                      href={sub.href}
                                      className="block rounded-2xl border border-transparent p-3 transition-all hover:border-border hover:bg-surface-subtle hover:shadow-sm"
                                    >
                                      <p className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                        {sub.title}
                                      </p>
                                      <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted-foreground">
                                        {sub.description}
                                      </p>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-primary/5 hover:text-primary xl:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Button
              asChild
              className="hidden h-11 rounded-md px-6 text-sm font-bold normal-case tracking-normal bg-secondary hover:bg-secondary/90 text-white sm:inline-flex"
            >
              <Link href="/donate" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Support Research
              </Link>
            </Button>

            {/* Mobile Menu */}
            <div className="flex items-center gap-1 xl:hidden">
              <Button
                asChild
                size="sm"
                className="hidden h-9 w-9 rounded-lg bg-secondary p-0 text-white hover:bg-secondary/90 sm:inline-flex"
              >
                <Link href="/donate" aria-label="Support research">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="sr-only">Support research</span>
                </Link>
              </Button>
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/5 hover:text-primary sm:flex xl:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:w-[400px]"
                >
                  <SheetTitle className="sr-only">
                    Research navigation menu
                  </SheetTitle>

                  {/* Mobile Header */}
                  <div className="flex items-center gap-3 bg-primary px-5 py-4">
                    <Image
                      src="/logos/ksu-logo.png"
                      alt="Kisii University"
                      width={34}
                      height={34}
                      className="object-contain brightness-0 invert"
                    />
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-white">
                        Kisii University
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                        Research, Extension, Innovation & Resource Mobilization
                      </p>
                    </div>
                  </div>

                  <nav
                    className="flex flex-col gap-6 px-4 pt-6"
                    aria-label="Mobile research navigation"
                  >
                    {/* Mobile Search */}
                    <form action="/search" role="search" className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        name="q"
                        type="search"
                        aria-label="Search research"
                        placeholder="Search publications, projects..."
                        className="h-9 border-border bg-surface-subtle pl-9 text-sm text-foreground placeholder:text-muted-foreground/70"
                      />
                    </form>

                    <div>
                      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                        Quick access
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {mobileQuickLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-surface-subtle px-3 text-sm font-bold text-muted-foreground transition hover:border-primary/30 hover:bg-white hover:text-primary"
                          >
                            {link.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-2 pb-10">
                      {researchNavConfig.map((item) => {
                        const isActive = item.activePaths.some(
                          (p) => pathname === p || pathname.startsWith(p + "/"),
                        );
                        const Icon = item.icon;
                        const hasSub = item.columns.some(
                          (c) => c.items.length > 0,
                        );

                        return (
                          <div key={item.title} className="space-y-1">
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-bold transition-all",
                                isActive
                                  ? "bg-primary text-white"
                                  : "text-muted-foreground hover:bg-surface-subtle hover:text-primary",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-6 w-6",
                                  isActive ? "text-white" : "text-muted-foreground/70",
                                )}
                              />
                              {item.title}
                            </Link>

                              {hasSub && (
                                <div className="mt-1 space-y-1 pl-6 pr-4">
                                  {item.columns.flatMap((c) => c.items).map(
                                    (sub, sIdx) => (
                                      <Link
                                        key={`${item.title}-s${sIdx}`}
                                      href={sub.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-primary"
                                    >
                                      <span className="h-1 w-1 shrink-0 rounded-full bg-surface-muted" />
                                      {sub.title}
                                    </Link>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile back link + CTA */}
                    <div className="space-y-4 border-t border-border pt-6">
                      <Link
                        href={publicHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        BACK TO MAIN SITE
                      </Link>
                      <Button
                        asChild
                        className="h-12 w-full rounded-lg text-sm font-black uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-white"
                      >
                        <Link href="/donate">
                          <Heart className="mr-2 h-4 w-4" />
                          Support Research
                        </Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[580px] border border-border bg-white p-0 shadow-2xl">
          <DialogTitle className="sr-only">Search Research</DialogTitle>
          <div className="p-8">
            <form action="/search" role="search" className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                name="q"
                type="search"
                aria-label="Search research"
                placeholder="Search publications, projects, grants..."
                className="h-12 rounded-lg border-border bg-surface-subtle pl-12 text-base placeholder:text-muted-foreground/70 focus:border-primary"
                autoFocus
              />
            </form>
            <div className="mt-8">
              <h4 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${term.toLowerCase()}`}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-xl bg-surface-muted px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-surface-muted active:scale-95"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
