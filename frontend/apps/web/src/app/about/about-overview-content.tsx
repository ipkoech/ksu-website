import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
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
    title: "Creating a transformative environment",
    icon: BookOpenCheck,
    panel: "bg-white",
  },
  {
    label: "Vision",
    title: "Inclusive, borderless, and change-making",
    icon: Compass,
    panel: "bg-blue-50/80",
  },
  {
    label: "Philosophy",
    title: "Creative and responsive service to humanity",
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

export async function AboutOverviewContent({
  breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About" }],
}: AboutOverviewContentProps) {
  const overview = await getOverviewData();

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
        <section className="relative min-h-[55vh] overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#eef4ff_100%)] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="relative w-full">
            <BreadcrumbTrail items={breadcrumbItems} />

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:items-start">
              <nav
                aria-label="About section links"
                className="rounded-[1rem] border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur lg:sticky lg:top-28"
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
                          className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
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

              <aside>
                <nav
                  aria-label="Related institutional pages"
                  className="rounded-[1rem] border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur"
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
                            className="group flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
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
          className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="grid w-full gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase text-secondary">
                Discover Our Story
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                From teacher training roots to a chartered university
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Kisii University began as a teacher training college in 1965,
                grew through Egerton University, and became a chartered
                university on February 6, 2013.
              </p>
              <div className="mt-7 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Overview focus
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start with the institution's history, mission, vision, core
                  values, leadership, governance, quality, and service
                  commitments.
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
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
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
                These are the official statements that guide institutional
                purpose, direction, and culture.
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
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
        >
          <div className="w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)]">
            <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="border-b border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-sm font-semibold uppercase text-secondary">
                  Core Values
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight">
                  Core values
                </h2>
                <p className="mt-5 text-base leading-8 text-white/70">
                  The values describe how the university expects people,
                  ideas, and decisions to be treated.
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
        </ScrollReveal>

      </AboutPageLenis>
    </PageShell>
  );
}
