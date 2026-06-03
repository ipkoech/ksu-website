"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";

const researchNavItems = [
  { label: "Home", href: "/" },
  { label: "Research & Innovation", href: "/projects" },
  { label: "Innovation & Commercialization", href: "/innovations" },
  { label: "Partnerships", href: "/partners" },
  { label: "Community Impact", href: "/community-impact" },
  { label: "Resources & Tools", href: "/resources-tools" },
  { label: "Impact & Metrics", href: "/impact-metrics" },
  { label: "Connect & Engage", href: "/connect" },
];

export function ResearchHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex h-[74px] items-center justify-between lg:h-[68px]">
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Kisii University Research home"
          >
            <Image
              src="/logos/ksu-logo.png"
              alt="Kisii University"
              width={56}
              height={56}
              className="h-11 w-auto sm:h-12"
              priority
            />
            <span className="min-w-0">
              <span className="block text-lg font-bold uppercase leading-none text-primary sm:text-2xl lg:text-xl">
                KSU Research
              </span>
              <span className="mt-1 block text-xs font-semibold leading-none text-slate-600 sm:text-sm lg:text-xs">
                Projects, publications & innovation
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 2xl:flex">
            {researchNavItems.map((item) => (
              <HeaderLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                }
              />
            ))}
            <Link
              href="/connect#donate"
              className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90"
            >
              <Heart aria-hidden className="h-4 w-4" />
              Donate
            </Link>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 2xl:hidden"
            aria-label={isOpen ? "Close research menu" : "Open research menu"}
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
          <div className="border-t py-3 2xl:hidden">
            <div className="grid gap-1">
              {researchNavItems.map((item) => (
                <HeaderLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                  }
                  mobile
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <Link
                href="/connect#donate"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground"
              >
                <Heart aria-hidden className="h-4 w-4" />
                Donate
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
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
          ? `${mobile ? "w-full" : ""} inline-flex min-h-11 items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground`
          : `${mobile ? "w-full" : ""} inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950`
      }
    >
      {label}
    </Link>
  );
}
