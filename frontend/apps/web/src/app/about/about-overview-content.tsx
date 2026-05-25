import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileText,
  History,
  Landmark,
  Lightbulb,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  aboutIntro,
  coreValues,
  getOverviewData,
  historyTimeline,
  officialMission,
  officialPhilosophy,
  officialVision,
  quickNavigation,
} from "@/lib/about-data";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";

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
      "Read the mission, vision, philosophy, and values that guide the university's public mandate.",
    action: "View mandate",
    icon: Compass,
  },
  "/about/governance": {
    description:
      "Understand the governance bodies responsible for oversight, academic authority, and institutional implementation.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/leadership": {
    description:
      "Find the Vice Chancellor, deputy vice chancellors, registrars, finance officer, and school-level leadership records.",
    action: "View leadership",
    icon: Users,
  },
  "/about/quality-assurance": {
    description:
      "Review public quality, strategic plan, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
  "/about/governance-leadership": {
    description:
      "Understand the governance structure, council oversight, and leadership responsibilities.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/university-management": {
    description:
      "Review the published university management structure and senior office roles.",
    action: "View management",
    icon: Users,
  },
  "/about/administrative-division": {
    description:
      "Explore administrative units that support institutional operations and public service.",
    action: "View divisions",
    icon: Building2,
  },
  "/about/service-charter": {
    description:
      "Access the public service charter information and institutional service commitments.",
    action: "Open charter",
    icon: ClipboardCheck,
  },
  "/about/strategic-plan": {
    description:
      "Review the current strategic plan, key result areas, and supporting public references.",
    action: "View plan",
    icon: FileText,
  },
};

const timelineAccents = [
  "border-primary/25 bg-primary/10 text-primary",
  "border-secondary/25 bg-orange-50 text-secondary",
  "border-slate-300 bg-white text-slate-900",
  "border-primary/25 bg-blue-50 text-primary",
  "border-secondary/25 bg-orange-50 text-secondary",
  "border-slate-300 bg-white text-slate-900",
];

const mandateCards: {
  label: string;
  title: string;
  icon: LucideIcon;
  panel: string;
}[] = [
  {
    label: "Mission",
    title: "How the university serves its public mandate",
    icon: BookOpenCheck,
    panel: "bg-white",
  },
  {
    label: "Vision",
    title: "The destination that shapes institutional direction",
    icon: Compass,
    panel: "bg-blue-50/80",
  },
  {
    label: "Philosophy",
    title: "The thinking behind teaching, research, and service",
    icon: Lightbulb,
    panel: "bg-orange-50/70",
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

export async function AboutOverviewContent({
  breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About" }],
}: AboutOverviewContentProps) {
  const overview = await getOverviewData();
  const quickFacts = overview.quick_facts as Record<string, unknown> | undefined;

  const navigationLinks = quickNavigation
    .filter((item) => item.href !== "/about")
    .map((item) => ({
      ...item,
      ...(navigationMeta[item.href] ?? {
        description: "Continue to this About section.",
        action: "Open page",
        icon: FileText,
      }),
    }));

  const leftLinks = navigationLinks.slice(0, 2);
  const rightLinks = navigationLinks.slice(2);
  const vision = overview.vision || officialVision;
  const mission = overview.mission || officialMission;

  const heroStats = [
    {
      value: factValue(quickFacts?.founding_year, "1965"),
      label: "Established",
      detail: "Teacher training roots",
    },
    {
      value: factValue(quickFacts?.land_acres ?? quickFacts?.acres, "61"),
      label: "Acres Donated",
      detail: "County Council of Gusii",
    },
    {
      value: "1994",
      label: "Egerton Campus",
      detail: "University campus phase",
    },
    {
      value: factValue(quickFacts?.charter_year, "2013"),
      label: "University Charter",
      detail: "Granted February 6",
    },
  ];

  const mandateStatements = [
    {
      ...mandateCards[0],
      text: mission,
    },
    {
      ...mandateCards[1],
      text: vision,
    },
    {
      ...mandateCards[2],
      text: officialPhilosophy,
    },
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
          <div className="relative w-full">
            <BreadcrumbTrail items={breadcrumbItems} />

            <div className="mt-7 grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)_316px] lg:items-start">
              <nav
                aria-label="About section links"
                className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur lg:sticky lg:top-28"
              >
                <p className="px-2 text-xs font-semibold uppercase text-secondary">
                  Explore About
                </p>
                <ul className="mt-3 space-y-2">
                  {leftLinks.map((item) => {
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

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                  <p className="text-sm font-semibold uppercase text-secondary">
                    About Kisii University
                  </p>
                  <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl">
                    {vision}
                  </h1>
                  <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                    {aboutIntro}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/about/leadership"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                      University Leadership
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/about/university-management"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                    >
                      University Management
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>

                  <AboutIllustration
                    src={aboutIllustrations.overview}
                    alt="Students and faculty moving through a modern university campus courtyard"
                    priority
                    sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, 100vw"
                    className="mt-8 aspect-[16/7] min-h-[240px] shadow-none"
                  />

                  <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      At a glance
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {heroStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none text-slate-950">
                            {stat.value}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {stat.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <nav
                  aria-label="Related institutional pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {rightLinks.map((item) => {
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

                <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <p className="text-xs font-semibold uppercase text-secondary">
                    Institutional Focus
                  </p>
                  <p className="mt-5 text-sm leading-7 text-white/80 sm:text-base">
                    {mission}
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-xs font-semibold text-white/50">
                      Mission, vision, philosophy, and values
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase text-secondary">
                Discover Our Story
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                From teacher training roots to a chartered university
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                The overview follows the public institutional record from the
                1965 founding through the 2013 charter, keeping the story
                anchored to dated milestones and official institutional
                statements.
              </p>
              <div className="mt-7 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Overview focus
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  History, mandate, values, and onward About pathways are
                  presented together so visitors can orient themselves before
                  opening a more specific institutional page.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 hidden h-full w-px bg-slate-200 md:block lg:left-1/2" />
              <div className="grid gap-5 md:grid-cols-2">
                {historyTimeline.map((item, index) => (
                  <article
                    key={`${item.year}-${item.title}`}
                    className={`relative rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.38)] ${
                      index % 2 === 1 ? "md:mt-12" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                          timelineAccents[index % timelineAccents.length]
                        }`}
                      >
                        {item.year}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold leading-7 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Institutional Mandate
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  What guides the university
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                Visitors can quickly separate the university's operational
                mission, future-facing vision, and guiding philosophy before
                continuing into governance or management pages.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {mandateStatements.map((item, index) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.label}
                    className={`rounded-[1.75rem] border border-slate-200 p-7 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.4)] ${item.panel}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold uppercase text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-7 text-xs font-semibold uppercase text-primary">
                      {item.label}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-7 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-base leading-8 text-slate-700">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)]">
            <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="border-b border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-sm font-semibold uppercase text-secondary">
                  Core Values
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
                  Principles behind the public mandate
                </h2>
                <p className="mt-5 text-base leading-8 text-white/70">
                  These values frame the tone for teaching, research,
                  engagement, and institutional decision-making.
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
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Continue Through About
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Choose the institutional detail you need next
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                The overview ends with direct routes into the public About
                sections, so visitors can move from orientation into the
                specific governance, management, administrative, or service
                charter information they came for.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {navigationLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-[260px] flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200 transition group-hover:bg-primary group-hover:text-white">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-xl font-semibold leading-7 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
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
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
