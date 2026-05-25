import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Target,
} from "lucide-react";
import {
  AboutIllustratedHeading,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  strategicDocuments,
  strategicPlanHighlights,
} from "@/lib/about-data";

export default function StrategicPlanPage() {
  const strategicPlan = strategicDocuments.find((document) =>
    document.title.startsWith("Strategic Plan"),
  );
  const supportingDocuments = strategicDocuments.filter(
    (document) => document !== strategicPlan,
  );

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="container py-10 md:py-14">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Strategic Plan" },
            ]}
          />
          <div className="mt-8">
            <AboutIllustratedHeading
              eyebrow="Strategic Plan"
              title="Institutional priorities, implementation focus, and public accountability."
              body="The strategic plan page gives visitors a direct internal route to the current plan and summarizes the published key result areas that shape university planning."
              illustration={aboutIllustrations.strategicPlan}
              alt="University stakeholders mapping strategic priorities in a planning workshop"
            />
          </div>
        </section>

        <section className="container grid gap-6 pb-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <article className="rounded-[2rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/30">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10">
              <FileText aria-hidden className="h-5 w-5" />
            </span>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Current Plan
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
              {strategicPlan?.title ?? "Strategic Plan"}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              {strategicPlan?.body ??
                "The current strategic plan document will be linked here when it is available."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {strategicPlan?.href ? (
                <a
                  href={strategicPlan.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  Open strategic plan
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              ) : null}
              <Link
                href="/about/quality-assurance"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View quality context
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Target aria-hidden className="h-5 w-5" />
            </span>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Key Result Areas
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950 sm:text-4xl">
              Published priorities presented for fast scanning.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {strategicPlanHighlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="text-base font-semibold leading-6 text-slate-950">
                    {highlight.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {highlight.body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="container pb-16">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
            <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <ClipboardCheck aria-hidden className="h-5 w-5" />
                </span>
                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                  Supporting References
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                  Planning connects back to governance and service commitments.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {supportingDocuments.map((document) => (
                  <a
                    key={document.title}
                    href={document.href}
                    className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-primary/30 hover:bg-white"
                  >
                    <h3 className="text-lg font-semibold text-slate-950">
                      {document.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {document.body}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open reference
                      <ExternalLink
                        aria-hidden
                        className="h-4 w-4 transition group-hover:translate-x-1"
                      />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
