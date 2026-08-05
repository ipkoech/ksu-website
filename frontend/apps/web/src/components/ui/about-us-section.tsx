"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Compass,
  Globe2,
  Landmark,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import Link from "next/link";

interface AboutUsSectionProps {
  overview: string;
  historySummary: string;
  vision: string;
  mission: string;
  philosophy: string;
  stats: { value: string; label: string }[];
  timeline: { year: string; title: string; detail: string }[];
}

export default function AboutUsSection({
  overview,
  historySummary,
  vision,
  mission,
  philosophy,
  stats,
  timeline,
}: AboutUsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -8]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.16,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
  };

  const pillars = [
    {
      icon: <Landmark className="h-6 w-6" />,
      secondaryIcon: (
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Institutional History",
      description: historySummary,
      position: "left" as const,
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      secondaryIcon: (
        <CheckCircle className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Mission",
      description: mission,
      position: "left" as const,
    },
    {
      icon: <Compass className="h-6 w-6" />,
      secondaryIcon: (
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Philosophy",
      description: philosophy,
      position: "left" as const,
    },
    {
      icon: <Globe2 className="h-6 w-6" />,
      secondaryIcon: (
        <CheckCircle className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Vision",
      description: vision,
      position: "right" as const,
    },
    {
      icon: <Users className="h-6 w-6" />,
      secondaryIcon: (
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Community",
      description:
        "Kisii University's public role is built around quality training, research, innovation, and community engagement for sustainable development.",
      position: "right" as const,
    },
    {
      icon: <Scale className="h-6 w-6" />,
      secondaryIcon: (
        <CheckCircle className="absolute -right-1 -top-1 h-4 w-4 text-secondary" />
      ),
      title: "Public Mandate",
      description:
        "The university's charter, governance structures, and academic systems are presented as part of a coherent public institutional mandate rather than disconnected pages.",
      position: "right" as const,
    },
  ];

  const statCards = [
    {
      icon: <Award />,
      value: stats[0]?.value ?? "1965",
      label: stats[0]?.label ?? "Established",
      suffix: "",
    },
    {
      icon: <Building2 />,
      value: Number(stats[1]?.value ?? "61"),
      label: stats[1]?.label ?? "Acres Donated",
      suffix: "",
    },
    {
      icon: <Calendar />,
      value: Number(stats[2]?.value ?? "8"),
      label: stats[2]?.label ?? "Schools",
      suffix: "",
    },
    {
      icon: <TrendingUp />,
      value: Number(stats[4]?.value ?? "2013"),
      label: stats[4]?.label ?? "University Charter",
      suffix: "",
    },
  ];

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-surface-subtle via-white to-surface-muted px-4 py-20 text-foreground sm:px-6 lg:px-8"
    >
      <motion.div
        className="absolute left-10 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(to_right,#4f4f4f14_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f14_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)]" />

      <motion.div
        className="relative z-10 w-full"
        initial="hidden"
        animate={isInView || isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div
          className="mb-8 flex flex-col items-center"
          variants={itemVariants}
        >
          <span className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            <Sparkles className="h-4 w-4" />
            Discover Our Story
          </span>
          <h2 className="text-center font-[family-name:var(--font-display)] text-4xl leading-tight text-foreground md:text-5xl">
            About Kisii University
          </h2>
          <motion.div
            className="mt-4 h-1 w-24 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.9, delay: 0.35 }}
          />
        </motion.div>

        <motion.p
          className="mx-auto mb-14 max-w-4xl text-center text-base leading-8 text-muted-foreground md:text-lg"
          variants={itemVariants}
        >
          {overview}
        </motion.p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-12">
            {pillars
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <ServiceItem
                  key={`left-${service.title}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.16}
                  direction="left"
                />
              ))}
          </div>

          <div className="order-first mb-6 flex items-center justify-center md:order-none md:mb-0">
            <motion.div
              className="relative w-full max-w-sm"
              variants={itemVariants}
            >
              <motion.div
                className="overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/40"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.22 }}
              >
                <PublicImage
                  src="/logos/ksu-bck5.jpg"
                  alt="Kisii University campus"
                  ratio="card"
                  sizes="(min-width: 768px) 384px, 100vw"
                  className="h-[520px] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-overlay/85 via-brand-overlay/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                    Institutional Vision
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight">
                    {vision}
                  </h3>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/about/university-management"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface-muted active:scale-[0.98]"
                    >
                      University Management
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute inset-0 -m-3 rounded-[2.2rem] border-2 border-border/80"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.div>
          </div>

          <div className="space-y-12">
            {pillars
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <ServiceItem
                  key={`right-${service.title}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.16}
                  direction="right"
                />
              ))}
          </div>
        </div>

        <motion.div
          className="mt-20 rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-primary/40"
          variants={itemVariants}
        >
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Key Milestones
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-foreground">
                The institutional timeline in one compact strip.
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              These markers summarize the university's progression from teacher
              training college to chartered public university without requiring
              a separate long history page.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {timeline.slice(0, 6).map((item, index) => (
              <article
                key={`${item.year}-${item.title}`}
                className={`rounded-[1.5rem] p-5 ${
                  index === 0
                    ? "bg-brand-overlay text-white"
                    : "border border-border bg-surface-subtle"
                }`}
              >
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.22em] ${
                    index === 0 ? "text-secondary" : "text-primary"
                  }`}
                >
                  {item.year}
                </p>
                <h4
                  className={`mt-3 text-xl font-semibold ${
                    index === 0 ? "text-white" : "text-foreground"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`mt-3 text-sm leading-7 ${
                    index === 0 ? "text-muted-foreground/50" : "text-muted-foreground"
                  }`}
                >
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={statsRef}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {statCards.map((stat, index) => (
            <StatCounter
              key={`${stat.label}-${index}`}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.08}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

interface ServiceItemProps {
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  title: string;
  description: string;
  variants: Variants;
  delay: number;
  direction: "left" | "right";
}

function ServiceItem({
  icon,
  secondaryIcon,
  title,
  description,
  variants,
  delay,
  direction,
}: ServiceItemProps) {
  return (
    <motion.div
      className="group flex flex-col"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="mb-3 flex items-center gap-3"
        initial={{ x: direction === "left" ? -16 : 16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: delay + 0.12 }}
      >
        <motion.div
          className="relative rounded-xl bg-primary/10 p-3 text-primary transition-colors duration-200 group-hover:bg-primary/15"
          whileHover={{
            rotate: [0, -8, 8, -4, 0],
            transition: { duration: 0.45 },
          }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="pl-12 text-sm leading-7 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: delay + 0.24 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

interface StatCounterProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(countRef, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^0-9]/g, "")) || 0;

  const springValue = useSpring(0, {
    stiffness: 52,
    damping: 12,
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(numericValue);
      setHasAnimated(true);
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      setHasAnimated(false);
    }
  }, [isInView, numericValue, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (latest) =>
    Math.floor(latest),
  );

  return (
    <motion.div
      className="group rounded-[1.5rem] border border-border bg-white p-6 text-center shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-surface-subtle"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, delay },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15"
        whileHover={{ rotate: 360, transition: { duration: 0.7 } }}
      >
        {icon}
      </motion.div>
      <motion.div
        ref={countRef}
        className="flex items-center justify-center text-3xl font-bold text-foreground"
      >
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <motion.div className="mx-auto mt-3 h-0.5 w-10 bg-secondary transition-[width] duration-200 group-hover:w-16" />
    </motion.div>
  );
}
