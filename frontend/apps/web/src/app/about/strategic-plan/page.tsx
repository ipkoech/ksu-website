import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  History,
  Landmark,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { AboutSidebarNav } from "@/components/about/about-sidebar-nav";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  quickNavigation,
  strategicDocuments,
  strategicPlanHighlights,
} from "@/lib/about-data";

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
    description: "Return to the About overview.",
    action: "Back to overview",
    icon: History,
  },
  "/about/mission-vision": {
    title: "Mission, Vision & Values",
    href: "/about/mission-vision",
    description: "Read the official institutional statements.",
    action: "View statements",
    icon: Compass,
  },
  "/about/governance": {
    title: "Governance",
    href: "/about/governance",
    description:
      "Review University Council governance and public accountability.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/university-management": {
    title: "University Management",
    href: "/about/university-management",
    description:
      "Find the Vice Chancellor, deputy vice chancellors, registrars, finance officer, and Senate context.",
    action: "View management",
    icon: Users,
  },
  "/about/quality-assurance": {
    title: "Quality Assurance",
    href: "/about/quality-assurance",
    description:
      "Review public quality, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
  "/about/service-charter": {
    title: "Our Service Charter",
    href: "/about/service-charter",
    description:
      "Open the public service charter access point for service commitments.",
    action: "Open charter",
    icon: ClipboardCheck,
  },
};

const highlightIcons = [BookOpenCheck, FileText, Users, Sparkles];

function strategicDocument(title: string) {
  return strategicDocuments.find((document) => document.title === title);
}

export default function StrategicPlanPage() {
  const strategicPlan = strategicDocuments.find((document) =>
    document.title.startsWith("Strategic Plan"),
  );
  const councilDocument = strategicDocument("University Council Page");
  const serviceDocument = strategicDocument("Our Service Charter");
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/strategic-plan",
  );
  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/mission-vision"],
    routeMeta["/about/governance"],
    routeMeta["/about/university-management"],
    routeMeta["/about/quality-assurance"],
    routeMeta["/about/service-charter"],
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="relative w-full">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Strategic Plan" },
              ]}
            />

            <div className="mt-5 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px] xl:items-start">
              <AboutSidebarNav
                items={navigationLinks.slice(0, 7).map((item) => ({
                  title: item.title,
                  href: item.href,
                  icon: ChevronRight,
                }))}
                title="Explore About"
                ariaLabel="About section links"
                className="xl:sticky xl:top-28"
              />

              <div className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0 px-6 py-6 sm:px-8 lg:px-8 lg:py-7">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      Strategic Plan
                    </p>
                    <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl">
                      Institutional priorities and implementation focus
                    </h1>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      The strategic plan sets the university's priorities, key
                      result areas, implementation focus, and planning
                      references.
                    </p>
                    <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {strategicPlan?.href ? (
                        <a
                          href={strategicPlan.href}
                          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                          Open strategic plan
                          <ExternalLink aria-hidden className="h-4 w-4" />
                        </a>
                      ) : null}
                      <Link
                        href="/about/quality-assurance"
                        className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                      >
                        View quality context
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="min-w-0 border-t border-slate-200 bg-slate-950 p-4 lg:border-l lg:border-t-0">
                    <AboutIllustration
                      src={aboutIllustrations.strategicPlan}
                      alt="University stakeholders mapping strategic priorities in a planning workshop"
                      priority
                      sizes="(min-width: 1280px) 300px, (min-width: 1024px) 28vw, 100vw"
                      className="aspect-[4/3] min-h-[260px] shadow-none"
                    />
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <AboutSidebarNav
                  items={relatedRoutes.slice(2, 6).map((item) => ({
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                  }))}
                  title="Related Pages"
                  ariaLabel="Related strategic plan pages"
                />
              </aside>
            </div>
          </div>
        </section>

        <ScrollReveal
          as="section"
          className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,4fr)_minmax(240px,1fr)]">
            <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-secondary">
                Key Result Areas
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                Strategic priorities
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {strategicPlanHighlights.map((highlight, index) => {
                  const Icon = highlightIcons[index] ?? Target;

                  return (
                    <article
                      key={highlight.title}
                      className="min-h-[230px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 text-xl font-semibold leading-7 text-slate-950">
                        {highlight.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {highlight.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.7)] xl:sticky xl:top-28 xl:self-start">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                <FileText aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Current Plan
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                {strategicPlan?.title ?? "Strategic Plan"}
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/75">
                {strategicPlan?.body ??
                  "The current strategic plan document will be linked here when it is available."}
              </p>
              {strategicPlan?.href ? (
                <a
                  href={strategicPlan.href}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-secondary hover:text-slate-950"
                >
                  Open PDF
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              ) : null}
            </aside>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Supporting References
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Planning connects to governance and service commitments
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                These references connect planning with governance and service
                commitments.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[
                {
                  title: "University Council",
                  body:
                    councilDocument?.body ||
                    "Council governance and accountability records.",
                  href: "/about/governance",
                  action: "Open governance",
                  icon: Landmark,
                },
                {
                  title: "Service Charter",
                  body:
                    serviceDocument?.body ||
                    "Public service commitments and accountability information.",
                  href: "/about/service-charter",
                  action: "Open service charter",
                  icon: ClipboardCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:bg-slate-50"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.body}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {item.action}
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 transition group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </AboutPageLenis>
    </PageShell>
  );
}
