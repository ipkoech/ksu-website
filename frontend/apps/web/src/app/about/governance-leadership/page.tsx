import Link from "next/link";
import { Button } from "@ksu/ui/components";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import { LeaderCard } from "@/components/about/LeaderCard";
import {
  BreadcrumbTrail,
  PageShell,
} from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getGovernanceBoard, getLeadershipData, getOverviewData } from "@/lib/about-data";

export default async function GovernanceLeadershipPage() {
  const [council, leadership, overview] = await Promise.all([
    getGovernanceBoard("university-council"),
    getLeadershipData(),
    getOverviewData(),
  ]);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full px-4 py-10 sm:px-6 lg:px-8 md:py-14">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Governance & Leadership" },
            ]}
          />

          <div className="mt-8 grid gap-10 border-y border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_40%,#eef4ff_100%)] py-12 lg:grid-cols-[minmax(0,1.25fr)_360px] lg:items-start">
            <div className="px-1 sm:px-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                Governance and Leadership
              </p>
              <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 sm:text-5xl xl:text-6xl">
                Institutional oversight and executive leadership presented in one clear structure.
              </h1>
              <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                Kisii University&apos;s public governance structure centers on the University Council,
                with executive leadership led through the Office of the Vice Chancellor. This page
                brings those roles together without repeating the same institutional context across
                separate sections.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="border-l-2 border-primary/70 pl-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Governing Organ
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    University Council
                  </p>
                </div>
                <div className="border-l-2 border-primary/70 pl-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Executive Lead
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    Vice Chancellor
                  </p>
                </div>
                <div className="border-l-2 border-primary/70 pl-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Supporting Roles
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    DVCs and Deans
                  </p>
                </div>
              </div>
            </div>

            <article className="border-l border-slate-200/80 pl-0 text-slate-950 lg:pl-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                {overview.chancellor_message_title || "Message from the Chancellor"}
              </p>
              <blockquote className="mt-5 font-[family-name:var(--font-display)] text-3xl leading-tight text-slate-950 sm:text-4xl">
                {overview.chancellor_message ||
                  "The current official About sources do not publish a dedicated Chancellor message."}
              </blockquote>
              <div className="mt-6 h-px w-20 bg-slate-300" />
            </article>
          </div>
        </section>

        <section className="w-full px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            {council ? (
              <article className="border-b border-slate-200 pb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                  University Council
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950 sm:text-4xl">
                  {council.name}
                </h2>
                <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600">
                  {council.mandate || "Governance details are published through the Council page."}
                </p>
                <div className="mt-10">
                  <BoardMemberGrid members={council.members} />
                </div>
                <Button variant="outline" className="mt-8" asChild>
                  <Link href="/about/governance/university-council">Open full council page</Link>
                </Button>
              </article>
            ) : null}

            <div className="space-y-8 border-t border-slate-200 pt-8 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
              <article>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                  Executive Leadership
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                  Office of the Vice Chancellor
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  The Vice Chancellor is presented in the published institutional structure as the
                  head of the University Management Board and the Secretary to the University Council.
                </p>
              </article>

              <LeaderCard
                leader={leadership.featuredLeader}
                href={`/about/leadership/${leadership.featuredLeader.slug}`}
                featured
              />
            </div>
          </div>
        </section>

        <section className="w-full px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-t border-slate-200 pt-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <article>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                Deputy Vice Chancellors
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                Academic and administrative leadership roles.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                These roles support academic affairs, research, student experience, administration,
                planning, and finance within the published management structure.
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {leadership.deputies.map((leader) => (
                  <LeaderCard
                    key={leader.slug}
                    leader={leader}
                    href={`/about/leadership/${leader.slug}`}
                  />
                ))}
              </div>
            </article>

            <article className="border-t border-slate-200 pt-10 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                Academic Units
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                School-level leadership records.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Where academic unit data is available, dean records remain accessible here for
                direct institutional navigation.
              </p>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {leadership.deans.map((leader) => (
                  <LeaderCard key={leader.slug} leader={leader} />
                ))}
              </div>
            </article>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
