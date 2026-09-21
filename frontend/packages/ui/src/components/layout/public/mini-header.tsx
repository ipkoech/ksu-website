"use client";
import Link from "next/link";
import {
  Mail,
  Phone,
  Search,
  UserRound,
  MessageCircleQuestion,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}

interface MiniHeaderProps {
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  quickLinks?: QuickLink[];
  socialLinks?: Record<string, string | undefined>;
  className?: string;
  supportHref?: string;
}

const defaultQuickLinks: QuickLink[] = [
  {
    label: "HERI AFRICA",
    href:
      process.env.NEXT_PUBLIC_HERI_AFRICA_FRONTEND_URL ||
      "https://heri-africa.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "Apply NACOSTI",
    href: "https://research-portal.nacosti.go.ke/",
    external: true,
  },
  {
    label: "HUDUMA BORA",
    href: "https://digital.kisiiuniversity.ac.ke/",
    external: true,
  },
  {
    label: "STUDENT PORTAL",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "CAREERS",
    href: "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts",
    external: true,
  },
  {
    label: "CONFERENCES",
    href: "https://digital.kisiiuniversity.ac.ke/conferences",
    external: true,
  },
  {
    label: "TENDERS",
    href: "https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders",
    external: true,
  },
  {
    label: "HELP DESK",
    href: "https://digital.kisiiuniversity.ac.ke/ksu_customer_care_centerr",
    external: true,
  },
];

const defaultContactInfo = {
  address: "Main Campus, Kisii",
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
};

function titleCase(label: string) {
  return label
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bHeri\b/g, "HERI")
    .replace(/\bKsu\b/g, "KSU")
    .replace(/\bNacosti\b/g, "NACOSTI");
}

export function MiniHeader({
  contactInfo = defaultContactInfo,
  quickLinks = defaultQuickLinks,
  supportHref = process.env.NEXT_PUBLIC_SUPPORT_KSU_URL ||
    `${(process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL || "https://research.kisiiuniversity.ac.ke").replace(/\/$/, "")}/donate`,
  className,
}: MiniHeaderProps) {
  const portal =
    quickLinks.find((link) => /student portal/i.test(link.label)) ??
    defaultQuickLinks.find((link) => /student portal/i.test(link.label))!;
  const help =
    quickLinks.find((link) => /help desk/i.test(link.label)) ??
    defaultQuickLinks.find((link) => /help desk/i.test(link.label))!;
  const links = quickLinks.filter(
    (link) => !/student portal|help desk|search/i.test(link.label),
  );
  const linkStyle =
    "inline-flex min-h-11 items-center rounded px-2 text-xs font-normal text-primary-foreground transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";
  return (
    <div
      className={cn(
        "relative z-[60] border-b border-white/15 bg-primary text-primary-foreground",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="hidden min-w-0 items-center gap-4 xl:flex">
          {contactInfo.email && (
            <a href={`mailto:${contactInfo.email}`} className={linkStyle}>
              <Mail aria-hidden className="mr-2 h-3.5 w-3.5 shrink-0" />
              {contactInfo.email}
            </a>
          )}
          {contactInfo.phone && (
            <a
              href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
              className={cn(linkStyle, "hidden 2xl:inline-flex")}
            >
              <Phone aria-hidden className="mr-2 h-3.5 w-3.5 shrink-0" />
              {contactInfo.phone}
            </a>
          )}
        </div>
        <nav
          aria-label="University quick links"
          className="flex min-w-0 flex-1 items-center justify-between gap-2 xl:flex-none"
        >
          <div className="hidden items-center sm:flex">
            {links.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={linkStyle}
              >
                {titleCase(link.label)}
              </Link>
            ))}
          </div>
          <Link
            href={supportHref}
            target={supportHref.startsWith("http") ? "_blank" : undefined}
            rel={
              supportHref.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-secondary px-3 text-xs font-normal leading-none text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Support KSU
          </Link>
          <div className="flex items-center border-l border-white/20 pl-2">
            {[
              { ...portal, label: "Student Portal", Icon: UserRound },
              { ...help, label: "Help Desk", Icon: MessageCircleQuestion },
              {
                href: "/search",
                label: "Search",
                external: false,
                Icon: Search,
              },
            ].map(({ href, label, external, Icon }) => (
              <Link
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={label}
                title={label}
                className={cn(linkStyle, "w-11 justify-center px-0")}
              >
                <Icon aria-hidden className="h-[18px] w-[18px]" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
