"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { CountUpNumber, focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { researchFrontendUrl } from "@/lib/service-urls";

interface Pillar {
  id: string;
  index: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  stat: { value: number; suffix: string; label: string };
  cta: { label: string; href: string; external?: boolean };
  imageUrl: string;
  imageAlt: string;
}

const pillars: Pillar[] = [
  {
    id: "teaching",
    index: "01",
    icon: GraduationCap,
    kicker: "Teaching",
    title: "Learning that prepares you for real work",
    body: "Eight schools deliver programmes shaped with employers and professional bodies, so what you learn on campus is what the world is hiring for.",
    stat: { value: 8, suffix: "", label: "Schools" },
    cta: { label: "Explore academics", href: "/academics" },
    imageUrl: "/logos/ksu-bck5.jpg",
    imageAlt: "Students in a Kisii University lecture",
  },
  {
    id: "research",
    index: "02",
    icon: Lightbulb,
    kicker: "Research",
    title: "Knowledge that solves local problems",
    body: "From food security to public health, our researchers work on the questions that matter to Kenya and the region. They publish answers the world can use.",
    stat: { value: 12, suffix: "+", label: "Research centres" },
    cta: { label: "Visit the research hub", href: researchFrontendUrl, external: true },
    imageUrl: "/images/about/about-overview-branded.webp",
    imageAlt: "Research at Kisii University",
  },
  {
    id: "outreach",
    index: "03",
    icon: Handshake,
    kicker: "Community outreach",
    title: "A university that serves its community",
    body: "Extension services, enterprise support, and partnerships that carry the university's work beyond the gate: into farms, schools, and county programmes.",
    stat: { value: 100, suffix: "K+", label: "Lives reached" },
    cta: { label: "See community impact", href: "/about" },
    imageUrl: "/images/about/about-service-charter-branded.webp",
    imageAlt: "Community outreach by Kisii University",
  },
];

export function MandatePillarsSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="mandate"
      aria-labelledby="mandate-heading"
      className="border-b border-border bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Why Kisii University
          </p>
          <h2
            id="mandate-heading"
            className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl"
          >
            One mandate, three promises
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Everything the university does is teaching, research, or service to
            community. Every programme, centre, and partnership answers to
            one of the three.
          </p>
        </div>

        <div className="mt-12 space-y-14 lg:mt-16 lg:space-y-20">
          {pillars.map((pillar, index) => {
            const imageLeft = index % 2 === 0;
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14"
              >
                {/* The scene */}
                <motion.div
                  className={cn("group", imageLeft ? "" : "lg:order-2")}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border">
                    <PublicImage
                      src={pillar.imageUrl}
                      alt={pillar.imageAlt}
                      ratio="fill"
                      className="absolute inset-0 h-full w-full"
                      imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                    {/* Stat chip anchored to the scene */}
                    <div className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-primary/85 px-4 py-2.5 text-white backdrop-blur-sm">
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none">
                        <CountUpNumber
                          value={pillar.stat.value}
                          suffix={pillar.stat.suffix}
                          duration={1600}
                        />
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/75">
                        {pillar.stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* The words */}
                <motion.div
                  className={imageLeft ? "" : "lg:order-1"}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary">
                      {pillar.index}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary ring-1 ring-border">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {pillar.kicker}
                    </span>
                  </div>
                  <h3 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-primary sm:text-3xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                    {pillar.body}
                  </p>
                  {pillar.cta.external ? (
                    <a
                      href={pillar.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group/link mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary",
                        focusVisibleStyles.primary
                      )}
                    >
                      {pillar.cta.label}
                      <ArrowRight
                        className="h-4 w-4 transition group-hover/link:translate-x-1"
                        aria-hidden
                      />
                    </a>
                  ) : (
                    <Link
                      href={pillar.cta.href}
                      className={cn(
                        "group/link mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary",
                        focusVisibleStyles.primary
                      )}
                    >
                      {pillar.cta.label}
                      <ArrowRight
                        className="h-4 w-4 transition group-hover/link:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MandatePillarsSection;
