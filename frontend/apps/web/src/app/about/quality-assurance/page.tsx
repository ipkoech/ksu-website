import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  Compass,
  ExternalLink,
  History,
  Landmark,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  accreditations,
  quickNavigation,
  serviceCharterUrl,
} from "@/lib/about-data";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";

type RouteCard = {
  title: string;
  href: string;
  description: string;
  action: string;
  icon: LucideIcon;
};

const routeMeta: Record<string, RouteCard> = {
  "/about": {
    title: "About Overview",
    href: "/about",
    description:
      "Return to the consolidated About overview for history, mandate, values, and institutional pathways.",
    action: "Back to overview",
    icon: History,
  },
  "/about/history": {
    title: "History",
    href: "/about/history",
    description:
      "Follow the dated institutional journey from teacher training roots to chartered university status.",
    action: "View history",
    icon: History,
  },
  "/about/mission-vision": {
    title: "Mission & Vision",
    href: "/about/mission-vision",
    description:
      "Read the mission, vision, philosophy, and values that guide the university's public mandate.",
    action: "View mandate",
    icon: Compass,
  },
  "/about/governance": {
    title: "Governance",
    href: "/about/governance",
    description:
      "Review the public governance bodies responsible for oversight, academic authority, and implementation.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/university-management": {
    title: "University Management",
    href: "/about/university-management",
    description:
      "Review the published management board and senior office responsibilities.",
    action: "View management",
    icon: Users,
  },
  "/about/service-charter": {
    title: "Our Service Charter",
    href: "/about/service-charter",
    description:
      "Open the public service charter access point for service commitments and accountability information.",
    action: "Open charter",
    icon: ClipboardCheck,
  },
};

const frameworkCards = [
  {
    title: "Charter and CUE context",
    body: "The About data records Kisii University's charter granted on February 6, 2013 under the Universities Act 2012 framework.",
    icon: ShieldCheck,
  },
  {
    title: "Strategic plan priorities",
    body: "The current strategic plan identifies quality in education, training, and learning as a key result area.",
    icon: BookOpenCheck,
  },
  {
    title: "Service accountability",
    body: "The public service charter remains the direct access point for service commitments and accountability information.",
    icon: ClipboardCheck,
  },
  {
    title: "Governance and administration",
    body: "Governance and administrative structures connect public oversight with day-to-day implementation.",
    icon: Landmark,
  },
];

const accountabilityPath = [
  routeMeta["/about/mission-vision"],
  routeMeta["/about/governance"],
  routeMeta["/about/service-charter"],
];

export default function QualityAssurancePage() {
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/quality-assurance",
  );
  const referenceCards = accreditations.map((item) => ({
    ...item,
    href:
      item.acronym === "QMS"
        ? "/about/strategic-plan"
        : item.acronym === "SC"
          ? serviceCharterUrl
          : undefined,
    action:
      item.acronym === "QMS"
        ? "Open strategic plan page"
        : item.acronym === "SC"
          ? "Open service charter"
          : "Read charter context",
  }));

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
          <div className="relative w-full">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Quality Assurance" },
              ]}
            />

            <div className="mt-5 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px] xl:items-start">
              <nav
                aria-label="About section links"
                className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur xl:sticky xl:top-28"
              >
                <p className="px-2 text-xs font-semibold uppercase text-secondary">
                  Explore About
                </p>
                <ul className="mt-3 space-y-2">
                  {navigationLinks.slice(0, 6).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                          <ChevronRight aria-hidden className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="px-6 py-6 sm:px-8 lg:px-8 lg:py-7">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      Quality Assurance
                    </p>
                    <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl">
                      Quality, standards, and service accountability
                    </h1>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      Kisii University presents quality assurance through its
                      charter context, strategic plan, service charter,
                      governance structure, and administrative accountability
                      pathways.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <a
                        href={serviceCharterUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                      >
                        Open Service Charter
                        <ExternalLink aria-hidden className="h-4 w-4" />
                      </a>
                      <Link
                        href="/about/strategic-plan"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                      >
                        View Strategic Plan
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/about/governance"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                      >
                        Open Governance
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>

                  </div>

                  <div className="border-t border-slate-200 bg-slate-950 p-4 lg:border-l lg:border-t-0">
                    <AboutIllustration
                      src={aboutIllustrations.qualityAssurance}
                      alt="Academic quality review workshop with standards and planning materials"
                      priority
                      sizes="(min-width: 1280px) 260px, (min-width: 1024px) 24vw, 100vw"
                      className="aspect-[4/3] min-h-[240px] shadow-none"
                    />
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <nav
                  aria-label="Related quality assurance pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {accountabilityPath.slice(1).map((item) => {
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                              <Icon aria-hidden className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">{item.title}</span>
                            <ChevronRight
                              aria-hidden
                              className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>
            </div>
          </div>
        </section>

        <ScrollReveal
          as="section"
          className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="grid w-full gap-10 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
            <div className="xl:sticky xl:top-28">
              <p className="text-sm font-semibold uppercase text-secondary">
                Quality Framework
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                Public references that explain quality and accountability
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                The quality page uses published About data and official
                document links rather than implying a live compliance system.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {frameworkCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="min-h-[250px] rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-950">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {card.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Official References
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Public quality context
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                These cards summarize the available About data. The QMS
                reference is framed as strategic-plan support, not as a
                standalone credential.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {referenceCards.map((item) => (
                <article
                  key={item.acronym}
                  className="flex min-h-[310px] flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold uppercase tracking-[0.16em] text-white">
                      {item.acronym}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {item.body}
                      </p>
                    </div>
                  </div>
                  {item.href?.startsWith("/") ? (
                    <Link
                      href={item.href}
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
                    >
                      {item.action}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  ) : item.href ? (
                    <a
                      href={item.href}
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
                    >
                      {item.action}
                      <ExternalLink aria-hidden className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href="/about"
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
                    >
                      {item.action}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </AboutPageLenis>
    </PageShell>
  );
}
