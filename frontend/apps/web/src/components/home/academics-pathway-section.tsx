"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Mail,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Section, SectionHeader, focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { CountdownStrip } from "@/components/home/countdown-strip";
import type { HomeSchoolCard, HomeIntake } from "@/lib/homepage-data";

export interface AcademicsPathwaySectionProps {
  schools: HomeSchoolCard[];
  activeIntakes: HomeIntake[];
}

const journeySteps = [
  {
    step: "01",
    title: "Choose programme",
    description: "Compare schools, levels, delivery modes, and programme fit.",
    href: "/academics/programmes",
  },
  {
    step: "02",
    title: "Check requirements",
    description: "Confirm entry criteria, intake eligibility, and required records.",
    href: "/admissions/requirements",
  },
  {
    step: "03",
    title: "Confirm intake",
    description: "Review the admission guide and prepare your application documents.",
    href: "/admissions/intakes",
  },
  {
    step: "04",
    title: "Apply and submit",
    description: "Complete the official application route and submit documents.",
    href: "/admissions/how-to-apply",
    accent: true,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
};

export function AcademicsPathwaySection({
  schools,
  activeIntakes,
}: AcademicsPathwaySectionProps) {
  const reducedMotion = useReducedMotion();
  const activeIntake = activeIntakes[0] ?? null;
  const activeDeadline =
    activeIntake?.lateApplicationEnd ?? activeIntake?.applicationEnd;
  const shouldShowCountdown = hasFutureDeadline(activeDeadline);

  if (schools.length === 0) return null;

  return (
    <Section
      className="border-b border-border bg-white py-14 lg:py-20"
      id="academics"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <SectionHeader
          eyebrow="Academics & Admissions"
          title="Schools, Programmes & Your Journey"
          description="Browse schools with sample programmes, scan highlighted academic routes, and move straight into the admission steps."
          align="left"
          actions={
            <Link
              href="/academics"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary",
                focusVisibleStyles.default
              )}
            >
              View all academics
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.7fr)]">
          {/* Schools Grid */}
          <div className="rounded-xl border border-border bg-accent/30 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                Schools
              </h3>
              <Link
                href="/academics/schools"
                className="text-xs font-bold text-primary hover:text-secondary"
              >
                View all schools
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schools.slice(0, 6).map((school, index) => (
                <motion.article
                  key={school.href}
                  custom={index}
                  variants={reducedMotion ? undefined : cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
                >
                  <Link href={school.href} className="block">
                    <PublicImage
                      src={school.imageUrl}
                      alt=""
                      ratio="card"
                      fallbackSrc="/logos/ksu-bck1.jpg"
                      fallbackContent={<GraduationCap className="h-6 w-6" />}
                      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                      className="h-28"
                      imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {school.eyebrow ?? "School"}
                      </span>
                      <h4 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-foreground group-hover:text-primary">
                        {school.title}
                      </h4>
                      {school.programmes.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {school.programmes.length} featured programme
                          {school.programmes.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Application Journey */}
          <div className="rounded-xl bg-primary p-6 text-white shadow-xl shadow-primary/15">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Application Journey
            </h3>
            <span className="mt-2 block h-0.5 w-8 bg-secondary" />

            <div className="mt-6 space-y-3">
              {journeySteps.map((step, index) => (
                <Link
                  key={step.step}
                  href={
                    step.step === "03" && activeIntake
                      ? activeIntake.href
                      : step.step === "04" && activeIntake
                        ? activeIntake.href
                        : step.href
                  }
                  className={cn(
                    "group block rounded-lg border p-4 transition-[background-color,transform] duration-150 active:scale-[0.98]",
                    step.accent
                      ? "border-secondary/50 bg-secondary/15 hover:bg-secondary/25"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="text-xs font-bold text-secondary">
                    {step.step}
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-white">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    {step.step === "03" && activeIntake && shouldShowCountdown
                      ? `Apply for the ${intakeLabel(activeIntake)} before the deadline.`
                      : step.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Intake Status Card */}
            <div className="mt-6 rounded-lg border border-white/10 bg-white p-5 text-foreground">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                {activeIntake && shouldShowCountdown
                  ? "Applications Open"
                  : "Admissions"}
              </p>
              <h4 className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold">
                {activeIntake && shouldShowCountdown
                  ? `${intakeLabel(activeIntake)} is currently open`
                  : "Prepare your application"}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {activeIntake && shouldShowCountdown
                  ? `Application deadline: ${formatDate(activeDeadline)}.`
                  : "Review the guide, compare programmes, and contact admissions."}
              </p>

              <div className="mt-4 grid gap-2">
                <Link
                  href={activeIntake?.href ?? "/admissions/how-to-apply"}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.98]",
                    focusVisibleStyles.default
                  )}
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-primary transition-[background-color,transform] duration-150 hover:bg-accent active:scale-[0.98]",
                    focusVisibleStyles.default
                  )}
                >
                  Contact Us
                  <Mail className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {activeIntake && shouldShowCountdown && activeDeadline && (
                <div className="mt-4 overflow-hidden rounded-md">
                  <CountdownStrip
                    title={`${intakeLabel(activeIntake)} Countdown`}
                    deadline={activeDeadline}
                    deadlineLabel={formatDate(activeDeadline)}
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function hasFutureDeadline(value?: string | null) {
  if (!value) return false;
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline.getTime() > Date.now();
}

function intakeLabel(intake: HomeIntake) {
  const text = `${intake.name} ${intake.code}`.toLowerCase();
  if (text.includes("kuccps")) return "KUCCPS Intake";
  if (text.includes("school") || text.includes("self"))
    return "School-Based Intake";
  return intake.name;
}

function formatDate(value?: string | null) {
  if (!value) return "Published deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default AcademicsPathwaySection;
