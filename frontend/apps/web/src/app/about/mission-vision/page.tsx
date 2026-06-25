import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  History,
  Landmark,
  Lightbulb,
  Scale,
  Sparkles,
  Target,
  Telescope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  coreValues,
  getOverviewData,
  officialMission,
  officialPhilosophy,
  officialVision,
  quickNavigation,
} from "@/lib/about-data";
import { AboutIllustration } from "@/components/about/AboutIllustration";
import { AboutSidebarNav } from "@/components/about/about-sidebar-nav";
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
      "Return to the About overview.",
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
  "/about/quality-assurance": {
    title: "Quality Assurance",
    href: "/about/quality-assurance",
    description:
      "Review public quality, strategic plan, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
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

const philosophyPillars = [
  {
    title: "Creative thinking",
    description:
      "The philosophy centers creative and critical thinking as part of institutional service.",
    icon: Sparkles,
  },
  {
    title: "Scientific and technological innovation",
    description:
      "Scientific, technological, and innovative thinking are explicit parts of the published philosophy.",
    icon: Lightbulb,
  },
  {
    title: "Service to humanity",
    description:
      "The philosophy connects institutional thinking to societal needs and public service.",
    icon: Scale,
  },
];

const practiceCards = [
  {
    title: "Training and learning",
    description:
      "The mission emphasizes quality training and a transformative learning environment.",
    icon: GraduationCap,
  },
  {
    title: "Knowledge and research",
    description:
      "Knowledge preservation, research, and communication sit at the center of the mission statement.",
    icon: BookOpenCheck,
  },
  {
    title: "Student experience",
    description:
      "The mission identifies student experience as part of the environment the university works to enrich.",
    icon: Users,
  },
  {
    title: "Community engagement",
    description:
      "Community engagement is tied directly to sustainable development in the published mission.",
    icon: Building2,
  },
];

const valueIcons: Record<string, LucideIcon> = {
  "Transformative Thinking": Sparkles,
  Respect: Scale,
  Inclusivity: Users,
  Fairness: Landmark,
};

function factValue(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export default async function MissionVisionPage() {
  const overview = await getOverviewData();
  const quickFacts = overview.quick_facts as Record<string, unknown> | undefined;
  const vision = overview.vision || officialVision;
  const mission = overview.mission || officialMission;
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/mission-vision",
  );

  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/history"],
    routeMeta["/about/university-management"],
    routeMeta["/about/quality-assurance"],
    routeMeta["/about/service-charter"],
  ];

  const heroFacts = [
    {
      value: factValue(quickFacts?.founding_year, "1965"),
      label: "Founded",
      detail: "Institutional roots",
    },
    {
      value: factValue(quickFacts?.charter_year, "2013"),
      label: "Chartered",
      detail: "February 6 under Universities Act 2012",
    },
    {
      value: "4",
      label: "Core Values",
      detail: "Published values guiding institutional culture",
    },
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative w-full">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Mission, Vision & Values" },
              ]}
            />

            <div className="mt-7 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px] xl:items-start">
              <AboutSidebarNav
                items={navigationLinks.slice(0, 5).map((item) => ({
                  title: item.title,
                  href: item.href,
                  icon: ChevronRight,
                }))}
                title="Explore About"
                ariaLabel="About section links"
                className="xl:sticky xl:top-28"
              />

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      Mission, Vision & Values
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      Official statements that guide Kisii University
                    </h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                      The mission states what the university does. The vision
                      states where it is going. The philosophy and core values
                      state how it serves.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/about"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                      >
                        Back to About Overview
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/about/history"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                      >
                        Read the History
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>

                    <AboutIllustration
                      src="/images/about/about-mission-vision-hero-branded.webp"
                      alt="Students, lecturers, researchers, and community partners collaborating on campus"
                      priority
                      sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, 100vw"
                      className="mt-8 aspect-[16/7] min-h-[240px] shadow-none"
                    />
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Source anchors
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {heroFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none text-slate-950">
                            {fact.value}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {fact.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {fact.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase text-secondary">
                    Institutional Direction
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    The statements below are shown plainly so they can be read
                    and referenced without interpretation.
                  </p>
                </div>

                <AboutSidebarNav
                  items={relatedRoutes.slice(1, 4).map((item) => ({
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                  }))}
                  title="Related Pages"
                  ariaLabel="Related mission and vision pages"
                />
              </aside>
            </div>
          </div>
        </section>

        <ScrollReveal
          as="section"
          className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="grid w-full gap-5 lg:grid-cols-2">
            <article className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.72)] sm:p-8 lg:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                <Target aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-7 text-sm font-semibold uppercase text-secondary">
                Mission
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
                The public mandate in action
              </h2>
              <p className="mt-6 text-base leading-8 text-white/75 sm:text-lg">
                {mission}
              </p>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-blue-50/80 p-7 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                <Telescope aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-7 text-sm font-semibold uppercase text-primary">
                Vision
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                The future the university works toward
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-700 sm:text-lg">
                {vision}
              </p>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="grid w-full gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Philosophy
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                The philosophy behind institutional service
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                {officialPhilosophy}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {philosophyPillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <article
                    key={pillar.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-xl font-semibold text-slate-950">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {pillar.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="grid w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)] lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold uppercase text-secondary">
                Core Values
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
                Core values
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70">
                These values guide the way the university works with people,
                ideas, and public responsibility.
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-2">
              {coreValues.map((value) => {
                const Icon = valueIcons[value.title] ?? Sparkles;

                return (
                  <article
                    key={value.title}
                    className="border-b border-white/10 p-7 last:border-b-0 sm:border-r sm:even:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      {value.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Mandate in Practice
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  How the statements connect to university work
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                The mission and philosophy point directly to learning,
                research, student experience, and community engagement.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {practiceCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-xl font-semibold leading-7 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

      </AboutPageLenis>
    </PageShell>
  );
}
