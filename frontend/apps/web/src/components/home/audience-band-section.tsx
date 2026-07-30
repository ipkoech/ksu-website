"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Building2,
  Heart,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
  CalendarDays,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Section, focusVisibleStyles } from "@ksu/ui/motion";

interface AudienceCard {
  title: string;
  description: string;
  icon: LucideIcon;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
    accent?: boolean;
    icon: LucideIcon;
  }>;
  gradient: string;
}

const audiences: AudienceCard[] = [
  {
    title: "Prospective Students",
    description:
      "Begin your journey at Kisii University. Explore programmes tailored to your aspirations, understand entry requirements, and start your application today.",
    icon: GraduationCap,
    gradient: "from-primary/10 to-primary/5",
    links: [
      {
        label: "Apply Now",
        href: "/admissions/how-to-apply",
        icon: ClipboardCheck,
        accent: true,
      },
      {
        label: "Explore Programmes",
        href: "/academics/programmes",
        icon: GraduationCap,
      },
      {
        label: "Entry Requirements",
        href: "/admissions/requirements",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Current Students & Staff",
    description:
      "Access your portal, library resources, and campus services. Stay connected with the tools and support you need to succeed.",
    icon: Users,
    gradient: "from-secondary/10 to-secondary/5",
    links: [
      {
        label: "Student Portal",
        href: "https://portal.kisiiuniversity.ac.ke",
        icon: Users,
        external: true,
      },
      {
        label: "Staff Portal",
        href: "https://digital.kisiiuniversity.ac.ke/staff/services/login",
        icon: Building2,
        external: true,
      },
      {
        label: "Library",
        href: "/library",
        icon: BookOpen,
        external: true,
      },
    ],
  },
  {
    title: "Parents & Guardians",
    description:
      "We partner with you in your child's educational journey. Find information on safety, fees, scholarships, and how to stay involved.",
    icon: Heart,
    gradient: "from-accent to-background",
    links: [
      {
        label: "Safety & Wellbeing",
        href: "/campus-life/support",
        icon: ShieldCheck,
      },
      {
        label: "Fees & Scholarships",
        href: "/admissions/fees",
        icon: CalendarDays,
      },
      {
        label: "Contact Admissions",
        href: "/contact",
        icon: Phone,
      },
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.15,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function AudienceBandSection() {
  const reducedMotion = useReducedMotion();

  return (
    <Section
      className="border-y border-border bg-gradient-to-b from-background to-accent/30 py-12 lg:py-16"
      id="audience-band"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {audiences.map((audience, index) => (
            <motion.article
              key={audience.title}
              custom={index}
              variants={reducedMotion ? undefined : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg",
                audience.gradient
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-md">
                  <audience.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                  {audience.title}
                </h3>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {audience.description}
              </p>

              <nav className="space-y-2" aria-label={`${audience.title} links`}>
                {audience.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                        focusVisibleStyles.default,
                        link.accent
                          ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-primary"
                      )}
                    >
                      <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                        focusVisibleStyles.default,
                        link.accent
                          ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-primary"
                      )}
                    >
                      <link.icon className="h-4 w-4 shrink-0" aria-hidden />
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default AudienceBandSection;
