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
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AboutIllustration,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import {
  getGovernanceData,
  getOverviewData,
  governanceFallback,
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
  "/about/leadership": {
    title: "Leadership",
    href: "/about/leadership",
    description:
      "Find the Vice Chancellor, deputy vice chancellors, registrars, finance officer, and school-level leadership records.",
    action: "View leadership",
    icon: Users,
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
      "See the combined governance and leadership context for the institution.",
    action: "Open combined page",
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

const governanceAnchors = [
  {
    title: "University Council",
    body: "Policy oversight, fiduciary stewardship, and institutional accountability.",
    icon: ShieldCheck,
  },
  {
    title: "Senate",
    body: "Academic authority for curriculum, standards, research, and examinations.",
    icon: BookOpenCheck,
  },
  {
    title: "Management Board",
    body: "Day-to-day administration and implementation of policy and strategic direction.",
    icon: Users,
  },
];

function boardAction(slug?: string) {
  if (!slug) {
    return null;
  }

  return `/about/governance/${slug}`;
}

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
  const [liveBoards, overview] = await Promise.all([
    getGovernanceData(),
    getOverviewData(),
  ]);
  const mergedFallbackBoards = governanceFallback.map((fallbackBoard) => {
    const liveBoard = liveBoards.find((board) => board.slug === fallbackBoard.slug);

    if (!liveBoard) {
      return fallbackBoard;
    }

    return {
      ...liveBoard,
      board_type: fallbackBoard.board_type || liveBoard.board_type,
      description: fallbackBoard.description || liveBoard.description,
      mandate: fallbackBoard.mandate || liveBoard.mandate,
      members: liveBoard.members?.length ? liveBoard.members : fallbackBoard.members,
      meeting_schedule:
        fallbackBoard.meeting_schedule || liveBoard.meeting_schedule,
    };
  });
  const extraBoards = liveBoards.filter(
    (board) =>
      !mergedFallbackBoards.some(
        (fallbackBoard) => fallbackBoard.slug === board.slug,
      ),
  );
  const boards = [...mergedFallbackBoards, ...extraBoards];
  const council =
    boards.find((board) => board.slug === "university-council") ??
    governanceFallback.find((board) => board.slug === "university-council");
  const senate =
    boards.find((board) => board.slug === "senate") ??
    governanceFallback.find((board) => board.slug === "senate");
  const managementBoard =
    boards.find((board) => board.slug === "management-board") ??
    governanceFallback.find((board) => board.slug === "management-board");
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/governance",
  );
  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/history"],
    routeMeta["/about/mission-vision"],
    routeMeta["/about/leadership"],
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
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      Governance
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      Institutional oversight and public accountability
                    </h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                      Kisii University's public governance structure centers on
                      the University Council, with Senate and the Management
                      Board supporting academic authority and institutional
                      implementation.
                    </p>
                    <article className="mt-8 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                        {overview.vc_message_title ||
                          "Message from the Vice Chancellor"}
                      </p>
                      <blockquote className="mt-3 text-base font-semibold leading-8 text-slate-800">
                        {overview.vc_message ||
                          "The Vice Chancellor welcomes students and stakeholders to a dynamic institution committed to academic excellence, research, and social responsibility."}
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
                      <Link
                        href="/about/governance-leadership"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                      >
                        Governance & Leadership
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>

                    <AboutIllustration
                      src={aboutIllustrations.governance}
                      alt="University governance meeting with council members reviewing policy"
                      priority
                      sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, 100vw"
                      className="mt-8 aspect-[16/7] min-h-[240px] shadow-none"
                    />
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Governance anchors
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {governanceAnchors.map((anchor) => {
                        const Icon = anchor.icon;

                        return (
                          <div
                            key={anchor.title}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                              <Icon aria-hidden className="h-5 w-5" />
                            </span>
                            <p className="mt-4 text-sm font-semibold text-slate-900">
                              {anchor.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {anchor.body}
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
                    Public Governance
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Governance information is presented from public board
                    descriptions, mandates, and published member records.
                  </p>
                </div>

                <nav
                  aria-label="Related governance pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {relatedRoutes.slice(2, 5).map((item) => {
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

        <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <GovernanceChart
              councilDescription={council?.description}
              senateDescription={senate?.description}
              managementDescription={managementBoard?.description}
              councilMembers={council?.members ?? []}
              senateMembers={senate?.members ?? []}
              managementMembers={managementBoard?.members ?? []}
            />
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid w-full overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_-44px_rgba(15,23,42,0.7)] lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="p-7 sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase text-secondary">
                University Council
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
                The primary public governance body
              </h2>
              <p className="mt-6 text-base leading-8 text-white/75 sm:text-lg">
                {council?.description ||
                  "The University Council is the supreme governing body responsible for policy oversight, fiduciary stewardship, and institutional accountability."}
              </p>
              <p className="mt-5 text-base leading-8 text-white/70">
                {council?.mandate ||
                  "Provides strategic oversight, approves policy, and safeguards the university's public mandate under the charter and Universities Act framework."}
              </p>
              <Link
                href="/about/governance/university-council"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Open full council page
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="border-t border-white/10 bg-white/[0.04] p-7 sm:p-8 lg:border-l lg:border-t-0">
              <div className="grid gap-4">
                {[
                  {
                    label: "Board Type",
                    value: boardTypeLabel(council?.board_type),
                    icon: Landmark,
                  },
                  {
                    label: "Public Members",
                    value: String(council?.members?.length ?? 0),
                    icon: Users,
                  },
                  {
                    label: "Meeting Schedule",
                    value: council?.meeting_schedule || "Not published",
                    icon: FileText,
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
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Governance Bodies
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  Published boards and institutional functions
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                    Each board card uses the public board description and
                    mandate . Detail links open the board page
                    where a public route exists.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {boards.map((board) => {
                const href = boardAction(board.slug);

                return (
                  <article
                    key={board.slug || board.id}
                    className="flex min-h-[320px] flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase text-primary">
                      {boardTypeLabel(board.board_type)}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-950">
                      {board.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {board.description || board.mandate || "Governance details are published through board records."}
                    </p>
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Mandate
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {board.mandate || "Mandate details are not published."}
                      </p>
                    </div>
                    {href ? (
                      <Link
                        href={href}
                        className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
                      >
                        Open board page
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

      </AboutPageLenis>
    </PageShell>
  );
}
