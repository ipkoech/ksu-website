import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Landmark,
  Newspaper,
  Phone,
  Quote,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EntityQuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: string;
};

export const mediaLinkIcons: Record<string, LucideIcon> = {
  news: Newspaper,
  events: CalendarDays,
  blogs: FileText,
  announcements: Quote,
  gallery: Download,
};

export function buildEntityQuickLinks({
  baseHref,
  isAcademic = false,
  showPublications = true,
}: {
  baseHref: string;
  isAcademic?: boolean;
  showPublications?: boolean;
}): EntityQuickLink[] {
  const links: EntityQuickLink[] = [
    { label: "About", href: baseHref, icon: Landmark, section: "about" },
    { label: "Team", href: `${baseHref}/team`, icon: Users, section: "team" },
  ];

  if (isAcademic) {
    links.push({
      label: "Programmes",
      href: `${baseHref}/programmes`,
      icon: GraduationCap,
      section: "programmes",
    });
  }

  if (showPublications) {
    links.push({
      label: "Publications",
      href: `${baseHref}/publications`,
      icon: FileText,
      section: "publications",
    });
  }

  links.push(
    {
      label: "Services",
      href: `${baseHref}/services`,
      icon: BriefcaseBusiness,
      section: "services",
    },
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
    {
      label: "Contact",
      href: `${baseHref}/contact`,
      icon: Phone,
      section: "contact",
    },
  );

  return links;
}

export function buildMediaTypeLinks(baseHref: string): EntityQuickLink[] {
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
      icon: Download,
      section: "gallery",
    },
  ];
}

export function QuickLinksPanel({
  links,
  activeSection,
  title = "Quick Links",
  ariaLabel = "Quick links",
}: {
  links: EntityQuickLink[];
  activeSection?: string;
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
            const active = activeSection != null && item.section === activeSection;

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

export function MobileQuickGrid({
  links,
  activeSection,
}: {
  links: EntityQuickLink[];
  activeSection?: string;
}) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
      {links.map((item) => {
        const Icon = item.icon;
        const active = activeSection != null && item.section === activeSection;

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

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}
