"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import heriLogo from "../../public/logos/heri-africa-logo.svg";

type NavItem = {
  label: string;
  href: string;
  children?: readonly (readonly [string, string])[];
};

export const siteLinks: readonly NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      ["Who We Are", "/about"],
      ["Our Team", "/team"],
      ["Our Partners", "/partners"],
    ],
  },
  {
    label: "Our Work",
    href: "/our-work",
    children: [
      ["Our Focus", "/our-work"],
      ["Research", "/research"],
    ],
  },
  {
    label: "News & Insights",
    href: "/news-insights",
    children: [["News & Events", "/news-insights"], ["Events", "/events"]],
  },
];

const joinLinks = [
  ["Partner With Us", "/partner-with-us"],
  ["Contact Us", "/contact"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
        <div className="mx-auto flex max-w-[1370px] items-center justify-between gap-5 rounded-b-[2rem] border border-slate-100 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(8,44,43,0.16)] sm:px-8 sm:py-6 lg:gap-8 lg:px-10">
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
                className="size-12 object-contain"
              />
              <span className="text-xs font-semibold leading-tight text-heri-ink">
                KISII
                <br />
                UNIVERSITY
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Image
                src={heriLogo}
                alt="HERI Africa — Harnessing Education Research for Impact in Africa"
                className="h-16 w-auto shrink-0"
                priority
                unoptimized
              />
              <span className="hidden text-[9px] font-normal uppercase tracking-[0.12em] text-heri-teal xl:block">
                Language Education
                <br />
                Research Chair
              </span>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {siteLinks.map((item) =>
              item.children ? (
                <details
                  className="group relative"
                  key={item.href}
                  open={openMenu === item.href}
                  onToggle={(event) => {
                    const details = event.currentTarget;
                    if (details.open) setOpenMenu(item.href);
                    else if (openMenu === item.href) setOpenMenu(null);
                  }}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-1 transition-colors hover:text-heri-teal focus:outline-none focus:ring-2 focus:ring-heri-lime [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <span className="text-[10px] transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="absolute left-1/2 top-full z-50 mt-4 min-w-48 -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                    {item.children.map(([label, href]) => (
                      <Link
                        className="block rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-heri-cream hover:text-heri-teal focus:outline-none focus:ring-2 focus:ring-heri-lime"
                        href={href}
                        key={href}
                        onClick={() => setOpenMenu(null)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  className="transition-colors hover:text-heri-teal focus:outline-none focus:ring-2 focus:ring-heri-lime"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ),
            )}
            <details
              className="group relative"
              open={openMenu === "join-us"}
              onToggle={(event) => {
                const details = event.currentTarget;
                if (details.open) setOpenMenu("join-us");
                else if (openMenu === "join-us") setOpenMenu(null);
              }}
            >
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-heri-lime px-4 py-2 text-xs font-bold text-heri-ink transition-colors hover:bg-heri-teal hover:text-white focus:outline-none focus:ring-2 focus:ring-heri-teal [&::-webkit-details-marker]:hidden">
                Join Us <span className="text-[10px] transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="absolute right-0 top-full z-50 mt-3 min-w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                {joinLinks.map(([label, href]) => (
                  <Link className="block rounded-lg px-3 py-2 text-sm font-medium text-heri-ink transition-colors hover:bg-heri-cream hover:text-heri-teal" href={href} key={href} onClick={() => setOpenMenu(null)}>
                    {label}
                  </Link>
                ))}
              </div>
            </details>
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
          <Link className="rounded-full bg-heri-lime px-4 py-2 text-xs font-bold text-heri-ink transition-colors hover:bg-heri-teal hover:text-white focus:outline-none focus:ring-2 focus:ring-heri-teal lg:hidden" href="/partner-with-us">
            Join Us
          </Link>
        </div>
      </header>
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-b border-heri-teal/15 bg-white px-6 py-4 lg:hidden"
          id="mobile-navigation"
        >
          {siteLinks.map((item) => (
            <div className="border-b border-heri-teal/10 last:border-0" key={item.href}>
              <Link className="block py-3 text-sm font-medium" href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
              {item.children?.map(([label, href]) => (
                <Link className="block py-2 pl-4 text-sm text-heri-ink/70" href={href} key={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-2">
            {joinLinks.map(([label, href]) => (
              <Link className="block py-2 text-sm font-medium text-heri-teal" href={href} key={href} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
