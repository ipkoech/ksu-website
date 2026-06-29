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
  Leaf,
  Menu,
  Search,
  Sprout,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export function ResearchHeader({
  publicHref = publicFrontendUrl,
}: {
  publicHref?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isScrolled = useScrollState();
  const pathname = usePathname();

  return (
    <>
      <a
        href="#research-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to research content
      </a>

      {/* Utility Bar */}
      <div
        className={cn(
          "hidden border-b border-white/10 bg-secondary text-xs text-white transition-all duration-300 xl:block",
          isScrolled ? "h-0 overflow-hidden py-0" : "h-auto",
        )}
      >
        <div className="flex min-h-10 w-full items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <nav className="flex items-center gap-5" aria-label="Research utility">
            <Link
              href={publicHref}
              className="text-[11px] font-bold tracking-wide transition-colors hover:text-white/90"
            >
              ← MAIN SITE
            </Link>
            <Link
              href="/farm"
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide transition-colors hover:text-white/90"
            >
              <Sprout className="h-3.5 w-3.5" />
              UNIVERSITY FARM
            </Link>
            <Link
              href="/sustainability"
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide transition-colors hover:text-white/90"
            >
              <Leaf className="h-3.5 w-3.5" />
              SUSTAINABILITY
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 rounded-md transition-colors hover:bg-white/10"
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
          "sticky top-0 z-[100] w-full transition-all duration-300 ease-out",
          isScrolled
            ? "bg-primary shadow-lg shadow-primary/20"
            : "bg-primary",
        )}
      >
        <nav
          className="mx-auto flex h-[84px] max-w-[1920px] items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
          aria-label="Research navigation"
        >
          {/* Logo & Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={42}
                height={42}
                className="object-contain brightness-0 invert"
              />
            </motion.div>
            <div className="flex flex-col">
              <p className="font-[family-name:var(--font-display)] text-sm font-black uppercase tracking-[0.12em] text-white sm:text-base">
                Kisii University
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-[10px]">
                Research & Innovation
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
                        "relative rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-tight whitespace-nowrap transition-all",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/90 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                }

                return (
                  <div key={item.title} className="group relative">
                    <button
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-tight whitespace-nowrap transition-all",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/90 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.title}
                      <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:rotate-180 group-hover:opacity-100" />
                    </button>

                    <div
                      className={cn(
                        "absolute top-full pt-3 opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50",
                        index > 2 ? "right-0" : "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                          {/* Featured panel */}
                          <div className="flex flex-col justify-between border-b border-slate-100 bg-slate-50 p-6 md:border-b-0 md:border-r">
                            <div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                                <item.icon className="h-6 w-6" />
                              </div>
                              <h3 className="mt-4 text-lg font-bold text-slate-900">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-slate-500">
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
                                <h4 className="border-b border-slate-100 pb-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
                                      className="block rounded-2xl border border-transparent p-3 transition-all hover:border-slate-100 hover:bg-slate-50 hover:shadow-sm"
                                    >
                                      <p className="text-sm font-bold text-slate-900 transition-colors hover:text-primary">
                                        {sub.title}
                                      </p>
                                      <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-500">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 xl:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Button
              asChild
              className="hidden h-10 rounded-lg px-5 text-sm font-black uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-white sm:inline-flex"
            >
              <Link href="/donate" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Donate
              </Link>
            </Button>

            {/* Mobile Menu */}
            <div className="flex items-center gap-1 xl:hidden">
              <Button
                asChild
                size="sm"
                className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-white sm:hidden"
              >
                <Link href="/donate" className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  Donate
                </Link>
              </Button>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  >
                    <AnimatePresence mode="wait">
                      {mobileOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-6 w-6" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-6 w-6" />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                        Research & Innovation
                      </p>
                    </div>
                  </div>

                  <nav
                    className="flex flex-col gap-6 px-4 pt-6"
                    aria-label="Mobile research navigation"
                  >
                    {/* Mobile Search */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search publications, projects..."
                        className="h-9 border-slate-200 bg-slate-50 pl-9 text-sm text-slate-900 placeholder:text-slate-400"
                      />
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
                                  : "text-slate-700 hover:bg-slate-50 hover:text-primary",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-6 w-6",
                                  isActive ? "text-white" : "text-slate-400",
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
                                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary"
                                    >
                                      <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
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
                    <div className="space-y-4 border-t border-slate-200 pt-6">
                      <Link
                        href={publicHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-primary"
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
                          Donate
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
        <DialogContent className="max-w-[580px] border border-slate-200 bg-white p-0 shadow-2xl">
          <DialogTitle className="sr-only">Search Research</DialogTitle>
          <div className="p-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search publications, projects, grants..."
                className="h-12 rounded-lg border-slate-200 bg-slate-50 pl-12 text-base placeholder:text-slate-400 focus:border-primary"
                autoFocus
              />
            </div>
            <div className="mt-8">
              <h4 className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${term.toLowerCase()}`}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
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
