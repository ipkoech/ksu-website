import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Compass,
  GraduationCap,
  History,
  Landmark,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import type { LeaderCardData } from "@/components/about/LeaderCard";
import { AboutSidebarNav } from "@/components/about/about-sidebar-nav";
import { ScrollReveal } from "@ksu/ui/components";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getGovernanceBoard,
  getLeadershipData,
  getOverviewData,
  quickNavigation,
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
  "/about/history": {
    title: "History",
    href: "/about/history",
    description: "Follow the institutional journey.",
    action: "View history",
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
    description: "Review University Council governance.",
    action: "View governance",
    icon: Landmark,
  },
  "/about/quality-assurance": {
    title: "Quality Assurance",
    href: "/about/quality-assurance",
    description: "Review quality and accountability references.",
    action: "View quality",
    icon: ClipboardCheck,
  },
};

function leaderProfileHref(slug: string) {
  return `/about/university-management/${slug}`;
}

function isPlaceholderMember(member: BoardMember) {
  return member.name.trim().toLowerCase().startsWith("published via");
}

function leaderToBoardMember(leader: LeaderCardData): BoardMember {
  return {
    name: leader.name,
    role: leader.role,
    photoUrl:
      leader.photoUrl ||
      (leader.role === "Vice Chancellor" ? "/logos/vc3.jpg" : undefined),
  };
}

export default async function UniversityManagementPage() {
  const [leadership, overview, senate] = await Promise.all([
    getLeadershipData(),
    getOverviewData(),
    getGovernanceBoard("senate"),
  ]);
  const navigationLinks = quickNavigation.filter(
    (item) => item.href !== "/about/university-management",
  );
  const relatedRoutes = [
    routeMeta["/about"],
    routeMeta["/about/history"],
    routeMeta["/about/mission-vision"],
    routeMeta["/about/governance"],
    routeMeta["/about/quality-assurance"],
  ];
  const senateMembers = (senate?.members ?? []).filter(
    (member) => !isPlaceholderMember(member),
  );
  const viceChancellor = leadership.featuredLeader;
  const vcPhotoUrl = viceChancellor.photoUrl || "/logos/vc3.jpg";
  const managementMembers = [
    viceChancellor,
    ...leadership.deputies,
    ...leadership.registrars,
  ].map(leaderToBoardMember);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative w-full">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "University Management" },
              ]}
            />

            <div className="mt-7 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px] xl:items-start">
              <AboutSidebarNav
                items={navigationLinks.slice(0, 6).map((item) => ({
                  title: item.title,
                  href: item.href,
                  icon: ChevronRight,
                }))}
                title="Explore About"
                ariaLabel="About section links"
                className="xl:sticky xl:top-28"
              />

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      University Management
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      Vice Chancellor, senior leadership, and Senate
                    </h1>
                    <article className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                        {overview.vc_message_title ||
                          "Message from the Vice Chancellor"}
                      </p>
                      <blockquote className="mt-3 text-base font-semibold leading-8 text-slate-800">
                        {overview.vc_message ||
                          "The Vice Chancellor welcomes students and stakeholders to a dynamic institution committed to academic excellence, research, and social responsibility."}
                      </blockquote>
                    </article>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={leaderProfileHref(viceChancellor.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                      >
                        View Vice Chancellor Profile
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-950 p-4 lg:border-l lg:border-t-0">
                    <PublicImage
                      src={vcPhotoUrl}
                      alt={viceChancellor.name}
                      ratio="profile"
                      priority
                      sizes="(min-width: 1280px) 340px, (min-width: 1024px) 30vw, 100vw"
                      className="h-full min-h-[340px] rounded-[1.5rem]"
                    />
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <AboutSidebarNav
                  items={relatedRoutes.map((item) => ({
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                  }))}
                  title="Related Pages"
                  ariaLabel="Related university management pages"
                />
              </aside>
            </div>
          </div>
        </section>

        <ScrollReveal
          as="section"
          className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
            <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <GovernanceChart
                managementOnly
                title="Vice Chancellor and university management"
                description="The chart follows the same structure used on Governance, with the Vice Chancellor at the top and management portfolios grouped below."
                ariaLabel="Kisii University university management org chart"
                senateDescription={senate?.mandate}
                managementMembers={managementMembers}
                senateMembers={senateMembers}
              />
            </div>

            <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.7)] xl:sticky xl:top-28 xl:self-start">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
                <Users aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                University Management Mandate
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                Execute strategy and serve the university community
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/75">
                The Vice Chancellor leads institutional execution through the
                deputy vice chancellors, registrars, and finance office. These
                offices coordinate academic delivery, research, student
                affairs, administration, planning, human resources, resource
                mobilization, and financial stewardship.
              </p>
              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                {[
                  ["Executive Lead", "Vice Chancellor"],
                  ["Deputy Portfolios", String(leadership.deputies.length)],
                  ["Registrar and Finance Offices", String(leadership.registrars.length)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/45">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </ScrollReveal>

        {senateMembers.length ? (
          <ScrollReveal
            as="section"
            className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
          >
            <div className="grid w-full gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-28 xl:self-start">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <GraduationCap aria-hidden className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Senate
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
                  Academic authority for standards and scholarship
                </h2>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {senate?.mandate ||
                    "Oversees academic standards, programme quality, examinations, and scholarly direction."}
                </p>
                <Link
                  href="/about/mission-vision"
                  className="mt-6 inline-flex items-center gap-2 border-t border-slate-200 pt-5 text-sm font-semibold text-primary"
                >
                  View mission, vision, and values
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </aside>

              <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase text-secondary">
                    Senate Members
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                    Published Senate records
                  </h2>
                </div>
                <BoardMemberGrid members={senateMembers} />
              </div>
            </div>
          </ScrollReveal>
        ) : null}
      </AboutPageLenis>
    </PageShell>
  );
}
