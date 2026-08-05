"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

interface Milestone {
  year: string;
  title: string;
  body: string;
}

// Source-bounded facts only — no invented history.
const milestones: Milestone[] = [
  {
    year: "1965",
    title: "Founded",
    body: "The institution that becomes Kisii University opens its doors.",
  },
  {
    year: "2013",
    title: "Chartered",
    body: "Awarded a university charter as a full public university.",
  },
  {
    year: "Today",
    title: "Eight schools",
    body: "A public university teaching, researching, and serving community.",
  },
  {
    year: "Tomorrow",
    title: "Your chapter",
    body: "The next generation of graduates writes what comes next.",
  },
];

export function HeritageTimelineSection() {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.85", "end 0.6"],
  });
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      aria-labelledby="heritage-heading"
      className="border-b border-border bg-white py-10 lg:py-14"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Our heritage
          </p>
          <h2
            id="heritage-heading"
            className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl"
          >
            Six decades of learning in Kisii
          </h2>
        </div>

        <ol
          ref={trackRef}
          className="relative mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6"
        >
          {/* Connecting line (desktop) */}
          <span
            className="absolute left-0 right-0 top-[7px] hidden h-px bg-border lg:block"
            aria-hidden
          />
          <motion.span
            className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-secondary lg:block"
            style={reducedMotion ? undefined : { scaleX: lineScale }}
            aria-hidden
          />
          {milestones.map((milestone, index) => (
            <motion.li
              key={milestone.year}
              className="relative lg:pt-8"
              initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span
                className="absolute left-0 top-0 hidden h-[15px] w-[15px] rounded-full border-2 border-secondary bg-white lg:block"
                aria-hidden
              />
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary">
                {milestone.year}
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wide text-secondary">
                {milestone.title}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                {milestone.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HeritageTimelineSection;
