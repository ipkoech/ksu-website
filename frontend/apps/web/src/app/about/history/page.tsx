import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, History } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData, normalizeQuickFacts } from "@/lib/about-data";

export default async function AboutHistoryPage() {
  const overview = await getOverviewData();
  const facts = normalizeQuickFacts(overview?.quick_facts);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "History" },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <History aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                      History
                    </p>
                    <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                      Institutional history
                    </h1>
                  </div>
                </div>
                {overview?.history_summary ? (
                  <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-700">
                    {overview.history_summary}
                  </p>
                ) : (
                  <p className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    History summary has not been published yet.
                  </p>
                )}
              </article>

              <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <CalendarDays aria-hidden className="h-5 w-5 text-secondary" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                  Published Facts
                </p>
                <div className="mt-4 grid gap-2">
                  {facts.length ? (
                    facts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2"
                      >
                        <span className="text-xs text-white/60">
                          {fact.label}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {fact.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-white/60">
                      Quick facts have not been published yet.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <FileText aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Source of this page
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This page renders the published university information record:
                history summary, founding year, and quick facts.
              </p>
            </aside>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Related institutional context
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["About Us", "/about"],
                  ["Governance", "/about/governance"],
                  ["Quality Assurance", "/about/quality-assurance"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-h-12 items-center justify-between rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                  >
                    {label}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
