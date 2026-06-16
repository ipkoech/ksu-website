import Link from "next/link";
import { FileText, Mail, Phone } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getContactPageConfig } from "@/lib/utility-page-data";
import {
  PublicActionLink,
  PublicCardSurface,
} from "@/components/public/public-primitives";
import type { PublicPageSection } from "@/components/public/section-page";

function ContactSection({ section }: { section: PublicPageSection }) {
  const dark = section.tone === "dark";
  const wrapperClass = dark
    ? "border-y border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16"
    : "border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16";
  const gridClass =
    section.columns === 2
      ? "grid gap-5 md:grid-cols-2"
      : "grid gap-5 md:grid-cols-2 xl:grid-cols-3";

  return (
    <ScrollReveal as="section" className={wrapperClass}>
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-28">
          <p className="text-sm font-semibold uppercase text-secondary">
            {section.eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white"
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950"
            }
          >
            {section.title}
          </h2>
          <p
            className={
              dark
                ? "mt-5 text-base leading-8 text-white/70"
                : "mt-5 max-w-xl text-base leading-8 text-slate-600"
            }
          >
            {section.body}
          </p>
        </div>
        <ScrollRevealGroup className={gridClass} staggerDelay={70}>
          {section.cards.map((card) => (
            <PublicCardSurface
              key={`${section.eyebrow}-${card.title}`}
              card={card}
              dark={dark}
            />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

export default async function ContactPage() {
  const config = await getContactPageConfig();
  const [mainSection, ...restSections] = config.sections;
  const primaryCards = mainSection?.cards.slice(0, 3) ?? [];

  return (
    <PageShell>
      <>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto w-full max-w-[1440px]">
            <BreadcrumbTrail items={config.breadcrumb} />

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-end">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase text-secondary">
                  {config.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  {config.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {config.body}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {config.primaryAction ? (
                    <PublicActionLink action={config.primaryAction} primary />
                  ) : null}
                  {config.secondaryActions?.map((action) => (
                    <PublicActionLink key={action.label} action={action} />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-3 lg:col-span-1">
                  <p className="text-xs font-semibold uppercase text-secondary">
                    Direct channels
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <a
                      href="mailto:info@kisiiuniversity.ac.ke"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Mail aria-hidden className="h-4 w-4 text-primary" />
                      Email
                    </a>
                    <a
                      href="tel:+254720875082"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Phone aria-hidden className="h-4 w-4 text-primary" />
                      Call
                    </a>
                    <Link
                      href="/search"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <FileText aria-hidden className="h-4 w-4 text-primary" />
                      Search directory
                    </Link>
                  </div>
                </div>

                {primaryCards.map((card) => (
                  <PublicCardSurface key={`hero-${card.title}`} card={card} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {mainSection ? <ContactSection section={mainSection} /> : null}
        {restSections.map((section) => (
          <ContactSection key={section.eyebrow} section={section} />
        ))}
      </>
    </PageShell>
  );
}
