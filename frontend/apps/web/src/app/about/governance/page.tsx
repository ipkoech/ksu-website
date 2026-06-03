import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Compass,
  History,
  Landmark,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { ScrollReveal } from "@ksu/ui/components";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import {
  getGovernanceBoard,
  getOverviewData,
  quickNavigation,
} from "@/lib/about-data";
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

function boardTypeLabel(boardType?: string) {
  if (!boardType) {
    return "Board";
  }

  return boardType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function GovernancePage() {
  const [council, overview] = await Promise.all([
    getGovernanceBoard("university-council"),
    getOverviewData(),
  ]);
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/governance",
  );
  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/history"],
    routeMeta["/about/mission-vision"],
    routeMeta["/about/university-management"],
    routeMeta["/about/quality-assurance"],
    routeMeta["/about/service-charter"],
  ];
  const chancellorMessage =
    overview.chancellor_message?.replace(
      " and Senate",
      "",
    ) ||
    "The Chancellor guides the University Council in safeguarding the university's charter, public mandate, and accountability to students, staff, partners, and the community.";

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
                { label: "Governance" },
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
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      University Governance
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      University Council governance and accountability
                    </h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                      University governance is presented through the University
                      Council, the institution's public oversight body chaired
                      under the leadership of the Chancellor.
                    </p>
                    <article className="mt-8 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                        {overview.chancellor_message_title ||
                          "Message from the Chancellor"}
                      </p>
                      <blockquote className="mt-3 text-base font-semibold leading-8 text-slate-800">
                        {chancellorMessage}
                      </blockquote>
                    </article>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/about/governance/university-council"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                      >
                        View University Council
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 bg-slate-950 p-4 lg:border-l lg:border-t-0">
                    <AboutIllustration
                      src={aboutIllustrations.governance}
                      alt="University Council governance meeting"
                      priority
                      sizes="(min-width: 1280px) 320px, (min-width: 1024px) 30vw, 100vw"
                      className="aspect-[4/3] min-h-[260px] shadow-none"
                    />
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <nav
                  aria-label="Related governance pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {relatedRoutes.slice(0, 5).map((item) => {
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
          className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
            <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <GovernanceChart
                councilOnly
                councilDescription={council?.description}
                councilMembers={council?.members ?? []}
              />
            </div>
            <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.7)] xl:sticky xl:top-28 xl:self-start">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                <Landmark aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Mandate of the Council
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                Oversight, policy, and public stewardship
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/75">
                {council?.mandate ||
                  "Provides strategic oversight, approves policy, and safeguards the university's public mandate under the charter and Universities Act framework."}
              </p>
            </aside>
          </div>
        </ScrollReveal>

      </AboutPageLenis>
    </PageShell>
  );
}
