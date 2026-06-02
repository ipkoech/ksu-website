import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  History,
  Landmark,
  ScrollText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  aboutIntro,
  getOverviewData,
  historyTimeline,
  quickNavigation,
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

const timelineAccents = [
  "border-primary/25 bg-primary/10 text-primary",
  "border-secondary/25 bg-orange-50 text-secondary",
  "border-slate-300 bg-white text-slate-950",
  "border-primary/25 bg-blue-50 text-primary",
  "border-secondary/25 bg-orange-50 text-secondary",
  "border-slate-300 bg-white text-slate-950",
];

const eraGroups = [
  {
    title: "Foundations",
    years: ["1965", "1983"],
    description:
      "The institution began with teacher training roots and later expanded into secondary teacher education.",
    icon: BookOpenCheck,
  },
  {
    title: "Campus Growth",
    years: ["1994", "1999"],
    description:
      "Egerton University took over the college as a campus before degree-level academic programming was introduced.",
    icon: GraduationCap,
  },
  {
    title: "Chartered University",
    years: ["2007", "2013"],
    description:
      "Constituent college status prepared the institution for the charter granted under the Universities Act 2012.",
    icon: Landmark,
  },
];

const relatedRoutes: RouteCard[] = [
  {
    title: "About Overview",
    href: "/about",
    description:
      "Return to the consolidated About overview for mission, vision, values, and institutional pathways.",
    action: "Back to overview",
    icon: History,
  },
  {
    title: "Quality Assurance",
    href: "/about/quality-assurance",
    description:
      "Review public quality, strategic plan, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
  {
    title: "University Management",
    href: "/about/university-management",
    description:
      "Review the published management board and senior office responsibilities.",
    action: "View management",
    icon: Users,
  },
  {
    title: "Our Service Charter",
    href: "/about/service-charter",
    description:
      "Open the public service charter access point for service commitments and accountability information.",
    action: "Open charter",
    icon: ClipboardCheck,
  },
];

function factValue(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

export default async function AboutHistoryPage() {
  const overview = await getOverviewData();
  const quickFacts = overview.quick_facts as Record<string, unknown> | undefined;
  const routeLinks = quickNavigation.filter((item) => item.href !== "/about/history");

  const heroFacts = [
    {
      value: factValue(quickFacts?.founding_year, "1965"),
      label: "Established",
      detail: "Primary Teachers Training College",
    },
    {
      value: factValue(quickFacts?.land_acres ?? quickFacts?.acres, "61"),
      label: "Acres Donated",
      detail: "County Council of Gusii",
    },
    {
      value: "1994",
      label: "Egerton Campus",
      detail: "Government-mandated takeover",
    },
    {
      value: "2007",
      label: "Constituent College",
      detail: "Legal Notice No. 163",
    },
    {
      value: factValue(quickFacts?.charter_year, "2013"),
      label: "Charter Granted",
      detail: "February 6, Legal Notice No. 225",
    },
  ];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
          <div className="relative w-full">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "History" },
              ]}
            />

            <div className="mt-7 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px] xl:items-start">
              <nav
                aria-label="About section links"
                className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur xl:sticky xl:top-28"
              >
                <p className="px-2 text-xs font-semibold uppercase text-secondary">
                  Explore About
                </p>
                <ul className="mt-3 space-y-2">
                  {routeLinks.slice(0, 4).map((item) => (
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

              <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      Kisii University History
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-white sm:text-5xl xl:text-6xl">
                      From teacher training roots to chartered university status
                    </h1>
                    <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
                      {overview.history_summary || aboutIntro}
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
                        href="/about/governance"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Explore Governance
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>

                    <AboutIllustration
                      src="/images/about/about-history-hero-branded.webp"
                      alt="Historical campus growth from teacher training roots to university status"
                      priority
                      sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, 100vw"
                      className="mt-8 aspect-[16/7] min-h-[240px] border-white/10 bg-white/5 shadow-none"
                    />
                  </div>

                  <div className="border-t border-white/10 bg-white/[0.04] p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase text-white/50">
                      Historical anchors
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {heroFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                        >
                          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none text-white">
                            {fact.value}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {fact.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-white/60">
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
                    Timeline Span
                  </p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-slate-950">
                    1965-2013
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    The public history follows dated milestones from the
                    institution's founding through the charter granted on
                    February 6, 2013.
                  </p>
                </div>

                <nav
                  aria-label="Related history pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {relatedRoutes.slice(1, 4).map((item) => {
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
          className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="grid w-full gap-10 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
            <div className="xl:sticky xl:top-28">
              <p className="text-sm font-semibold uppercase text-secondary">
                Timeline Journey
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                Six milestones that define the institutional path
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Each milestone is kept tied to a year and a public event,
                making the page easy to scan without adding unsupported claims
                or decorative history.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 hidden h-full w-px bg-slate-200 md:block xl:left-1/2" />
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
            <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Era Synthesis
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  The journey in three readable phases
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                The timeline can be understood as a progression from teacher
                education foundations, through campus and academic growth, into
                the chartered university era.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {eraGroups.map((era) => {
                const Icon = era.icon;

                return (
                  <article
                    key={era.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.4)]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-950">
                      {era.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      {era.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {era.years.map((year) => (
                        <span
                          key={year}
                          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          {year}
                        </span>
                      ))}
                    </div>
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
          <div className="grid w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)] lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="p-7 sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase text-secondary">
                Charter and Public Mandate
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
                The 2013 charter marks the transition into full university status
              </h2>
              <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
                On February 6, 2013, Kisii University was granted a charter
                through Legal Notice No. 225 in accordance with the Universities
                Act 2012.
              </p>
            </div>
            <div className="border-t border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-l lg:border-t-0">
              <div className="grid gap-4">
                {[
                  {
                    label: "Legal Notice",
                    value: "No. 225",
                    icon: ScrollText,
                  },
                  {
                    label: "Charter Date",
                    value: "Feb 6, 2013",
                    icon: CalendarDays,
                  },
                  {
                    label: "Framework",
                    value: "Universities Act 2012",
                    icon: Landmark,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-xs font-semibold uppercase text-white/50">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
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
