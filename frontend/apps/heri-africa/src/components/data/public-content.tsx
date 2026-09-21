"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  EventSummary,
  ImpactMetricSummary,
  PartnerSummary,
  ResearchSummary,
  TeamSummary,
} from "../../lib/api";
import { Reveal, RevealItem } from "../motion/reveal";

export type HeriChairSummaryDto = {
  about: string;
};

export type HeriTeamPreviewDto = Pick<
  TeamSummary,
  "id" | "slug" | "name" | "role" | "photo_url"
>;

export type HeriUpdatePreviewDto = {
  id: string;
  title: string;
  summary: string;
  kind: "News" | "Event";
  href: string;
};

export type HeriImpactMetricDto = Pick<
  ImpactMetricSummary,
  "id" | "label" | "value" | "unit" | "description"
>;

export type HeriOpportunityDto = {
  id: string;
  title: string;
  summary: string;
  kind: "Opportunity" | "Event";
};

const newsTints = [
  "from-heri-teal to-heri-ink",
  "from-heri-blue to-heri-ink",
  "from-heri-ink to-heri-teal",
];

export function PublicChairSummary({ about }: HeriChairSummaryDto) {
  return (
    <div data-server-data-display="heri-chair-summary">
      <Reveal delay={0.1}>
        <h2 className="max-w-xl text-3xl font-bold leading-tight text-heri-blue sm:text-4xl">
          A Chair with a home, and a continental mandate
        </h2>
        <div className="mt-4 h-1 w-10 bg-heri-lime" />
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">{about}</p>
        <Link
          href="/about"
          className="mt-7 inline-flex items-center gap-3 rounded-xl bg-heri-blue px-6 py-3.5 text-sm font-bold text-white transition hover:bg-heri-teal active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal focus:ring-offset-2"
        >
          About the Chair
          <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </div>
  );
}

export function PublicTeamPreview({ members }: { members: HeriTeamPreviewDto[] }) {
  if (members.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-16" data-server-data-display="heri-team-preview">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
            The people behind the research
          </h2>
          <div className="mt-3 h-1 w-10 bg-heri-lime" />
        </div>
        <Link
          href="/team"
          className="text-sm font-bold text-heri-teal transition hover:text-heri-blue"
        >
          Meet the team
        </Link>
      </Reveal>
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => (
          <RevealItem key={member.id} index={index}>
            <Link
              href={`/team/${member.slug}`}
              className="group block text-center focus:outline-none"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-heri-cream ring-heri-teal transition group-focus:ring-2">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-6xl font-bold text-heri-teal">
                    {member.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-bold text-heri-blue">{member.name}</h3>
              <p className="mt-1 text-xs text-heri-teal">{member.role}</p>
            </Link>
          </RevealItem>
        ))}
      </div>
    </section>
  );
}

