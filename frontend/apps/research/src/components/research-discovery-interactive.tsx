"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, FlaskConical, Lightbulb, Users } from "lucide-react";

const pathways = [
  {
    id: "questions",
    number: "01",
    label: "Questions",
    title: "Start with the questions shaping our region",
    body: "Explore active investigations across health, food systems, climate, education, technology, governance, and community wellbeing.",
    icon: FlaskConical,
  },
  {
    id: "people",
    number: "02",
    label: "People",
    title: "Find the researchers behind the evidence",
    body: "Discover expertise, research interests, institutional affiliations, and opportunities for multidisciplinary collaboration.",
    icon: Users,
  },
  {
    id: "evidence",
    number: "03",
    label: "Evidence",
    title: "Follow ideas into publications and outputs",
    body: "Move from research activity to peer-reviewed work, reports, policy briefs, datasets, tools, and other usable outputs.",
    icon: BookOpen,
  },
  {
    id: "application",
    number: "04",
    label: "Application",
    title: "See how knowledge becomes practical action",
    body: "Trace discoveries into innovation, partnerships, public engagement, technology transfer, and measurable community impact.",
    icon: Lightbulb,
  },
] as const;

export function ResearchDiscoveryInteractive() {
  const [activeId, setActiveId] = useState<(typeof pathways)[number]["id"]>("questions");
  const reduceMotion = useReducedMotion();
  const active = pathways.find((pathway) => pathway.id === activeId) ?? pathways[0];
  const ActiveIcon = active.icon;

  return (
    <section className="overflow-hidden border-y border-primary/10 bg-white/[0.66] px-4 py-12 text-foreground backdrop-blur-[2px] sm:px-6 lg:px-8 lg:py-16 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Choose your route</p>
          <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Research is a connected journey—not a list of records.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Select a pathway to move through the university’s research ecosystem from inquiry to application.</p>

          <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-xl border border-primary/15 bg-white/55" role="tablist" aria-label="Research discovery pathways">
            {pathways.map((pathway) => {
              const selected = pathway.id === activeId;
              return (
                <button key={pathway.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveId(pathway.id)} onMouseEnter={() => setActiveId(pathway.id)} className={`group flex min-h-16 items-center gap-3 border-b-2 px-3 py-3 text-left transition ${selected ? "border-secondary bg-primary/[0.07] text-primary" : "border-transparent text-muted-foreground hover:bg-white/70 hover:text-primary"}`}>
                  <span className="font-display text-lg text-secondary">{pathway.number}</span>
                  <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">{pathway.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[440px]">
          <DiscoveryGraphic activeIndex={pathways.findIndex((item) => item.id === activeId)} reduceMotion={Boolean(reduceMotion)} />
          <AnimatePresence mode="wait">
            <motion.article key={active.id} role="tabpanel" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="absolute inset-x-4 bottom-4 rounded-2xl border border-primary/15 border-l-4 border-l-secondary bg-white/90 p-5 text-foreground shadow-[0_20px_55px_-38px_hsl(var(--primary)/0.65)] backdrop-blur-md sm:inset-x-10 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center text-primary"><ActiveIcon aria-hidden className="h-7 w-7" /></div>
              <h3 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-tight text-foreground">{active.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{active.body}</p>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DiscoveryGraphic({ activeIndex, reduceMotion }: { activeIndex: number; reduceMotion: boolean }) {
  const points = [{ x: 18, y: 48 }, { x: 42, y: 20 }, { x: 72, y: 28 }, { x: 84, y: 58 }];
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl border border-primary/[0.12] bg-[radial-gradient(circle_at_68%_22%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_25%_70%,hsl(var(--secondary)/0.14),transparent_26%),hsl(var(--surface-page)/0.72)]">
      <div className="absolute inset-0 research-surface-grid opacity-20" />
      <svg viewBox="0 0 100 76" className="absolute inset-x-0 top-4 h-[66%] w-full" fill="none">
        <path d="M18 48C30 25 34 22 42 20C55 16 59 30 72 28C81 27 84 42 84 58" stroke="hsl(var(--primary))" strokeOpacity=".28" strokeWidth=".5" strokeDasharray="2 2" />
        {points.map((point, index) => <g key={point.x}><circle cx={point.x} cy={point.y} r={index === activeIndex ? 7 : 4.5} fill={index === activeIndex ? "hsl(var(--secondary))" : "hsl(var(--primary))"} opacity={index === activeIndex ? 1 : .65} /><circle cx={point.x} cy={point.y} r={index === activeIndex ? 11 : 7} stroke="white" strokeOpacity={index === activeIndex ? .5 : .15} strokeWidth=".5" /></g>)}
      </svg>
      {!reduceMotion ? <motion.div className="absolute left-[10%] top-[12%] h-20 w-20 rounded-full border border-secondary/30" animate={{ scale: [1, 1.2, 1], opacity: [.25, .6, .25] }} transition={{ duration: 4, repeat: Infinity }} /> : null}
    </div>
  );
}
