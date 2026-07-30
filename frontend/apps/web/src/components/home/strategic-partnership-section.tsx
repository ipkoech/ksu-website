"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Handshake, Globe, Award, Users } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Section, SectionHeader, CrossfadeImages, focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";

const partnershipHighlights = [
  {
    id: "global",
    title: "Global Collaborations",
    description: "Partnerships with universities and institutions across Africa, Europe, and North America.",
    icon: Globe,
    stat: "25+",
    statLabel: "International Partners",
  },
  {
    id: "industry",
    title: "Industry Connections",
    description: "Working with leading organizations to create real-world learning opportunities.",
    icon: Handshake,
    stat: "40+",
    statLabel: "Industry Partners",
  },
  {
    id: "research",
    title: "Research Networks",
    description: "Collaborative research initiatives addressing regional and global challenges.",
    icon: Award,
    stat: "15+",
    statLabel: "Research Consortia",
  },
  {
    id: "community",
    title: "Community Impact",
    description: "Extension services and partnerships serving communities across Western Kenya.",
    icon: Users,
    stat: "100K+",
    statLabel: "Lives Impacted",
  },
];

const spotlightImages = [
  "/images/partnerships/partner-1.jpg",
  "/images/partnerships/partner-2.jpg",
  "/images/partnerships/partner-3.jpg",
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.1,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function StrategicPartnershipSection() {
  const reducedMotion = useReducedMotion();

  return (
    <Section
      className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-14 lg:py-20"
      id="strategic-partnerships"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Content Side */}
          <div>
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Strategic Partnerships
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-foreground sm:text-4xl">
                Building Bridges for <br />
                <span className="text-primary">Transformative Impact</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Kisii University collaborates with local and international partners
                to expand educational opportunities, drive research innovation, and
                create lasting community impact. Our strategic alliances strengthen
                academic programmes and open doors for students and researchers.
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
                href="/about/partnerships"
                className={cn(
                  "inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90",
                  focusVisibleStyles.default
                )}
              >
                Explore Partnerships
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact?subject=partnership"
                className={cn(
                  "inline-flex min-h-12 items-center gap-2 rounded-md border border-border bg-white px-6 text-sm font-semibold text-primary transition hover:bg-accent",
                  focusVisibleStyles.default
                )}
              >
                Partner With Us
              </Link>
            </motion.div>
          </div>

          {/* Visual Side */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-primary/15">
              <CrossfadeImages
                images={spotlightImages}
                alt="Partnership spotlight"
                interval={5000}
                className="h-full w-full"
                imageClassName="object-cover"
                kenBurnsEffect
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Handshake className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
                    80+
                  </span>
                  <p className="text-xs font-medium text-muted-foreground">
                    Active Partnerships
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Highlights Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partnershipHighlights.map((item, index) => (
            <motion.div
              key={item.id}
              custom={index}
              variants={reducedMotion ? undefined : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-4 border-t border-border pt-4">
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-secondary">
                  {item.stat}
                </span>
                <p className="text-xs font-medium text-muted-foreground">
                  {item.statLabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default StrategicPartnershipSection;
