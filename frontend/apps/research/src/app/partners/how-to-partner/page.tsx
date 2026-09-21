import { ResearchPageHero } from "../../../components/research-page-hero";
import type { Metadata } from "next";
import Link from "next/link";

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
  description:
    "Partnership pathways for working with Kisii University research, innovation, consultancies, technology transfer, and community impact.",
};

const processSteps = [
  {
    title: "Explore",
    body: "Review active research, innovation, partner stories, and university priority areas.",
  },
  {
    title: "Discuss",
    body: "Contact the research office with the challenge, opportunity, or collaboration goal.",
  },
  {
    title: "Scope",
    body: "Define the workstream, responsible teams, timelines, expected outputs, and public value.",
  },
  {
    title: "Formalize",
    body: "Use the appropriate agreement route, including MOU, consultancy, grant, transfer, or implementation partnership.",
  },
  {
    title: "Deliver",
    body: "Track activities, outputs, stories, and impact through published research records.",
  },
];

const collaborationRoutes = [
  {
    href: "/projects",
    title: "Projects",
    body: "Join active workstreams or develop a scoped project with a research team.",
    icon: Sprout,
  },
  {
    href: "/technology-transfer",
    title: "Technology transfer",
    body: "License, validate, deploy, or commercialize university research outputs.",
    icon: Lightbulb,
  },
  {
    href: "/startups",
    title: "Startups & incubation",
    body: "Mentor, pilot, sponsor, or create market access for venture pathways.",
    icon: Briefcase,
  },
  {
    href: "/consultancies",
    title: "Consultancies",
    body: "Engage university expertise for applied research, evaluation, advisory, and technical work.",
    icon: ClipboardList,
  },
  {
    href: "/sustainability",
    title: "Sustainability & community impact",
    body: "Partner on environmental, food systems, public value, and community initiatives.",
    icon: UsersRound,
  },
  {
    href: "/funding",
    title: "Funding & grants",
    body: "Support calls, grants, endowments, and strategic research investment opportunities.",
    icon: BadgeCheck,
  },
];

export default function HowToPartnerPage() {
  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPageHero
        title="How to Partner"
        eyebrow="Innovation"
        description="A direct route for institutions, industry, funders, government, and communities to work with Kisii University."
        imageSrc="/images/research/headers/innovation-week-8263.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How to Partner" },
        ]}
        actions={[
          { label: "Start a conversation", href: "/connect#partnership" },
          { label: "View partner network", href: "/partners" },
        ]}
      ></ResearchPageHero>

      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Partnership process
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                From first contact to published impact
              </h2>
            </div>
            <div className="grid gap-3">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="grid grid-cols-[42px_minmax(0,1fr)] gap-4 rounded-md border border-border bg-surface-subtle p-3"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-primary">
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {step.body}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <section className="rounded-lg border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <Handshake aria-hidden className="h-8 w-8 text-primary" />
              <h2 className="mt-3 text-lg font-semibold text-primary">
                Before you contact us
              </h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                <li>
                  Define the research, innovation, community, or industry
                  challenge.
                </li>
                <li>
                  Identify the partnership route that fits the intended work.
                </li>
                <li>
                  Prepare timelines, expected outputs, and responsible contacts.
                </li>
                <li>
                  State whether funding, data, facilities, field sites, or
                  expertise are involved.
                </li>
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-primary">
                Quick paths
              </h2>
              <div className="mt-3 divide-y divide-border">
                {[
                  {
                    href: "/partners/stories",
                    label: "Case studies & testimonials",
                  },
                  { href: "/partners", label: "Partner directory" },
                  { href: "/connect", label: "Contact research office" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-primary"
                  >
                    {link.label}
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition group-hover:translate-x-1"
                    />
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Ways to collaborate
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              Choose the route that matches the work
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collaborationRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-primary">
                    {route.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {route.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore
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

      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-4 rounded-lg border border-border bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Ready to engage
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              Start with the research office
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The research office can route the request to the right center,
              programme, researcher, innovation pathway, or administrative
              process.
            </p>
          </div>
          <Link
            href="/connect#partnership"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Contact us
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
