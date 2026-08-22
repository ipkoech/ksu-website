"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  CheckSquare,
  FileSearch,
  GraduationCap,
  MailOpen,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { AmbientPageBackground } from "@ksu/ui";
import { Reveal } from "@/components/home/motion-primitives";
import { IntakePanel } from "@/components/home/intake-panel";
import {
  ProgrammeSearchPanel,
  TopProgrammes,
} from "@/components/home/programme-search";
import type {
  HomeIntake,
  HomeProgrammeCard,
  HomeProgrammeFilters,
  HomeSchoolCard,
} from "@/lib/homepage-data";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stage = {
  title: string;
  blurb: string;
  href: string;
  icon: LucideIcon;
};

/** Stages alternate above and below the rail, starting above. */
const STAGES: Stage[] = [
  {
    title: "Choose a programme",
    blurb: "Search the catalogue by name, level, school or study mode.",
    href: "/academics/programmes",
    icon: FileSearch,
  },
  {
    title: "Check requirements",
    blurb: "Confirm entry requirements and gather your documents.",
    href: "/admissions/how-to-apply",
    icon: CheckSquare,
  },
  {
    title: "Submit your application",
    blurb: "Apply through the open intake, or through KUCCPS.",
    href: "/admissions/how-to-apply",
    icon: Send,
  },
  {
    title: "Receive your offer",
    blurb: "Admission letters carry joining instructions and fees.",
    href: "/admissions",
    icon: MailOpen,
  },
  {
    title: "Join Kisii University",
    blurb: "Report on campus, register, and start the part that lasts.",
    href: "/campus-life",
    icon: GraduationCap,
  },
];

export interface ProgrammeJourneyProps {
  schools: HomeSchoolCard[];
  filters: HomeProgrammeFilters;
  topProgrammes: HomeProgrammeCard[];
  intakes: HomeIntake[];
  subtitle?: string;
}

/**
 * Finding a programme and applying for it, as one section.
 *
 * The search tool and the open intake sit together at the top, and the five
 * stages run along a single horizontal rail beneath them, alternating above
 * and below the line. Laid out vertically this same journey cost most of a
 * page; across, it costs part of one screen, and the rail still reads as a
 * path rather than as five stacked blocks.
 */
export function ProgrammeJourney({
  schools,
  filters,
  topProgrammes,
  intakes,
  subtitle,
}: ProgrammeJourneyProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.9", "center 0.55"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const scaleX = useTransform(drawn, (value) => (reduce ? 1 : value));

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="programme-finder"
      aria-labelledby="finder-heading"
      className="overflow-hidden py-16 text-brand-overlay lg:py-20"
    >
      <div className="ksu-shell relative">
        <Reveal className="max-w-[46rem]">
          <h2 id="finder-heading" className="ksu-l-h2 font-normal">
            Find your programme and apply
          </h2>
          <p className="mt-3 max-w-[54ch] text-brand-overlay/70">
            {subtitle?.trim() ||
              "Search the full catalogue, then follow the five steps from choosing a programme to reporting on campus."}
          </p>
        </Reveal>

        {/* The tool and the deadline, side by side. */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          <Reveal className="min-w-0">
            <ProgrammeSearchPanel schools={schools} filters={filters} />
            {topProgrammes.length > 0 ? (
              <TopProgrammes programmes={topProgrammes} />
            ) : null}
          </Reveal>
          <Reveal delay={0.1} className="min-w-0">
            <IntakePanel intakes={intakes} />
          </Reveal>
        </div>

        {/* The rail. */}
        {/* `relative`: useScroll measures its target's offset, and warns when
            that element is statically positioned. */}
        <div ref={railRef} className="relative mt-14 lg:mt-16">
          <h3 className="ksu-l-card font-normal">Your admissions pathway</h3>

          {/* Desktop: one horizontal line with the stages alternating above
              and below it. Every marker lands on the line because each stage
              is a 1fr / auto / 1fr column, so the auto row sits dead centre
              whatever the copy above or below it does. */}
          <ol className="relative mt-8 hidden grid-cols-5 lg:grid">
            <span
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brand-overlay/12"
              aria-hidden
            />
            <motion.span
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-gradient-to-r from-primary via-primary/70 to-secondary"
              style={{ scaleX }}
              aria-hidden
            />
            {STAGES.map((stage, index) => (
              <RailStage key={stage.title} stage={stage} index={index} />
            ))}
          </ol>

          {/* Small screens: the same five stages as a compact vertical run. */}
          <ol className="relative mt-6 lg:hidden">
            <span
              className="pointer-events-none absolute bottom-5 left-[1.1875rem] top-5 w-px bg-brand-overlay/12"
              aria-hidden
            />
            {STAGES.map((stage, index) => (
              <CompactStage key={stage.title} stage={stage} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </AmbientPageBackground>
  );
}

/* ------------------------------------------------------------ desktop rail */

function RailStage({ stage, index }: { stage: Stage; index: number }) {
  const reduce = useReducedMotion();
  const above = index % 2 === 0;
  const Icon = stage.icon;

  const card = (
    <Link
      href={stage.href}
      className={cn(
        "group block rounded-2xl bg-white/70 p-4 ring-1 ring-brand-overlay/8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:ring-[hsl(var(--secondary))]/40",
        focusVisibleStyles.primary,
      )}
    >
      <motion.span
        className="block"
        initial={reduce ? false : { opacity: 0, y: above ? -14 : 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: index * 0.12, ease: EASE_OUT_EXPO }}
      >
        <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
          {stage.title}
        </span>
        <span className="ksu-l-small mt-1 block text-brand-overlay/60">
          {stage.blurb}
        </span>
      </motion.span>
    </Link>
  );

  return (
    <li className="grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="row-start-1 flex items-end justify-center pb-5">
        {above ? card : null}
      </div>

      <div className="row-start-2 flex justify-center">
        <motion.span
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-[0_2px_12px_-4px_hsl(var(--brand-overlay)/0.45)] ring-1 ring-brand-overlay/10"
          initial={reduce ? false : { opacity: 0, scale: 0.72 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: index * 0.12, ease: EASE_OUT_EXPO }}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-medium text-white">
            {index + 1}
          </span>
        </motion.span>
      </div>

      <div className="row-start-3 flex items-start justify-center pt-5">
        {above ? null : card}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ mobile */

function CompactStage({ stage, index }: { stage: Stage; index: number }) {
  const Icon = stage.icon;
  return (
    <li className="relative">
      <Link
        href={stage.href}
        className={cn(
          "group flex min-h-11 gap-4 py-3",
          focusVisibleStyles.primary,
        )}
      >
        <span
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-brand-overlay/10"
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium text-white">
            {index + 1}
          </span>
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="ksu-l-small block font-medium">{stage.title}</span>
          <span className="ksu-l-small block text-brand-overlay/60">
            {stage.blurb}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default ProgrammeJourney;
