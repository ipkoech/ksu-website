import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Goal, Handshake, Lightbulb, Search, UsersRound } from "lucide-react";
import { SiteShell } from "../../components/site-shell";
import { Reveal, RevealItem } from "../../components/motion/reveal";
import { getEvents, getImpactMetrics, getOpportunities, getProjects, getPublications, getResearchThemes } from "../../lib/api";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Research priorities, approach, portfolio and impact of the HERI Africa Language Education Research Chair.",
};


const focusAreas = [
  ["Foundational Literacy", "Strengthening early reading and writing for every learner.", BookOpen],
  ["African Languages", "Promoting research and teaching of African languages.", UsersRound],
  ["Research to Policy", "Generating evidence that informs language education policy.", Goal],
  ["Capacity Strengthening", "Building skills and systems for sustainable research and practice.", Handshake],
] as const;
const approachItems = [
  ["Research", "We generate rigorous evidence grounded in language education and foundational literacy.", Search],
  ["Policy", "We translate evidence into actionable recommendations that inform decision-making.", FileText],
  ["Practice", "We support teachers and schools with practical resources and strategies that improve learning.", Lightbulb],
  ["Capacity strengthening", "We build the skills and networks of researchers, educators and institutions across Africa.", UsersRound],
] as const;

export const revalidate = 300;

export default async function OurWorkPage() {
  const [themes, projects, publications, events, opportunities, metrics] = await Promise.allSettled([
    getResearchThemes(),
    getProjects(),
    getPublications(),
    getEvents(),
    getOpportunities(),
    getImpactMetrics(),
  ]);
  const themeData = themes.status === "fulfilled" ? themes.value : [];
  const projectData = projects.status === "fulfilled" ? projects.value : [];
  const publicationData = publications.status === "fulfilled" ? publications.value : [];
  const eventData = events.status === "fulfilled" ? events.value : [];
  const opportunityData = opportunities.status === "fulfilled" ? opportunities.value : [];
  const metricData = metrics.status === "fulfilled" ? metrics.value : [];

  return (
    <SiteShell>
      <main className="bg-white">
        <section className="bg-heri-ink px-6 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">What we do</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.02] sm:text-6xl">Research that moves from evidence to action.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">We connect Africa-led research, policy and practice so every learner can read, understand and thrive.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">Our focus</p>
              <h2 className="mt-3 text-4xl font-bold text-heri-blue">Four priorities guide our work</h2>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map(([title, description, Icon], index) => (
              <RevealItem key={title} index={index} className="h-full">
                <article className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><span className="grid size-12 place-items-center rounded-full bg-heri-lime text-heri-ink"><Icon className="size-6" /></span><h3 className="mt-5 text-xl font-bold text-heri-blue">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></article>
              </RevealItem>
            ))}
          </div>
        </section>

        <section className="bg-heri-cream/50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">Our approach</p>
              <h2 className="mt-3 text-4xl font-bold text-heri-blue">From evidence to practical change</h2>
            </Reveal>
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {approachItems.map(([title, description, Icon], index) => <RevealItem key={title} index={index} className="h-full"><article className="h-full rounded-2xl bg-white p-6 ring-1 ring-heri-teal/10"><Icon className="size-8 text-heri-teal" /><h3 className="mt-5 font-bold text-heri-blue">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article></RevealItem>)}
            </div>
          </div>
        </section>

        {metricData.length > 0 && <section className="bg-heri-ink px-6 py-14 text-white"><div className="mx-auto max-w-7xl"><Reveal><h2 className="text-3xl font-bold">Our impact</h2></Reveal><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{metricData.map((metric, index) => <RevealItem key={metric.id} index={index} className="h-full"><article className="h-full rounded-2xl border border-white/15 p-6"><p className="text-4xl font-bold text-heri-lime">{metric.value}{metric.unit ? <span className="ml-1 text-lg">{metric.unit}</span> : null}</p><h3 className="mt-3 font-bold">{metric.label}</h3><p className="mt-2 text-sm leading-6 text-white/70">{metric.description}</p></article></RevealItem>)}</div></div></section>}

        <section className="mx-auto max-w-7xl px-6 py-16">
          <Reveal className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">Evidence and learning</p><h2 className="mt-3 text-4xl font-bold text-heri-blue">Research portfolio</h2></div><Link className="font-bold text-heri-teal" href="/research">Explore all research →</Link></Reveal>
          {themeData.length > 0 && <div className="mt-8 flex flex-wrap gap-3">{themeData.map((theme) => <span className="rounded-full bg-heri-cream px-4 py-2 text-sm font-semibold text-heri-teal" key={theme.id}>{theme.title}</span>)}</div>}
          <div className="mt-8 grid gap-5 lg:grid-cols-2">{[...projectData, ...publicationData].slice(0, 6).map((item, index) => <RevealItem key={item.id} index={index} className="h-full"><article className="h-full rounded-2xl border border-slate-200 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-teal">{projectData.some((project) => project.id === item.id) ? "Project" : "Publication"}</p><h3 className="mt-3 text-xl font-bold text-heri-blue">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p></article></RevealItem>)}</div>
          {projectData.length === 0 && publicationData.length === 0 && <p className="mt-8 rounded-2xl bg-heri-cream/60 p-6 text-sm text-slate-600">Research projects and publications will appear here as they are published by the research team.</p>}
        </section>

        {(eventData.length > 0 || opportunityData.length > 0) && <section className="border-t border-slate-200 px-6 py-14"><div className="mx-auto max-w-7xl"><Reveal><h2 className="text-3xl font-bold text-heri-blue">Open opportunities and events</h2></Reveal><div className="mt-7 grid gap-5 md:grid-cols-2">{[...opportunityData, ...eventData].slice(0, 4).map((item, index) => <RevealItem key={item.id} index={index} className="h-full"><article className="h-full rounded-2xl border border-slate-200 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-teal">{"application_url" in item ? "Opportunity" : "Event"}</p><h3 className="mt-2 text-xl font-bold text-heri-blue">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p></article></RevealItem>)}</div></div></section>}

        <section className="bg-gradient-to-r from-heri-lime to-heri-teal px-6 py-10"><Reveal className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5"><h2 className="max-w-2xl text-3xl font-bold text-heri-blue">Work with HERI Africa to advance language education research.</h2><Link className="inline-flex items-center gap-3 rounded-xl bg-heri-blue px-5 py-3 text-sm font-bold text-white" href="/partner-with-us">Partner with us <ArrowRight className="size-4" /></Link></Reveal></section>
      </main>
    </SiteShell>
  );
}
