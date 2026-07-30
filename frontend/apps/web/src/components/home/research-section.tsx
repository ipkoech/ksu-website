"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, FlaskConical, Globe, Users } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import {
  Section,
  SectionHeader,
  ParallaxSection,
  focusVisibleStyles,
} from "@ksu/ui/motion";
import { researchFrontendUrl } from "@/lib/service-urls";

const researchAreas = [
  {
    id: "agriculture",
    title: "Agriculture & Food Security",
    description: "Sustainable farming, crop improvement, and food systems research for community impact.",
    icon: FlaskConical,
  },
  {
    id: "health",
    title: "Health & Medical Sciences",
    description: "Public health initiatives, disease prevention, and healthcare delivery improvements.",
    icon: Users,
  },
  {
    id: "education",
    title: "Education & Development",
    description: "Innovative teaching methods, curriculum development, and lifelong learning.",
    icon: BookOpen,
  },
  {
    id: "technology",
    title: "Technology & Innovation",
    description: "Digital solutions, ICT advancement, and technical capacity building.",
    icon: Globe,
  },
];

const areaVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function ResearchSection() {
  const reducedMotion = useReducedMotion();

  return (
    <ParallaxSection
      backgroundImage="/images/research/research-hero.jpg"
      overlay="dark"
      overlayOpacity={0.75}
      speed={0.3}
      className="py-16 lg:py-24"
      contentClassName="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Research & Innovation
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Research with <br />
              Community Impact
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80">
              Our research addresses real-world challenges in agriculture, health,
              education, technology, and public service. We connect scholarly inquiry
              with community needs to drive meaningful change.
            </p>
          </motion.div>

          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href={researchFrontendUrl}
              className={cn(
                "inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:bg-secondary/90",
                focusVisibleStyles.white
              )}
            >
              Explore Research
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/about/research-priorities"
              className={cn(
                "inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20",
                focusVisibleStyles.white
              )}
            >
              Research Priorities
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {researchAreas.map((area, index) => (
            <motion.div
              key={area.id}
              custom={index}
              variants={reducedMotion ? undefined : areaVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="group rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                <area.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-white">
                {area.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {area.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 grid gap-6 rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-5"
      >
        {[
          { value: "50+", label: "Active Projects" },
          { value: "120+", label: "Researchers" },
          { value: "25+", label: "Partners" },
          { value: "80+", label: "Publications" },
          { value: "15+", label: "Grants Awarded" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-secondary">
              {stat.value}
            </span>
            <p className="mt-1 text-sm font-medium text-white/70">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </ParallaxSection>
  );
}

export default ResearchSection;
