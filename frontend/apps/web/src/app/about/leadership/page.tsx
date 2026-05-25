import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  History,
  Landmark,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { LeaderCard } from "@/components/about/LeaderCard";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getLeadershipData, quickNavigation } from "@/lib/about-data";

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
  "/about/quality-assurance": {
    title: "Quality Assurance",
    href: "/about/quality-assurance",
    description:
      "Review public quality, strategic plan, service charter, and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
  "/about/governance-leadership": {
    title: "Governance & Leadership",
    href: "/about/governance-leadership",
    description:
      "Open the combined view that connects council oversight with executive leadership.",
    action: "Open combined page",
    icon: ShieldCheck,
  },
  "/about/university-management": {
    title: "University Management",
    href: "/about/university-management",
    description:
      "Review the published management board and senior office responsibilities.",
    action: "View management",
    icon: Users,
  },
  "/about/administrative-division": {
    title: "Administrative Division",
    href: "/about/administrative-division",
    description:
      "Explore administrative units supporting institutional operations and public service.",
    action: "View divisions",
    icon: Building2,
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

const structureNodes = [
  {
    title: "Office of the Vice Chancellor",
    body: "Executive leadership for institutional direction, public representation, and management board coordination.",
    icon: UserRound,
  },
  {
    title: "Deputy Vice Chancellors",
    body: "Senior portfolio leadership for academic, research, student affairs, administration, planning, and finance.",
    icon: GraduationCap,
  },
  {
    title: "Registrars and Finance",
    body: "Published senior officers supporting academic affairs, central services, research, resource mobilization, and finance.",
    icon: FileText,
  },
  {
    title: "School Leadership Records",
    body: "Dean information is shown from school records for the role.",
    icon: Building2,
  },
];

function leaderProfileHref(slug: string) {
  return `/about/leadership/${slug}`;
}

export default async function LeadershipPage() {
  const leadership = await getLeadershipData();
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/leadership",
  );
  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/history"],
    routeMeta["/about/mission-vision"],
    routeMeta["/about/governance"],
    routeMeta["/about/quality-assurance"],
    routeMeta["/about/governance-leadership"],
    routeMeta["/about/university-management"],
    routeMeta["/about/administrative-division"],
    routeMeta["/about/service-charter"],
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
                { label: "Leadership" },
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
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      University Leadership
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      Executive leadership from published university records
                    </h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                      Kisii University&apos;s leadership directory highlights the
                      Vice Chancellor, deputy vice chancellors, registrars,
                      finance leadership, and school-level records that are
                      available from public institutional data.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={leaderProfileHref(leadership.featuredLeader.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                      >
                        View Vice Chancellor Profile
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

                    <AboutIllustration
                      src={aboutIllustrations.leadership}
                      alt="University academic leaders walking through a campus colonnade"
                      priority
                      sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, 100vw"
                      className="mt-8 aspect-[16/7] min-h-[240px] shadow-none"
                    />
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Leadership groups
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {[
                        {
                          label: "Executive Lead",
                          value: "Vice Chancellor",
                          icon: UserRound,
                        },
                        {
                          label: "Deputy Portfolios",
                          value: "ARSA and AP&F",
                          icon: GraduationCap,
                        },
                        {
                          label: "Published Officers",
                          value: "Registrars and Finance",
                          icon: FileText,
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                              <Icon aria-hidden className="h-5 w-5" />
                            </span>
                            <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">
                              {item.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase text-secondary">
                    Public directory
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Cards use the public leadership records available in the
                    current About data. Missing portraits use initials instead
                    with official profile imagery.
                  </p>
                </div>

                <nav
                  aria-label="Related leadership pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {relatedRoutes.slice(3, 6).map((item) => {
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

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid w-full gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-stretch">
            <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)] sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase text-secondary">
                Office of the Vice Chancellor
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
                The executive lead for the university
              </h2>
              <p className="mt-6 text-base leading-8 text-white/75">
                The Vice Chancellor is presented in the published institutional
                structure as the head of the University Management Board and
                Secretary to the University Council.
              </p>
              <Link
                href="/about/university-management"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open University Management
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>

            <LeaderCard
              leader={leadership.featuredLeader}
              href={leaderProfileHref(leadership.featuredLeader.slug)}
              featured
            />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid w-full gap-10 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
            <div className="xl:sticky xl:top-28">
              <p className="text-sm font-semibold uppercase text-secondary">
                Leadership Structure
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                A directory organized by public institutional roles
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                The page separates executive leadership, deputy portfolios,
                published registrar and finance roles, and school leadership
                records so visitors can scan the structure without mixing it
                with governance bodies.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {structureNodes.map((node) => {
                const Icon = node.icon;

                return (
                  <article
                    key={node.title}
                    className="min-h-[230px] rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-950">
                      {node.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {node.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Deputy Vice Chancellors
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Senior portfolio leadership
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                Deputy Vice Chancellors are shown from the public management
                board records, with profile routes available for the current
                leadership entries.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {leadership.deputies.map((leader) => (
                <LeaderCard
                  key={leader.slug}
                  leader={leader}
                  href={leaderProfileHref(leader.slug)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Registrars and Finance
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Published senior officer roles
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                Registrar and finance records are grouped separately from the
                deputy portfolios so each public office can be found quickly.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {leadership.registrars.map((leader) => (
                <LeaderCard
                  key={leader.slug}
                  leader={leader}
                  href={leaderProfileHref(leader.slug)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid w-full gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                School Leadership Records
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                Dean information remains tied to school data
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                School-level leadership is only shown where public school
                records provide the dean name.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {leadership.deans.length ? (
                leadership.deans.map((leader) => (
                  <LeaderCard key={leader.slug} leader={leader} />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600 md:col-span-2">
                  No public dean records are currently published by the school
                  public record.
                </div>
              )}
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
                  Open related institutional context
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                Leadership sits alongside the university&apos;s history,
                mission, governance, management, administration, and service
                commitments.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-9">
              {relatedRoutes.map((item) => {
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
                    <h3 className="mt-6 text-lg font-semibold leading-7 text-slate-950">
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
