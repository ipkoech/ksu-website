"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, BookOpen, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Section, focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";

interface JourneyRoute {
  id: string;
  title: string;
  description: string;
  href: string;
  label: string;
  imageUrl: string;
  icon: LucideIcon;
  gradient: string;
}

const routes: JourneyRoute[] = [
  {
    id: "apply",
    title: "Study With Us",
    description: "Start your application through the admissions guide and active intake routes.",
    href: "/admissions/how-to-apply",
    label: "Apply Now",
    imageUrl: "/logos/ksu-bck1.jpg",
    icon: GraduationCap,
    gradient: "from-primary/80 to-primary",
  },
  {
    id: "programmes",
    title: "Explore Programmes",
    description: "Compare academic options across schools before choosing your path.",
    href: "/academics/programmes",
    label: "View Programmes",
    imageUrl: "/logos/ksu-bck5.jpg",
    icon: BookOpen,
    gradient: "from-secondary/80 to-secondary",
  },
  {
    id: "contact",
    title: "Discover KSU",
    description: "Reach the university for guidance on requirements, deadlines, and next steps.",
    href: "/contact",
    label: "Contact Us",
    imageUrl: "/images/about/about-service-charter-branded.webp",
    icon: Phone,
    gradient: "from-primary/70 to-primary/90",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function JourneyCtaSection() {
  const reducedMotion = useReducedMotion();

  return (
    <Section className="bg-brand-overlay py-16 text-white lg:py-24">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Take the Next Step
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight lg:text-5xl">
              Start your journey <br />
              with Kisii University
            </h2>
          </motion.div>
          <motion.p
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-md text-base leading-relaxed text-white/75 lg:text-right"
          >
            Clear pathways for applicants, programme explorers, and visitors who
            need direct admissions support.
          </motion.p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {routes.map((route, index) => (
            <motion.article
              key={route.id}
              custom={index}
              variants={reducedMotion ? undefined : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="group relative"
            >
              <Link
                href={route.href}
                className={cn(
                  "relative block min-h-[320px] overflow-hidden rounded-3xl",
                  focusVisibleStyles.white
                )}
              >
                <PublicImage
                  src={route.imageUrl}
                  alt=""
                  ratio="fill"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    route.gradient
                  )}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/20 text-white backdrop-blur-sm">
                    <route.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
                    {route.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    {route.description}
                  </p>
                  <span className="mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary shadow-lg transition-[background-color,transform] duration-150 group-hover:bg-white/95 group-active:scale-[0.98]">
                    {route.label}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
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

export default JourneyCtaSection;
