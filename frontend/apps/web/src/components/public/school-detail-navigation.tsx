import Link from "next/link";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Newspaper,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SchoolDetailOverviewData } from "@/lib/school-detail-data";
import type { EntityMediaType } from "@/lib/entity-media-data";

export type SchoolQuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: string;
};

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function navHas(navItems: EntityHeaderNavItem[] | undefined, label: string) {
  return Boolean(navItems?.some((item) => item.label === label));
}

export function buildSchoolQuickLinks({
  baseHref,
  navItems,
  counts,
}: {
  baseHref: string;
  navItems?: EntityHeaderNavItem[];
  counts: SchoolDetailOverviewData["counts"];
}): SchoolQuickLink[] {
  const links: SchoolQuickLink[] = [
    {
      label: "Programmes",
      href: `${baseHref}/programmes`,
      icon: GraduationCap,
      section: "programmes",
    },
    { label: "Team", href: `${baseHref}/team`, icon: Users, section: "team" },
  ];

  if (counts.publications > 0 || navHas(navItems, "Publications")) {
    links.push({
      label: "Publications",
      href: `${baseHref}/publications`,
      icon: FileText,
      section: "publications",
    });
  }

  links.push(
    {
      label: "Media",
      href: `${baseHref}/media`,
      icon: Newspaper,
      section: "media",
    },
    {
      label: "Downloads",
      href: `${baseHref}/downloads`,
      icon: Download,
      section: "downloads",
    },
  );

  if (counts.clubs > 0 || navHas(navItems, "Clubs")) {
    links.push({
      label: "Clubs & Societies",
      href: `${baseHref}/clubs`,
      icon: Sparkles,
      section: "clubs",
    });
  }

  links.push({
    label: "Contact",
    href: `${baseHref}/contact`,
    icon: Phone,
    section: "contact",
  });

  return links;
}

export function buildSchoolMediaLinks(baseHref: string): SchoolQuickLink[] {
  return [
    {
      label: "News",
      href: `${baseHref}/media/news`,
      icon: Newspaper,
      section: "news",
    },
    {
      label: "Events",
      href: `${baseHref}/media/events`,
      icon: CalendarDays,
      section: "events",
    },
    {
      label: "Gallery",
      href: `${baseHref}/media/gallery`,
      icon: Sparkles,
      section: "gallery",
    },
  ];
}

export function SchoolLinksPanel({
  links,
  activeSection,
  title = "Quick Links",
  ariaLabel = "School quick links",
}: {
  links: SchoolQuickLink[];
  activeSection?: string | EntityMediaType;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>{title}</SectionKicker>
      <nav aria-label={ariaLabel} className="mt-3">
        <ul className="divide-y divide-slate-100">
          {links.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.section;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-10 items-center gap-3 py-2 text-sm font-medium transition ${
                    active ? "text-primary" : "text-slate-700 hover:text-primary"
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}

export function ExploreMorePanel() {
  const links: SchoolQuickLink[] = [
    {
      label: "Academic Calendar",
      href: "/academics/calendar",
      icon: CalendarDays,
      section: "calendar",
    },
    {
      label: "Admissions",
      href: "/admissions",
      icon: GraduationCap,
      section: "admissions",
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Explore More</SectionKicker>
      <ul className="mt-3 divide-y divide-slate-100">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-10 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition hover:text-primary"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">{item.label}</span>
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MobileSchoolLinksGrid({
  links,
  activeSection,
}: {
  links: SchoolQuickLink[];
  activeSection?: string | EntityMediaType;
}) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
      {links.map((item) => {
        const Icon = item.icon;
        const active = activeSection === item.section;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[5rem] flex-col items-center justify-center gap-2 rounded-[1.1rem] border bg-white p-2 text-center text-[0.72rem] font-semibold leading-4 shadow-sm transition ${
              active
                ? "border-primary/30 text-primary"
                : "border-slate-200 text-slate-700 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </section>
  );
}
