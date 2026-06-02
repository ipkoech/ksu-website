import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  GraduationCap,
  History,
  Landmark,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import type { LeaderCardData } from "@/components/about/LeaderCard";
import { ScrollReveal } from "@ksu/ui/components";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getGovernanceBoard,
  getLeadershipData,
  getOverviewData,
  officialMission,
  officialVision,
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
    description: "Return to the consolidated About overview.",
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
    title: "Mission & Vision",
    href: "/about/mission-vision",
    description: "Read the university mandate.",
    action: "View mandate",
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

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isPlaceholderMember(member: BoardMember) {
  return member.name.trim().toLowerCase().startsWith("published via");
}

function LeaderNode({
  leader,
}: {
  leader: LeaderCardData;
}) {
  const photoUrl =
    leader.photoUrl || (leader.role === "Vice Chancellor" ? "/logos/vc3.jpg" : undefined);

  return (
    <article className="min-w-0 overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex h-20 w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
        {photoUrl ? (
          <PublicImage
            src={photoUrl}
            alt={leader.name}
            ratio="card"
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 100vw"
            className="h-full w-full"
          />
        ) : (
          initialsFromName(leader.name)
        )}
      </div>
      <div className="min-w-0 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-950">
          {leader.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-secondary">
          {leader.role}
        </p>
      </div>
    </article>
  );
}

function UniversityManagementOrgChart({
  viceChancellor,
  deputies,
  officers,
}: {
  viceChancellor: LeaderCardData;
  deputies: LeaderCardData[];
  officers: LeaderCardData[];
}) {
  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-sm">
        <LeaderNode
          leader={viceChancellor}
        />
      </div>
      <div className="mx-auto h-5 w-px bg-slate-200" />
      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Deputy Vice Chancellors
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {deputies.map((leader) => (
            <LeaderNode
              key={leader.slug}
              leader={leader}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto h-5 w-px bg-slate-200" />
      <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Registrars and Finance
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {officers.map((leader) => (
            <LeaderNode
              key={leader.slug}
              leader={leader}
            />
          ))}
        </div>
      </div>
    </div>
  );
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
                { label: "University Management" },
              ]}
            />

            <div className="mt-7 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px] xl:items-start">
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
                <nav
                  aria-label="Related university management pages"
                  className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    Related Pages
                  </p>
                  <ul className="mt-3 space-y-2">
                    {relatedRoutes.map((item) => {
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
            <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-secondary">
                    University Management Org Chart
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
                    Vice Chancellor, deputies, registrars, and finance
                  </h2>
                </div>
              </div>
              <UniversityManagementOrgChart
                viceChancellor={viceChancellor}
                deputies={leadership.deputies}
                officers={leadership.registrars}
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
                offices coordinate academic delivery, research, student affairs,
                administration, planning, human resources, resource mobilization,
                and financial stewardship.
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
              <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Vision
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {officialVision}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Mission
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {officialMission}
                  </p>
                </div>
              </div>
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
              {senateMembers.length ? (
                <BoardMemberGrid members={senateMembers} />
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                  No named Senate member records are currently published in the
                  public data source. When published, members will render here
                  from the backend record.
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </AboutPageLenis>
    </PageShell>
  );
}