export function PublicUpdatesPreview({ items }: { items: HeriUpdatePreviewDto[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-slate-100 px-6 py-16" data-server-data-display="heri-updates-preview">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
              Latest news, events and stories
            </h2>
            <div className="mt-3 h-1 w-10 bg-heri-lime" />
          </div>
          <Link
            href="/news-insights"
            className="text-sm font-bold text-heri-teal transition hover:text-heri-blue"
          >
            View all
          </Link>
        </Reveal>
        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {items.slice(0, 3).map((item, index) => (
            <RevealItem key={item.id} index={index}>
              <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                <div className={`h-2 bg-gradient-to-r ${newsTints[index % newsTints.length]}`} />
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-heri-teal">
                    {item.kind}
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-heri-blue">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {item.summary}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-block text-sm font-bold text-heri-teal transition hover:text-heri-blue"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicImpactMetrics({ metrics }: { metrics: HeriImpactMetricDto[] }) {
  if (metrics.length === 0) return null;
  return (
    <section className="bg-heri-ink px-6 py-14 text-white" data-server-data-display="heri-impact-metrics">
      <div className="mx-auto max-w-7xl">
        <Reveal><h2 className="text-3xl font-bold">Our impact</h2></Reveal>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <RevealItem key={metric.id} index={index} className="h-full">
              <article className="h-full rounded-2xl border border-white/15 p-6">
                <p className="text-4xl font-bold text-heri-lime">
                  {metric.value}
                  {metric.unit ? <span className="ml-1 text-lg">{metric.unit}</span> : null}
                </p>
                <h3 className="mt-3 font-bold">{metric.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{metric.description}</p>
              </article>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicOpportunities({ items }: { items: HeriOpportunityDto[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-t border-slate-200 px-6 py-14" data-server-data-display="heri-opportunities">
      <div className="mx-auto max-w-7xl">
        <Reveal><h2 className="text-3xl font-bold text-heri-blue">Open opportunities and events</h2></Reveal>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {items.slice(0, 4).map((item, index) => (
            <RevealItem key={item.id} index={index} className="h-full">
              <article className="h-full rounded-2xl border border-slate-200 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-teal">{item.kind}</p>
                <h3 className="mt-2 text-xl font-bold text-heri-blue">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
              </article>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicEventsList({ events }: { events: EventSummary[] }) {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3" data-server-data-display="heri-events">
      {events.length === 0 ? (
        <p className="text-sm text-heri-ink/70">No upcoming events are available.</p>
      ) : (
        events.map((event, index) => (
          <RevealItem key={event.id} index={index} className="h-full">
            <article className="h-full overflow-hidden rounded-3xl bg-white ring-1 ring-heri-teal/10">
              {event.featured_image_url ? (
                <div className="relative h-40">
                  <Image src={event.featured_image_url} alt="" fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="h-2 bg-heri-lime" />
              )}
              <div className="p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-heri-teal">
                  {event.event_type ?? "Event"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-heri-blue">{event.title}</h2>
                <p className="mt-3 text-sm leading-7 text-heri-ink/70">{event.summary}</p>
                <p className="mt-4 text-sm font-medium text-heri-ink/60">
                  {event.location ?? "Online and in person"}
                </p>
              </div>
            </article>
          </RevealItem>
        ))
      )}
    </div>
  );
}

function ResearchCards({
  items,
  columns,
  projectIds,
}: {
  items: ResearchSummary[];
  columns: string;
  projectIds?: Set<string>;
}) {
  return (
    <div className={`mt-8 grid gap-5 ${columns}`}>
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">No published records are available.</p>
      ) : (
        items.map((item, index) => (
          <RevealItem key={item.id} index={index}>
            <article className="h-full rounded-2xl bg-heri-cream/60 p-6">
              {projectIds ? (
                <p className="text-xs font-bold uppercase tracking-[.16em] text-heri-teal">
                  {projectIds.has(item.id) ? "Research project" : "Publication"}
                </p>
              ) : null}
              <h3 className="text-xl font-bold text-heri-blue">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
            </article>
          </RevealItem>
        ))
      )}
    </div>
  );
}

export function PublicResearchPortfolio({
  themes,
  projects,
  publications,
}: {
  themes: ResearchSummary[];
  projects: ResearchSummary[];
  publications: ResearchSummary[];
}) {
  return (
    <div data-server-data-display="heri-research">
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {themes.length === 0 ? (
          <p className="text-sm text-slate-600">No research themes are available.</p>
        ) : (
          themes.map((theme, index) => (
            <RevealItem key={theme.id} index={index}>
              <article className="h-full rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-heri-blue">{theme.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{theme.summary}</p>
              </article>
            </RevealItem>
          ))
        )}
      </div>
      <Reveal className="mt-16">
        <h2 className="text-4xl font-bold text-heri-blue">Projects and publications</h2>
      </Reveal>
      <ResearchCards
        items={[...projects, ...publications]}
        columns="md:grid-cols-2 lg:grid-cols-3"
        projectIds={new Set(projects.map((project) => project.id))}
      />
    </div>
  );
}

export function PublicResearchList({
  title,
  items,
  columns = "md:grid-cols-3",
}: {
  title: string;
  items: ResearchSummary[];
  columns?: string;
}) {
  return (
    <div data-server-data-display={title.toLowerCase().includes("project") ? "heri-projects" : "heri-publications"}>
      <Reveal>
        <h1 className="text-5xl font-semibold text-heri-blue">{title}</h1>
      </Reveal>
      <ResearchCards items={items} columns={columns} />
    </div>
  );
}

export function PublicPartnersList({ partners }: { partners: PartnerSummary[] }) {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-server-data-display="heri-partners">
      {partners.length === 0 ? (
        <p className="text-sm text-heri-ink/70">Partner information is being updated.</p>
      ) : (
        partners.map((partner, index) => (
          <RevealItem key={partner.id} index={index} className="h-full">
            <article className="h-full rounded-3xl bg-white p-7 ring-1 ring-heri-teal/10">
              {partner.logo_url ? (
                <Image
                  alt={`${partner.name} logo`}
                  className="h-16 w-full object-contain object-left"
                  height={160}
                  src={partner.logo_url}
                  unoptimized
                  width={320}
                />
              ) : null}
              <h2 className="mt-5 text-xl font-semibold text-heri-blue">{partner.name}</h2>
              <p className="mt-3 text-sm leading-7 text-heri-ink/70">{partner.description}</p>
              {partner.country ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-heri-teal">
                  {partner.country}
                </p>
              ) : null}
            </article>
          </RevealItem>
        ))
      )}
    </div>
  );
}
