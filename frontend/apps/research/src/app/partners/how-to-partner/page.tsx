import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  ClipboardList,
  Handshake,
  Lightbulb,
  Sprout,
  UsersRound,
} from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "How to Partner",
  description: "Partnership pathways for working with Kisii University research, innovation, consultancies, technology transfer, and community impact.",
};

const processSteps = [
  { title: "Explore", body: "Review active research, innovation, partner stories, and university priority areas." },
  { title: "Discuss", body: "Contact the research office with the challenge, opportunity, or collaboration goal." },
  { title: "Scope", body: "Define the workstream, responsible teams, timelines, expected outputs, and public value." },
  { title: "Formalize", body: "Use the appropriate agreement route, including MOU, consultancy, grant, transfer, or implementation partnership." },
  { title: "Deliver", body: "Track activities, outputs, stories, and impact through published research records." },
];

const collaborationRoutes = [
  { href: "/projects", title: "Research projects", body: "Join active workstreams or develop a scoped project with a research team.", icon: Sprout },
  { href: "/technology-transfer", title: "Technology transfer", body: "License, validate, deploy, or commercialize university research outputs.", icon: Lightbulb },
  { href: "/startups", title: "Startups & incubation", body: "Mentor, pilot, sponsor, or create market access for venture pathways.", icon: Briefcase },
  { href: "/consultancies", title: "Consultancies", body: "Engage university expertise for applied research, evaluation, advisory, and technical work.", icon: ClipboardList },
  { href: "/sustainability", title: "Sustainability & community impact", body: "Partner on environmental, food systems, public value, and community initiatives.", icon: UsersRound },
  { href: "/funding", title: "Funding & grants", body: "Support calls, grants, endowments, and strategic research investment opportunities.", icon: BadgeCheck },
];

export default function HowToPartnerPage() {
  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <section className="relative isolate overflow-hidden bg-primary px-4 py-7 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.86)_52%,hsl(var(--secondary)/0.58)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
        <svg aria-hidden viewBox="0 0 900 260" className="absolute right-0 top-1/2 hidden h-full w-[58%] -translate-y-1/2 opacity-70 lg:block" fill="none">
          <g stroke="hsl(var(--secondary))" strokeOpacity="0.44" strokeWidth="1.5">
            <path d="M116 120c30-28 58-28 86 0 25-21 50-17 73 13M124 157l60 35 61-54" />
            <rect x="366" y="74" width="118" height="134" rx="14" />
            <path d="M394 108h62M394 138h44M394 168h72M518 116h92M564 116v70M532 186h62" />
            <circle cx="745" cy="132" r="62" />
            <path d="M745 84v96M697 132h96M714 101c35 20 64 50 88 89M790 101c-34 20-64 50-88 89" />
          </g>
          <g stroke="hsl(var(--primary-foreground))" strokeOpacity="0.38">
            <path d="M276 132h72M486 132h108M638 132h44" />
            {[276, 348, 486, 594, 638, 682].map((x, index) => (
              <circle key={x} cx={x} cy={index % 2 ? 112 : 132} r="7" fill="hsl(var(--primary))" stroke="hsl(var(--secondary))" />
            ))}
          </g>
        </svg>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/20" />
        <div className="relative mx-auto flex min-h-[230px] max-w-[1680px] items-center">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">Partner Engagement</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl">How to Partner</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">A direct route for institutions, industry, funders, government, and communities to work with Kisii University research.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <HeroButton href="/connect#partnership" primary>Start a conversation</HeroButton>
              <HeroButton href="/partners">View partner network</HeroButton>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Partnership process</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">From first contact to published impact</h2>
            </div>
            <div className="grid gap-3">
              {processSteps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[42px_minmax(0,1fr)] gap-4 rounded-md border border-border bg-surface-subtle p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">{index + 1}</span>
                  <span>
                    <span className="block font-semibold text-primary">{step.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{step.body}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <section className="rounded-lg border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <Handshake aria-hidden className="h-8 w-8 text-primary" />
              <h2 className="mt-3 text-lg font-semibold text-primary">Before you contact us</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                <li>Define the research, innovation, community, or industry challenge.</li>
                <li>Identify the partnership route that fits the intended work.</li>
                <li>Prepare timelines, expected outputs, and responsible contacts.</li>
                <li>State whether funding, data, facilities, field sites, or expertise are involved.</li>
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-primary">Quick paths</h2>
              <div className="mt-3 divide-y divide-slate-200">
                {[
                  { href: "/partners/stories", label: "Case studies & testimonials" },
                  { href: "/partners", label: "Partner directory" },
                  { href: "/connect", label: "Contact research office" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-primary">
                    {link.label}
                    <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-surface-subtle px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-5 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Ways to collaborate</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">Choose the route that matches the work</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collaborationRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Link key={route.href} href={route.href} className="group rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-semibold text-primary">{route.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.body}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore
                    <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-4 rounded-lg border border-border bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Ready to engage</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">Start with the research office</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">The research office can route the request to the right center, programme, researcher, innovation pathway, or administrative process.</p>
          </div>
          <Link href="/connect#partnership" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
            Contact us
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function HeroButton({ href, primary = false, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      }
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}
