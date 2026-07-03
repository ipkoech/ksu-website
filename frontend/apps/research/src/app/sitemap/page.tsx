import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FlaskConical,
  Handshake,
  Home,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Directory of key public sections on the Kisii University Research Portal.",
};

const mainSections = [
  { label: "Home", href: "/", icon: Home },
  { label: "About REIRM", href: "/about", icon: Users },
  { label: "Projects", href: "/projects", icon: FlaskConical },
  { label: "Publications", href: "/publications", icon: BookOpen },
  { label: "Research Centers", href: "/centers", icon: BriefcaseBusiness },
  { label: "Partners", href: "/partners", icon: Handshake },
  { label: "News & Events", href: "/news", icon: CalendarDays },
  { label: "Resources & Tools", href: "/resources-tools", icon: Wrench },
];

const groupedSections = [
  {
    title: "Research",
    links: [
      { label: "Research Projects", href: "/projects" },
      { label: "Research Programs", href: "/programs" },
      { label: "Publications", href: "/publications" },
      { label: "Outputs", href: "/outputs" },
      { label: "Expertise", href: "/expertise" },
      { label: "Facilities", href: "/facilities" },
    ],
  },
  {
    title: "Innovation",
    links: [
      { label: "Innovations", href: "/innovations" },
      { label: "Startups", href: "/startups" },
      { label: "Incubation", href: "/incubation" },
      { label: "Technology Transfer", href: "/technology-transfer" },
      { label: "Competitions", href: "/competitions" },
    ],
  },
  {
    title: "Funding & Support",
    links: [
      { label: "Funding", href: "/funding" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Endowments", href: "/endowments" },
      { label: "Training", href: "/training" },
      { label: "Mentorship", href: "/mentorship" },
      { label: "Research Services", href: "/services" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resource Library", href: "/resources-tools/library" },
      { label: "Policies", href: "/resources-tools/policies" },
      { label: "Forms", href: "/resources-tools/forms" },
      { label: "Downloads", href: "/resources-tools/downloads" },
      { label: "Guidelines", href: "/guidelines" },
      { label: "Capacity Building", href: "/capacity" },
    ],
  },
  {
    title: "Engagement",
    links: [
      { label: "Partners", href: "/partners" },
      { label: "How to Partner", href: "/partners/how-to-partner" },
      { label: "Partner Stories", href: "/partners/stories" },
      { label: "Community Impact", href: "/community-impact" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Contact REIRM", href: "/connect" },
    ],
  },
  {
    title: "Utility",
    links: [
      { label: "Search", href: "/search" },
      { label: "Team", href: "/team" },
      { label: "Donate", href: "/donate" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Apply NACOSTI", href: "https://research-portal.nacosti.go.ke/", external: true },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main id="research-main" className="min-h-screen bg-[#f4f6f4]">
      <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
        <ScrollReveal className="mx-auto max-w-[1680px]">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Sitemap</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Sitemap
          </p>
          <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Research portal sitemap
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
            Browse the main public areas of the Kisii University REIRM Portal.
          </p>
        </ScrollReveal>
      </section>

      <article className="mx-auto max-w-[1680px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
        <ScrollRevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={70}>
          {mainSections.map((item) => (
            <SitemapPrimaryLink key={item.href} item={item} />
          ))}
        </ScrollRevealGroup>

        <ScrollRevealGroup className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3" staggerDelay={85}>
          {groupedSections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <div className="mt-4 grid gap-2">
                {section.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-white hover:text-primary"
                  >
                    <span>{item.label}</span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-primary/70 transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </ScrollRevealGroup>
      </article>
    </main>
  );
}

function SitemapPrimaryLink({
  item,
}: {
  item: { label: string; href: string; icon: LucideIcon };
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex min-h-24 items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}
