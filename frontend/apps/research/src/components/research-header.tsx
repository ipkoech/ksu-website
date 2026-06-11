"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  HeartHandshake,
  HelpCircle,
  Leaf,
  Lightbulb,
  Mail,
  Menu,
  Newspaper,
  Rocket,
  Search,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  external?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavSection = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  activePaths?: string[];
  groups?: NavGroup[];
};

const utilityLinks: NavItem[] = [
  {
    label: "Main Site",
    href: "https://kisiiuniversity.ac.ke",
    external: true,
    icon: ArrowRight,
  },
  { label: "University Farm", href: "/community-impact", icon: Sprout },
  { label: "Sustainability", href: "/community-impact", icon: Leaf },
  { label: "Publications", href: "/publications", icon: FileText },
  { label: "News & Updates", href: "/resources-tools", icon: Newspaper },
];

const researchNavItems: NavSection[] = [
  {
    label: "Home",
    href: "/",
    icon: BookOpen,
    description: "Research portal landing page.",
  },
  {
    label: "Research & Innovation",
    href: "/projects",
    icon: FlaskConical,
    description: "Research programmes, projects, facilities, and experts.",
    groups: [
      {
        title: "Research & Discovery",
        items: [
          {
            label: "Research Programs",
            href: "/projects",
            icon: BookOpen,
            description: "Multi-year institutional initiatives.",
          },
          {
            label: "Highlights & Breakthroughs",
            href: "/projects",
            icon: Star,
            description: "Featured projects and discoveries.",
          },
          {
            label: "Facilities & Labs",
            href: "/projects",
            icon: Building2,
            description: "Research infrastructure and resources.",
          },
          {
            label: "Researchers & Innovators",
            href: "/connect",
            icon: Users,
            description: "Find research contacts and specialists.",
          },
        ],
      },
    ],
  },
  {
    label: "Innovation & Commercialization",
    href: "/innovations",
    icon: Lightbulb,
    description: "IP, startups, commercialization, and competitions.",
    groups: [
      {
        title: "Commercialization",
        items: [
          {
            label: "Intellectual Property",
            href: "/innovations",
            icon: Zap,
            description: "IP licensing, patents, and inventions.",
          },
          {
            label: "Startups & Incubation",
            href: "/innovations",
            icon: Rocket,
            description: "Support for entrepreneurs and ventures.",
          },
          {
            label: "Competitions & Hackathons",
            href: "/innovations",
            icon: Award,
            description: "Innovation challenges and prizes.",
          },
          {
            label: "Innovation Ecosystem",
            href: "/partners",
            icon: Globe,
            description: "Partners that help ideas reach the market.",
          },
        ],
      },
    ],
  },
  {
    label: "Partnerships",
    href: "/partners",
    icon: Handshake,
    description: "Industry, funder, academic, and community partnerships.",
    groups: [
      {
        title: "Partner Engagement",
        items: [
          {
            label: "For Industry Partners",
            href: "/partners#how-to-partner",
            icon: Building2,
            description: "How to partner with Kisii University.",
          },
          {
            label: "Partner Showcase",
            href: "/partners",
            icon: Star,
            description: "Case studies and testimonials.",
          },
          {
            label: "Industry Network",
            href: "/partners",
            icon: Globe,
            description: "Corporate and institutional partners.",
          },
        ],
      },
    ],
  },
  {
    label: "Community Impact",
    href: "/community-impact",
    icon: HeartHandshake,
    description: "Community initiatives, outreach, and public events.",
    groups: [
      {
        title: "Community",
        items: [
          {
            label: "Community Initiatives",
            href: "/community-impact",
            icon: Users,
            description: "Outreach projects and local impact.",
          },
          {
            label: "Events Calendar",
            href: "/community-impact",
            icon: CalendarDays,
            description: "Workshops, forums, and conferences.",
          },
          {
            label: "Extension Programs",
            href: "/community-impact",
            icon: HeartHandshake,
            description: "Knowledge transfer and community service.",
          },
        ],
      },
    ],
  },
  {
    label: "Resources & Tools",
    href: "/resources-tools",
    icon: ClipboardList,
    description: "Policies, templates, guides, news, and resources.",
    groups: [
      {
        title: "Resources",
        items: [
          {
            label: "Resource Library",
            href: "/resources-tools",
            icon: BookOpen,
            description: "Policies, templates, reports, and guides.",
          },
          {
            label: "News & Media",
            href: "/resources-tools",
            icon: Newspaper,
            description: "Latest research news and updates.",
          },
          {
            label: "Repository",
            href: "/resources-tools",
            icon: GraduationCap,
            description: "Research papers and documents.",
          },
          {
            label: "Forms & Templates",
            href: "/resources-tools",
            icon: ClipboardList,
            description: "Ethics, booking, and collaboration forms.",
          },
        ],
      },
    ],
  },
  {
    label: "Impact & Metrics",
    href: "/impact-metrics",
    icon: BarChart3,
    description: "Impact dashboard, data, reports, and mentorship links.",
    groups: [
      {
        title: "Impact",
        items: [
          {
            label: "Impact Overview",
            href: "/impact-metrics",
            icon: Target,
            description: "Social and economic contribution.",
          },
          {
            label: "Metrics & Data",
            href: "/impact-metrics",
            icon: BarChart3,
            description: "Performance dashboard.",
          },
          {
            label: "Consultancies",
            href: "/partners",
            icon: Briefcase,
            description: "Professional expert services.",
          },
          {
            label: "Mentorship",
            href: "/connect#mentorship",
            icon: GraduationCap,
            description: "Mentor and mentee programme details.",
          },
        ],
      },
    ],
  },
  {
    label: "Funding",
    href: "/funding",
    icon: Rocket,
    description: "Grant calls, scholarships, endowments, and training.",
    activePaths: ["/funding", "/capacity"],
    groups: [
      {
        title: "Funding",
        items: [
          {
            label: "Scholarships",
            href: "/capacity",
            icon: GraduationCap,
            description: "Student funding and awards.",
          },
          {
            label: "Funding Opportunities",
            href: "/funding",
            icon: Award,
            description: "Grants and calls for proposals.",
          },
          {
            label: "Endowment Funds",
            href: "/funding",
            icon: Heart,
            description: "Permanent funding initiatives.",
          },
          {
            label: "Training Programs",
            href: "/capacity",
            icon: BookOpen,
            description: "Workshops, webinars, and bootcamps.",
          },
          {
            label: "Capacity Building",
            href: "/capacity",
            icon: TrendingUp,
            description: "Training and development.",
          },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/connect#about",
    icon: Users,
    description: "Research team, contacts, forms, and multimedia.",
    activePaths: [],
    groups: [
      {
        title: "About REIRM",
        items: [
          {
            label: "Our Team",
            href: "/connect",
            icon: Users,
            description: "Leadership and research staff.",
          },
          {
            label: "Contact Us",
            href: "/connect",
            icon: Mail,
            description: "Inquiries and support.",
          },
          {
            label: "Multimedia",
            href: "/connect",
            icon: Video,
            description: "Tours, interviews, and galleries.",
          },
        ],
      },
    ],
  },
  {
    label: "Connect & Engage",
    href: "/connect",
    icon: Mail,
    description: "Contacts, inquiry channels, mentorship, and donations.",
    activePaths: ["/connect"],
    groups: [
      {
        title: "Engage",
        items: [
          {
            label: "Research Inquiry",
            href: "/connect#research",
            icon: FlaskConical,
            description: "Project collaboration and research support.",
          },
          {
            label: "Partnership Inquiry",
            href: "/connect#partnership",
            icon: Handshake,
            description: "Industry, government, and funder requests.",
          },
          {
            label: "Media Inquiry",
            href: "/connect#media",
            icon: Newspaper,
            description: "Expert comments and press requests.",
          },
          {
            label: "Help Desk",
            href: "/connect",
            icon: HelpCircle,
            description: "Research support and general help.",
          },
        ],
      },
    ],
  },
];

export function ResearchHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 shadow-[0_12px_36px_-32px_rgba(30,64,175,0.55)] backdrop-blur-md">
      <ResearchUtilityBar />
      <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex h-[89px] items-center justify-between gap-3 lg:h-[82px]">
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
              className="h-12 w-auto sm:h-14 lg:h-12"
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

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 2xl:flex">
            {researchNavItems.map((item) =>
              item.groups ? (
                <DesktopMenuItem
                  key={item.label}
                  item={item}
                  active={isActivePath(pathname, item)}
                />
              ) : (
                <HeaderLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item)}
                />
              ),
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/search"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary"
              aria-label="Search Kisii University Research"
            >
              <Search aria-hidden className="h-5 w-5" />
            </Link>
            <Link
              href="/connect#donate"
              className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 sm:inline-flex 2xl:px-5"
            >
              <Heart aria-hidden className="h-4 w-4" />
              Donate
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary 2xl:hidden"
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
        </div>

        {isOpen ? (
          <div className="max-h-[calc(100vh-90px)] overflow-y-auto border-t border-primary/10 py-3 2xl:hidden">
            <div className="grid gap-2 pb-4">
              {researchNavItems.map((item) => (
                <MobileMenuItem
                  key={item.label}
                  item={item}
                  active={isActivePath(pathname, item)}
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <Link
                href="/connect#donate"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground sm:hidden"
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

function ResearchUtilityBar() {
  return (
    <div className="hidden border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:block">
      <div className="flex min-h-10 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <nav className="flex min-w-0 items-center gap-5" aria-label="Research utility">
          {utilityLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 transition hover:text-primary"
              >
                {Icon ? (
                  <Icon
                    aria-hidden
                    className={index === 0 ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"}
                  />
                ) : null}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/search"
            className="inline-flex min-h-10 items-center gap-1.5 transition hover:text-primary"
          >
            <Search aria-hidden className="h-3.5 w-3.5" />
            Search
          </Link>
          <Link
            href="/connect"
            className="inline-flex min-h-10 items-center gap-1.5 transition hover:text-primary"
          >
            <HelpCircle aria-hidden className="h-3.5 w-3.5" />
            Help Desk
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopMenuItem({
  item,
  active,
}: {
  item: NavSection;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <div className="group relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
            : "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary"
        }
      >
        <span className="max-w-[128px] truncate">{item.label}</span>
        <ChevronDown
          aria-hidden
          className="h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180"
        />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-[620px] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
          <div className="grid grid-cols-[220px_1fr]">
            <div className="bg-slate-50 p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold leading-6 text-slate-950">
                {item.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
              <Link
                href={item.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Go to section
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              {item.groups?.map((group) => (
                <div key={group.title}>
                  <h3 className="border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {group.title}
                  </h3>
                  <div className="mt-2 grid gap-1">
                    {group.items.map((subItem) => (
                      <SubMenuLink key={subItem.label} item={subItem} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubMenuLink({ item }: { item: NavItem }) {
  const Icon = item.icon ?? ArrowRight;

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="group/item flex gap-3 rounded-md p-3 transition hover:bg-slate-50"
    >
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition group-hover/item:bg-primary/10 group-hover/item:text-primary">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-5 text-slate-950 transition group-hover/item:text-primary">
          {item.label}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function MobileMenuItem({
  item,
  active,
  onClick,
}: {
  item: NavSection;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
        className={
          active
            ? "flex min-h-11 items-center gap-3 rounded-t-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
            : "flex min-h-11 items-center gap-3 rounded-t-lg px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-primary/10 hover:text-primary"
        }
      >
        <Icon aria-hidden className="h-4 w-4" />
        {item.label}
      </Link>
      {item.groups ? (
        <div className="grid gap-3 border-t border-slate-100 px-4 py-3">
          {item.groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </h3>
              <div className="mt-2 grid gap-1">
                {group.items.map((subItem) => {
                  const SubIcon = subItem.icon ?? ArrowRight;
                  return (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      target={subItem.external ? "_blank" : undefined}
                      rel={subItem.external ? "noopener noreferrer" : undefined}
                      onClick={onClick}
                      className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                    >
                      <SubIcon aria-hidden className="h-4 w-4 text-slate-400" />
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function HeaderLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex min-h-11 items-center rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
          : "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary"
      }
    >
      {label}
    </Link>
  );
}

function isActivePath(pathname: string, item: NavSection): boolean {
  if (item.activePaths) {
    return item.activePaths.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    );
  }

  if (item.href === "/") {
    return pathname === "/";
  }

  const hrefPath = item.href.split("#")[0];

  if (hrefPath && pathname.startsWith(hrefPath)) {
    return true;
  }

  return false;
}
