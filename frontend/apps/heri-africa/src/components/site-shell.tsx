"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const links = [
  ["About", "/about"],
  ["Our Work", "/our-work"],
  ["Research", "/research"],
  ["Our Team", "/team"],
  ["News & Insights", "/news-insights"],
  ["Partner With Us", "/partner-with-us"],
  ["Contact Us", "/contact"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="bg-heri-lime px-6 py-2 text-center text-xs font-semibold text-heri-ink">
        Advancing language education and foundational literacy across Africa
      </div>
      <header className="sticky top-0 z-40 px-4 pt-0 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1370px] items-center justify-between gap-5 rounded-b-[2rem] border border-slate-100 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(8,44,43,0.16)] sm:px-8 lg:gap-8 lg:px-10">
          <Link
            className="flex min-w-0 items-center gap-3 text-heri-blue"
            href="/"
          >
            <span className="hidden items-center gap-2 border-r border-slate-300 pr-4 sm:flex">
              <Image
                src="/logos/ksu-logo.png"
                alt="Kisii University"
                width={42}
                height={42}
                className="size-10 object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-heri-ink">
                KISII
                <br />
                UNIVERSITY
              </span>
            </span>
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              HERI AFRICA{" "}
              <span className="block text-[9px] font-normal tracking-[0.12em] text-heri-teal">
                Language Education Research Chair
              </span>
            </span>
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden gap-5 text-sm font-medium lg:flex"
          >
            {links.map(([label, href]) => (
              <Link
                className="transition-colors hover:text-heri-teal focus:outline-none focus:ring-2 focus:ring-heri-lime"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="rounded-lg border border-heri-teal/20 px-3 py-2 text-sm lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <Link
            className="rounded-full bg-heri-lime px-4 py-2 text-xs font-bold text-heri-ink transition-colors hover:bg-heri-teal hover:text-white focus:outline-none focus:ring-2 focus:ring-heri-teal"
            href="/partner-with-us"
          >
            Partner With Us
          </Link>
        </div>
      </header>
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-b border-heri-teal/15 bg-white px-6 py-4 lg:hidden"
          id="mobile-navigation"
        >
          {links.map(([label, href]) => (
            <Link
              className="block border-b border-heri-teal/10 py-3 text-sm font-medium last:border-0"
              href={href}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <div id="main-content">{children}</div>
      <footer className="bg-heri-blue px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xl font-semibold">HERI AFRICA</p>
            <p className="mt-2 max-w-sm text-sm text-white/75">
              Africa-led language education research hosted by Kisii University.
            </p>
          </div>
          <div className="flex gap-5 text-sm text-white/80">
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
