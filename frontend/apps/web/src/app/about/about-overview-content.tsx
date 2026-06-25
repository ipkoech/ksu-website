import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  FileText,
  History,
  Landmark,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  aboutIntro,
  getOverviewData,
  officialVision,
  quickNavigation,
} from "@/lib/about-data";
import { AboutSidebarNav } from "@/components/about/about-sidebar-nav";
import { aboutIllustrations } from "@/components/about/AboutIllustration";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { PublicImage } from "@/components/public/public-image";

interface AboutOverviewContentProps {
  breadcrumbItems?: { label: string; href?: string }[];
}

type NavigationMeta = {
  description: string;
  action: string;
  icon: LucideIcon;
};

const navigationMeta: Record<string, NavigationMeta> = {
  "/about/history": {
    description:
      "Follow the dated institutional journey from teacher training roots to chartered university status.",
    action: "View history",
    icon: History,
  },
  "/about/mission-vision": {
    description:
      "Read the official mission, vision, philosophy, and core values.",
    action: "View statements",
    icon: Compass,
  },
  "/about/governance": {
    description:
      "Understand the governance bodies responsible for oversight, academic authority, and institutional implementation.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/university-management": {
    description:
      "Review the published university management structure and senior office roles.",
    action: "View management",
    icon: Users,
  },
  "/about/quality-assurance": {
    description:
      "Review public quality, strategic plan, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
};

export async function AboutOverviewContent({
  breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About" }],
}: AboutOverviewContentProps) {
  const overview = await getOverviewData();
  const vision = overview.vision || officialVision;

  const navItems = quickNavigation
    .filter((item) => item.href !== "/about")
    .map((item) => ({
      title: item.title,
      href: item.href,
      icon: navigationMeta[item.href]?.icon ?? FileText,
    }));

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative min-h-[55vh] overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#eef4ff_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="relative w-full">
            <BreadcrumbTrail items={breadcrumbItems} />

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:items-start">
              <AboutSidebarNav
                items={navItems.slice(0, 3)}
                className="lg:sticky lg:top-28"
              />

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,0.7)]">
                <div className="px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
                  <p className="text-sm font-semibold uppercase text-secondary">
                    About Kisii University
                  </p>
                  <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-[1.08] text-white sm:text-3xl">
                    {vision}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
                    {aboutIntro}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href="/about/university-management"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                      University Management
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                  <PublicImage
                    src={aboutIllustrations.overview}
                    alt=""
                    ratio="news"
                    sizes="(min-width: 1024px) 54vw, 100vw"
                    className="mt-5 border border-white/10 bg-white/5"
                    imageClassName="object-cover"
                  />
                </div>
              </div>

              <AboutSidebarNav
                items={navItems.slice(3)}
                title="Related Pages"
                ariaLabel="Related institutional pages"
              />
            </div>
          </div>
        </section>

        <ScrollReveal
          as="section"
          className="border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-18"
        >
          <div className="w-full">
            <p className="text-sm font-semibold uppercase text-secondary">
              Discover Our Story
            </p>
            <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
              From teacher training roots to a chartered university
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Kisii University began as a teacher training college in 1965, grew
              through Egerton University, and became a chartered university on
              February 6, 2013. The full institutional timeline, milestones, and
              charter details are published on the history page.
            </p>
            <Link
              href="/about/history"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
            >
              View full history
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-18"
        >
          <div className="w-full">
            <p className="text-sm font-semibold uppercase text-secondary">
              Institutional Mandate
            </p>
            <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
              What guides the university
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              The mission, vision, philosophy, and core values are published in
              full with official source text on the mission &amp; vision page.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Mission & Vision",
                  body: "Read the official institutional statements.",
                  href: "/about/mission-vision",
                },
                {
                  label: "Philosophy",
                  body: "Understand the philosophy behind institutional service.",
                  href: "/about/mission-vision#philosophy",
                },
                {
                  label: "Core Values",
                  body: "Values that guide how the university works with people.",
                  href: "/about/mission-vision#core-values",
                },
              ].map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950">
                    {card.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.body}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Read more
                    <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="p-7 sm:p-8 lg:p-10">
                <p className="text-sm font-semibold uppercase text-secondary">
                  Find Your Way
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
                  Explore the About section
                </h2>
                <p className="mt-5 text-base leading-8 text-white/70">
                  Each detail page is the primary source for its topic. Start
                  with history, mission and values, governance, management,
                  quality assurance, or the service charter.
                </p>
              </div>
              <div className="border-t border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-l lg:border-t-0">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-3 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-secondary">
                        <item.icon aria-hidden className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">{item.title}</span>
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </AboutPageLenis>
    </PageShell>
  );
}
