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
  Menu,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@ksu/ui/components";
import { Dialog, DialogContent, DialogTitle } from "@ksu/ui/components";
import { Input } from "@ksu/ui/components";
import { Button } from "@ksu/ui/components";
import { institutionLinks } from "../config/institution";

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
          <Link href={publicHref} className="text-[11px] font-semibold hover:underline">Main University</Link>
          <nav className="flex items-center gap-5" aria-label="Research utility">
            <Link href="/farm" className="text-[11px] font-semibold hover:underline">University Farm</Link>
            <a href="https://innovationweek.kisiiuniversity.ac.ke/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline">Innovation Lobby<span className="sr-only"> (opens in a new tab)</span></a>
            <Link href={institutionLinks.nacosti} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline">Apply NACOSTI</Link>
            <Link href="/donate" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-secondary px-3 text-[11px] font-semibold text-white transition hover:bg-secondary/90">
              <Heart aria-hidden className="h-3.5 w-3.5" />
              Support Research
            </Link>
            <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Search">
              <Search aria-hidden className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-[100] w-full border-b border-border transition-all duration-300 ease-out",
          isScrolled
            ? "bg-background/95 shadow-lg shadow-primary/10 backdrop-blur"
            : "bg-background",
        )}
      >
        <nav
          className="mx-auto flex min-h-[104px] max-w-[1920px] items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
          aria-label="Research navigation"
        >
          {/* Logo & Brand */}
          <Link href="/" className="group flex min-w-0 items-center gap-3 py-3 sm:shrink-0 sm:gap-4">
            <motion.div
              className="shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={76}
                height={76}
                className="h-16 w-16 object-contain sm:h-[76px] sm:w-[76px]"
              />
            </motion.div>
            <div className="flex min-w-0 flex-col">
              <p className="font-[family-name:var(--font-display)] text-xl font-normal not-italic uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
                Kisii University
              </p>
              <p className="mt-1 max-w-[220px] font-sans text-[10px] font-normal not-italic uppercase leading-[1.5] tracking-normal text-primary sm:max-w-[280px] sm:text-xs">
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
                        "relative rounded-lg px-3 py-2 text-xs font-normal uppercase tracking-normal whitespace-nowrap transition-all 2xl:px-4 2xl:text-sm",
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
                        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-normal uppercase tracking-normal whitespace-nowrap transition-all 2xl:px-4 2xl:text-sm",
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
                        "invisible absolute top-full z-50 w-max -translate-y-2 pt-3 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                        isOpen ? "visible translate-y-0 opacity-100" : undefined,
                        index > 2 ? "right-0" : "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <div className="overflow-hidden rounded-2xl ring-1 ring-primary/10 bg-white shadow-2xl">
                        <div className="grid grid-cols-1">
                          {/* Sub-items */}
                          <div className="grid gap-6 p-5" style={{ gridTemplateColumns: `repeat(${item.columns.length}, minmax(180px, 1fr))` }}>
                            {item.columns.map((col, colIdx) => (
                              <div key={col.heading} className="space-y-1">
                                <h4 className="border-b border-border pb-3 mb-2 text-xs font-normal uppercase tracking-[0.18em] text-secondary">
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
                                      <p className="text-sm font-normal text-foreground transition-colors hover:text-primary">
                                        {sub.title}
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

          {/* Mobile Menu */}
          <div className="flex shrink-0 items-center xl:hidden">
            <div className="flex items-center gap-1">
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
                                "flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-normal uppercase transition-all",
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
                        className="h-12 w-full rounded-lg text-sm font-black uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-foreground"
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
