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
  ArrowUpRight,
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
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/home/motion-primitives";
import { IntakePanel } from "@/components/home/intake-panel";
import { PublicImage } from "@/components/public/public-image";
import { defaultUniversityImage } from "@/lib/default-imagery";
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
      className="ksu-band-tight overflow-hidden text-brand-overlay"
    >
      <div className="ksu-shell relative">
        <Reveal className="mx-auto max-w-[58rem] text-center">
          <p className="ksu-eyebrow text-[hsl(var(--secondary-ink))]">
            Kisii University
          </p>
          <h2 id="finder-heading" className="ksu-l-h2 font-normal">
            Find your place at Kisii University
          </h2>
          <p className="mx-auto mt-2 max-w-[54ch] text-brand-overlay/70">
            {subtitle?.trim() ||
              "Great minds. A brighter tomorrow."}
          </p>
        </Reveal>

        {/* One quiet shell keeps programme discovery, intake information, and
            school browsing in the same visual story. */}
        <div className="mt-6 rounded-[2rem] border border-[hsl(var(--brand-overlay)/0.09)] bg-white/90 p-2 shadow-[0_22px_60px_-36px_hsl(var(--brand-overlay)/0.48)] sm:p-3">
          {/* The tool and the deadline, side by side. */}
          <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.72fr)_minmax(18rem,0.82fr)]">
            <Reveal className="min-w-0 rounded-[1.5rem] bg-[hsl(var(--surface-muted))] p-4 sm:p-5 lg:p-6">
              <h3 className="ksu-l-card font-normal">Search programmes</h3>
              <p className="mt-1 text-sm text-brand-overlay/60">
                Explore our programmes and find the right fit for your goals.
              </p>
              <div className="mt-4">
                <ProgrammeSearchPanel
                  schools={schools}
                  filters={filters}
                  inlineFilters
                />
              </div>
              {topProgrammes.length > 0 ? (
                <TopProgrammes programmes={topProgrammes} compact />
              ) : null}
            </Reveal>
            <Reveal delay={0.1} className="min-w-0">
              <IntakePanel intakes={intakes} compact />
            </Reveal>
          </div>

          <SchoolBrowser schools={schools} />

          {/* The rail. */}
          {/* `relative`: useScroll measures its target's offset, and warns when
              that element is statically positioned. */}
          <div ref={railRef} className="relative mt-6 border-t border-brand-overlay/8 pt-5 sm:mt-7 sm:pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="ksu-l-card font-normal">Your admissions pathway</h3>
              <span className="ksu-l-small hidden text-brand-overlay/50 sm:inline">
                From first search to campus
              </span>
            </div>

            {/* Desktop: one horizontal line with the stages alternating above
                and below it. */}
            <ol className="relative mt-5 hidden grid-cols-5 lg:grid">
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
            <ol className="relative mt-4 lg:hidden">
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
      </div>
    </AmbientPageBackground>
  );
}

function SchoolBrowser({ schools }: { schools: HomeSchoolCard[] }) {
  if (schools.length === 0) return null;

  return (
    <div id="schools" className="mt-3 border-t border-brand-overlay/8 pt-5 sm:pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="schools-heading" className="ksu-l-card font-normal">
            Browse by school
          </h3>
          <p className="mt-1 text-sm text-brand-overlay/60">
            Discover our schools and the opportunities they offer.
          </p>
        </div>
        <Link
          href="/academics/schools"
          className={cn(
            "group inline-flex min-h-10 items-center gap-2 rounded-xl border border-brand-overlay/12 px-3.5 py-2 text-sm font-medium text-[hsl(var(--secondary-ink))] transition-colors duration-300 hover:border-[hsl(var(--secondary))]/50 hover:bg-[hsl(var(--surface-band))]",
            focusVisibleStyles.primary,
          )}
        >
          View all schools
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <RevealGroup
        as="ul"
        stagger={0.04}
        className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {schools.map((school) => (
          <RevealItem as="li" key={school.href} className="min-w-0">
            <Link
              href={school.href}
              className={cn(
                "group flex min-h-[5.25rem] items-center gap-3 rounded-2xl border border-brand-overlay/10 bg-white px-2.5 py-2.5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]/45 hover:shadow-[0_12px_28px_-20px_hsl(var(--brand-overlay)/0.65)]",
                focusVisibleStyles.primary,
              )}
            >
              <div className="relative h-16 w-[4.6rem] shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--surface-band))]">
                <PublicImage
                  src={
                    school.imageUrl ??
                    defaultUniversityImage(school.id ?? school.href)
                  }
                  alt={school.imageAlt ?? ""}
                  ratio="fill"
                  className="absolute inset-0 h-full w-full bg-transparent"
                  imageClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 8vw, 24vw"
                />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-brand-overlay">
                {school.title}
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-brand-overlay/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--secondary-ink))]"
                aria-hidden
              />
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
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
