"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ksu/ui/lib/utils";
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
  { label: "University Farm", href: "/farm", icon: Sprout },
  { label: "Sustainability", href: "/sustainability", icon: Leaf },
];

const researchNavItems: NavSection[] = [
  {
    label: "Research",
    href: "/projects",
    icon: FlaskConical,
    description: "Research programmes, projects, centers, facilities, expertise, and outputs.",
    activePaths: [
      "/projects",
      "/programs",
      "/centers",
      "/facilities",
      "/expertise",
      "/publications",
      "/outputs",
    ],
    groups: [
      {
        title: "Research & Discovery",
        items: [
          {
            label: "Research Programs",
            href: "/programs",
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
            href: "/facilities",
            icon: Building2,
            description: "Research infrastructure and resources.",
          },
          {
            label: "Researchers & Innovators",
            href: "/expertise",
            icon: Users,
            description: "Find research contacts and specialists.",
          },
          {
            label: "Publications",
            href: "/publications",
            icon: FileText,
            description: "Articles, journals, papers, and research records.",
          },
          {
            label: "Research Outputs",
            href: "/outputs",
            icon: GraduationCap,
            description: "Repository outputs, reports, briefs, and documents.",
          },
        ],
      },
    ],
  },
  {
    label: "Innovation & Partnerships",
    href: "/innovations",
    icon: Lightbulb,
    description: "IP, startups, commercialization, partners, donors, and collaborations.",
    activePaths: ["/innovations", "/partners"],
    groups: [
      {
        title: "Innovation",
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
    label: "Community & Impact",
    href: "/community-impact",
    icon: HeartHandshake,
    description: "Extension, farm, sustainability, impact metrics, consultancies, and mentorship.",
    activePaths: [
      "/community-impact",
      "/events",
      "/farm",
      "/sustainability",
      "/impact-metrics",
      "/consultancies",
      "/mentorship",
    ],
    groups: [
      {
        title: "Extension & Sustainability",
        items: [
          {
            label: "Community Initiatives",
            href: "/community-impact",
            icon: Users,
            description: "Outreach projects and local impact.",
          },
          {
            label: "Events Calendar",
            href: "/events",
            icon: CalendarDays,
            description: "Workshops, forums, and conferences.",
          },
          {
            label: "Extension Programs",
            href: "/community-impact",
            icon: HeartHandshake,
            description: "Knowledge transfer and community service.",
          },
          {
            label: "University Farm",
            href: "/farm",
            icon: Sprout,
            description: "Field research, demonstrations, and farm partnerships.",
          },
          {
            label: "Sustainability",
            href: "/sustainability",
            icon: Leaf,
            description: "Climate, conservation, and sustainability records.",
          },
        ],
      },
      {
        title: "Impact & Support",
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
            href: "/consultancies",
            icon: Briefcase,
            description: "Professional expert services.",
          },
          {
            label: "Mentorship",
            href: "/mentorship",
            icon: GraduationCap,
            description: "Mentor and mentee programme details.",
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
    activePaths: ["/resources-tools", "/news", "/outputs", "/forms", "/guidelines", "/services"],
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
            href: "/news",
            icon: Newspaper,
            description: "Latest research news and updates.",
          },
          {
            label: "Forms & Templates",
            href: "/forms",
            icon: ClipboardList,
            description: "Ethics, booking, and collaboration forms.",
          },
        ],
      },
    ],
  },
  {
    label: "Funding & Support",
    href: "/funding",
    icon: Rocket,
    description: "Grant calls, scholarships, endowments, and training.",
    activePaths: ["/funding", "/capacity", "/scholarships", "/endowments", "/training"],
    groups: [
      {
        title: "Funding",
        items: [
          {
            label: "Scholarships",
            href: "/scholarships",
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
            href: "/endowments",
            icon: Heart,
            description: "Permanent funding initiatives.",
          },
          {
            label: "Training Programs",
            href: "/training",
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
    href: "/about",
    icon: Mail,
    description: "Research office, team, contacts, inquiries, donations, and multimedia.",
    activePaths: ["/about", "/team", "/connect", "/donate"],
    groups: [
      {
        title: "About REIRM",
        items: [
          {
            label: "Our Team",
            href: "/team",
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
          {
            label: "Donate",
            href: "/donate",
            icon: Heart,
            description: "Support research, scholarships, endowments, and impact.",
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
              <span className="block font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-none text-primary sm:text-2xl lg:text-xl">
                KSU Research
              </span>
              <span className="mt-1 block text-xs font-semibold leading-none text-slate-600 sm:text-sm lg:text-xs">
                Projects, publications & innovation
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
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
              href="/donate"
              className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 sm:inline-flex 2xl:px-5"
            >
              <Heart aria-hidden className="h-4 w-4" />
              Donate
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 hover:text-primary xl:hidden"
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
          <div className="max-h-[calc(100vh-90px)] overflow-y-auto border-t border-primary/10 bg-white py-2 xl:hidden">
            <div className="pb-4">
              {researchNavItems.map((item) => (
                <MobileMenuItem
                  key={item.label}
                  item={item}
                  active={isActivePath(pathname, item)}
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <Link
                href="/donate"
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
    <div className="hidden border-b border-white/10 bg-secondary text-xs text-white shadow-[inset_0_-1px_rgba(255,255,255,0.08)] xl:block">
      <div className="flex min-h-10 w-full items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <nav className="flex min-w-0 items-center gap-5" aria-label="Research utility">
          {utilityLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
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
            className="inline-flex min-h-10 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
          >
            <Search aria-hidden className="h-3.5 w-3.5" />
            Search
          </Link>
          <Link
            href="/connect"
            className="inline-flex min-h-10 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
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
        className={cn(
          "inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none",
          active
            ? "bg-primary/10 text-primary"
            : "text-slate-700 hover:bg-primary/10 hover:text-primary",
        )}
      >
        <span className="max-w-[128px] truncate">{item.label}</span>
        <ChevronDown
          aria-hidden
          className="h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180"
        />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-primary/10 bg-white p-4 shadow-[0_24px_80px_-48px_rgba(30,64,175,0.6)]">
          <div className="mb-4 flex items-start justify-between gap-4 border-b border-primary/10 pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon aria-hidden className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-slate-950">
                  {item.label}
                </h2>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
            <Link
              href={item.href}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {item.groups?.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {group.title}
                </h3>
                <div className="grid gap-1.5">
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
  );
}

function SubMenuLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="block min-h-11 rounded-lg px-2.5 py-2 text-sm leading-5 text-gray-700 transition-colors motion-reduce:transition-none hover:bg-gray-50 hover:text-primary"
    >
      <span className="break-words font-medium">{item.label}</span>
      <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-gray-500">
        {item.description}
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
    <section className="border-b border-slate-100 last:border-b-0">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
        className={cn(
          "flex min-h-12 items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-slate-800 hover:bg-slate-50 hover:text-primary",
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
        {item.label}
      </Link>
      {item.groups ? (
        <div className="grid gap-3 bg-slate-50 px-5 py-3">
          {item.groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                      className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-primary"
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
          ? "inline-flex min-h-11 items-center rounded-full bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary"
          : "inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-primary/10 hover:text-primary"
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
