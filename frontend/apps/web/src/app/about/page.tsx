import Link from "next/link";
import {
  aboutIntro,
  getOverviewData,
  historyTimeline,
  officialMission,
  officialPhilosophy,
  quickNavigation,
} from "@/lib/about-data";
import {
  BreadcrumbTrail,
  PageShell,
} from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import AboutUsSection from "@/components/ui/about-us-section";

export default async function AboutPage() {
  const overview = await getOverviewData();
  const sideLinks = quickNavigation.filter((item) => item.href !== "/about");
  const leftLinks = sideLinks.slice(0, Math.ceil(sideLinks.length / 2));
  const rightLinks = sideLinks.slice(Math.ceil(sideLinks.length / 2));

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full px-4 py-10 sm:px-6 lg:px-8 md:py-14">
          <BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <div className="mt-8 grid gap-8 border-y border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_42%,#eef4ff_100%)] py-10 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:items-stretch lg:gap-10 lg:px-2">
            <nav
              aria-label="About section links"
              className="border-slate-200/80 lg:border-r lg:pr-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-secondary">
                Explore About
              </p>
              <ul className="mt-5 space-y-4">
                {leftLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-sm text-slate-600 transition hover:text-slate-950"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400 transition group-hover:text-primary">
                        Open
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10">
              <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_68%)]" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                  About Kisii University
                </p>
                <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 sm:text-5xl xl:text-6xl">
                  {overview.vision ||
                    "An inclusive and borderless university that creates positive change in the world."}
                </h1>
                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:items-start">
                  <div>
                    <p className="text-base leading-8 text-slate-600 sm:text-lg">
                      {overview.overview || aboutIntro}
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div className="border-l-2 border-primary/70 pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Established
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          1965
                        </p>
                      </div>
                      <div className="border-l-2 border-primary/70 pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Charter
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          2013
                        </p>
                      </div>
                      <div className="border-l-2 border-primary/70 pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Published Schools
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          8
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-950 px-6 py-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                      Institutional Focus
                    </p>
                    <p className="mt-4 text-sm leading-7 text-white/80">
                      {overview.history_summary || aboutIntro}
                    </p>
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                        Mission
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/80">
                        {overview.mission || officialMission}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <nav
              aria-label="Related institutional pages"
              className="border-slate-200/80 lg:border-l lg:pl-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-secondary">
                Related Pages
              </p>
              <ul className="mt-5 space-y-4">
                {rightLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-sm text-slate-600 transition hover:text-slate-950"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400 transition group-hover:text-primary">
                        Open
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <AboutUsSection
          overview={overview.overview || aboutIntro}
          historySummary={overview.history_summary || aboutIntro}
          vision={overview.vision || ""}
          mission={overview.mission || officialMission}
          philosophy={officialPhilosophy}
          stats={overview.quick_facts
            ? [
                { value: String((overview.quick_facts as Record<string, unknown>).founding_year ?? "1965"), label: "Established" },
                { value: String((overview.quick_facts as Record<string, unknown>).land_acres ?? "61"), label: "Acres Donated" },
                { value: String((overview.quick_facts as Record<string, unknown>).schools ?? "8"), label: "Schools" },
                { value: String((overview.quick_facts as Record<string, unknown>).egerton_takeover_year ?? "1994"), label: "Egerton Takeover" },
                { value: String((overview.quick_facts as Record<string, unknown>).charter_year ?? "2013"), label: "University Charter" },
              ]
            : []}
          timeline={historyTimeline}
        />
      </AboutPageLenis>
    </PageShell>
  );
}
