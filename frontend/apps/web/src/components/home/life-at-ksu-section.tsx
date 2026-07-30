"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users, Building2, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import {
  Section,
  SectionHeader,
  BentoGallery,
  focusVisibleStyles,
} from "@ksu/ui/motion";

interface LifeCard {
  id: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  icon: LucideIcon;
  featured?: boolean;
}

const lifeCards: LifeCard[] = [
  {
    id: "clubs",
    title: "Clubs & Societies",
    description: "Connect with academic, professional, and student-interest groups that match your passions.",
    href: "/campus-life/clubs",
    imageUrl: "/images/campus-life/clubs.jpg",
    icon: Users,
    featured: true,
  },
  {
    id: "accommodation",
    title: "Accommodation",
    description: "Find student housing information and support channels.",
    href: "/campus-life/accommodation",
    imageUrl: "/images/about/about-overview-branded.webp",
    icon: Building2,
  },
  {
    id: "health",
    title: "Health Services",
    description: "Access campus health and wellness information.",
    href: "/campus-life/health-services",
    imageUrl: "/images/about/about-service-charter-branded.webp",
    icon: ShieldCheck,
  },
  {
    id: "support",
    title: "Student Support",
    description: "Guidance, welfare, and student service routes.",
    href: "/campus-life/student-support",
    imageUrl: "/logos/ksu-bck5.jpg",
    icon: Sparkles,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function LifeAtKsuSection() {
  const reducedMotion = useReducedMotion();

  return (
    <Section
      className="border-b border-border bg-white py-14 lg:py-20"
      id="life-at-ksu"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <SectionHeader
          title="Life at Kisii University"
          description="Student life connects support services, accommodation, clubs, wellness, and everyday participation across the university."
          align="left"
          actions={
            <Link
              href="/campus-life"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary",
                focusVisibleStyles.default
              )}
            >
              Explore campus life
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {lifeCards.map((card, index) => (
            <motion.article
              key={card.id}
              custom={index}
              variants={reducedMotion ? undefined : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={cn(
                "group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
                card.featured && "lg:col-span-2"
              )}
            >
              <Link href={card.href} className={cn("block", focusVisibleStyles.default)}>
                <div className={cn("relative overflow-hidden", card.featured ? "h-48 lg:h-56" : "h-36")}>
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-primary shadow-sm">
                    <card.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="absolute bottom-3 left-4 text-sm font-bold text-white drop-shadow-lg">
                    {card.title}
                  </span>
                </div>
                <div className="p-5">
                  {card.featured && (
                    <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                  )}
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition group-hover:gap-3">
                    Learn more
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default LifeAtKsuSection;
