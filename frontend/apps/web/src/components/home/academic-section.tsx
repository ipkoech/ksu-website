"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, ScrollReveal } from "@ksu/ui/components";
import {
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  School,
  Users,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { SchoolCard, ActiveIntake } from "@/lib/get-academics";

interface AcademicSectionProps {
  schools: SchoolCard[];
  activeIntake: ActiveIntake | null;
}

// School cover image fallbacks use local institutional imagery, not stock photos.
const schoolImageMap: Record<string, string> = {
  SBE: "/logos/ksu-bck1.jpg",
  SEHRD: "/logos/ksu-bck5.jpg",
  SHS: "/logos/ksu-bck1.jpg",
  SIST: "/logos/ksu-bck5.jpg",
  SOL: "/logos/ksu-bck1.jpg",
  SANRM: "/logos/ksu-bck5.jpg",
  SASS: "/logos/ksu-bck1.jpg",
  SPAS: "/logos/ksu-bck5.jpg",
};

function getSchoolImage(school: SchoolCard): string | null {
  if (school.coverImage) return school.coverImage;
  if (school.shortName && schoolImageMap[school.shortName]) {
    return schoolImageMap[school.shortName];
  }
  return null;
}

const fallbackSchools: SchoolCard[] = [
  {
    id: "school-of-agriculture-and-natural-resources-management",
    name: "School of Agriculture and Natural Resources Management",
    slug: "school-of-agriculture-and-natural-resources-management",
    shortName: "SANRM",
    coverImage: null,
  },
  {
    id: "school-of-arts-and-social-sciences",
    name: "School of Arts and Social Sciences",
    slug: "school-of-arts-and-social-sciences",
    shortName: "SASS",
    coverImage: null,
  },
  {
    id: "school-of-business-and-economics",
    name: "School of Business and Economics",
    slug: "school-of-business-and-economics",
    shortName: "SBE",
    coverImage: null,
  },
  {
    id: "school-of-education-and-human-resource-development",
    name: "School of Education and Human Resource Development",
    slug: "school-of-education-and-human-resource-development",
    shortName: "SEHRD",
    coverImage: null,
  },
  {
    id: "school-of-health-sciences",
    name: "School of Health Sciences",
    slug: "school-of-health-sciences",
    shortName: "SHS",
    coverImage: null,
  },
  {
    id: "school-of-information-science-and-technology",
    name: "School of Information Science and Technology",
    slug: "school-of-information-science-and-technology",
    shortName: "SIST",
    coverImage: null,
  },
  {
    id: "school-of-law",
    name: "School of Law",
    slug: "school-of-law",
    shortName: "SOL",
    coverImage: null,
  },
  {
    id: "school-of-pure-and-applied-sciences",
    name: "School of Pure and Applied Sciences",
    slug: "school-of-pure-and-applied-sciences",
    shortName: "SPAS",
    coverImage: null,
  },
];

const programmeCategories = [
  {
    level: "phd",
    name: "Doctoral",
    description: "Advance knowledge through original research",
    icon: GraduationCap,
    color: "from-purple-600 to-purple-800",
    href: "/academics/programmes?level=phd",
  },
  {
    level: "masters",
    name: "Masters",
    description: "Specialize and deepen your expertise",
    icon: Award,
    color: "from-blue-600 to-blue-800",
    href: "/academics/programmes?level=masters",
  },
  {
    level: "undergraduate",
    name: "Bachelors",
    description: "Build a strong academic foundation",
    icon: BookOpen,
    color: "from-emerald-600 to-emerald-800",
    href: "/academics/programmes?level=undergraduate",
  },
  {
    level: "certificate",
    name: "Certificate",
    description: "Gain practical skills quickly",
    icon: FileText,
    color: "from-amber-600 to-amber-800",
    href: "/academics/programmes?level=certificate",
  },
];

const journeySteps = [
  {
    step: 1,
    title: "Explore Schools",
    description: "Find your field of interest",
  },
  {
    step: 2,
    title: "Choose Programme",
    description: "Select your study level",
  },
  { step: 3, title: "Apply Now", description: "Start your journey" },
];

export function AcademicSection({
  schools: initialSchools,
  activeIntake,
}: AcademicSectionProps) {
  const schools = initialSchools.length > 0 ? initialSchools : fallbackSchools;
  const stats = [
    { value: String(schools.length), label: "Schools", icon: School },
    {
      value: String(programmeCategories.length),
      label: "Study levels",
      icon: BookMarked,
    },
    { value: "20K+", label: "Students", icon: Users },
  ];

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!activeIntake?.endDate) return;

    const updateCountdown = () => {
      const end = new Date(activeIntake.endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeIntake?.endDate]);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 sm:px-6 lg:px-12">
        {/* Header with Stats */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
              Find Your Path
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-slate-950 sm:text-5xl">
              Your Academic Journey Starts Here
            </h2>
          </div>
        </ScrollReveal>

        {/* Stats Bar + Journey Steps - Compact on Mobile */}
        <ScrollReveal>
          <div className="flex justify-center gap-6 sm:gap-8 lg:gap-16 mb-6 lg:mb-10 py-4 lg:py-6 border-y border-slate-200">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 lg:gap-3"
              >
                <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg lg:text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="text-xs lg:text-sm text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Journey Steps - Inline on Mobile */}
        <ScrollReveal>
          <div className="flex justify-center items-center gap-2 lg:gap-4 mb-8 lg:mb-12">
            {journeySteps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className="flex items-center gap-1.5 lg:gap-3 bg-white rounded-full px-3 py-1.5 lg:px-5 lg:py-3 shadow-sm border border-slate-200">
                  <span className="w-5 h-5 lg:w-8 lg:h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs lg:text-sm font-bold">
                    {step.step}
                  </span>
                  <p className="text-xs lg:text-sm font-semibold text-slate-900">
                    {step.title}
                  </p>
                </div>
                {index < journeySteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300 mx-1 lg:mx-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Main Content: Schools + Programmes */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* Schools Grid - 2/3 width */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <h3 className="text-xl font-bold text-slate-950">
                    Explore Our Schools
                  </h3>
                </div>
                <Link
                  href="/academics/schools"
                  className="text-sm font-semibold text-primary hover:text-secondary"
                >
                  View all →
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {schools.slice(0, 8).map((school, index) => {
                const imageUrl = getSchoolImage(school);
                return (
                  <ScrollReveal key={school.id} delay={index * 50}>
                    <Link
                      href={`/academics/schools/${school.slug}`}
                      className="group block h-full overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <PublicImage
                        src={imageUrl}
                        alt={school.name}
                        ratio="card"
                        fallbackSrc={
                          index % 2 === 0
                            ? "/logos/ksu-bck1.jpg"
                            : "/logos/ksu-bck5.jpg"
                        }
                        fallbackContent={
                          <span className="text-2xl font-bold text-primary/40">
                            {school.shortName || school.name.charAt(0)}
                          </span>
                        }
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 25vw, 50vw"
                        className="h-28"
                        imageClassName="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="p-3 h-16 flex items-center">
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {school.name}
                        </h4>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* Programme Categories - 1/3 width */}
          <div className="lg:col-span-1">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <h3 className="text-xl font-bold text-slate-950">
                    Choose Level
                  </h3>
                </div>
                <Link
                  href="/academics/programmes"
                  className="text-sm font-semibold text-primary hover:text-secondary"
                >
                  View all →
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-3">
              {programmeCategories.map((category, index) => (
                <ScrollReveal key={category.level} delay={index * 75}>
                  <Link
                    href={category.href}
                    className="group relative overflow-hidden rounded-xl p-4 h-full min-h-[120px] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color}`}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                    <div className="relative z-10">
                      <category.icon className="w-6 h-6 text-white/90 mb-2" />
                      <h4 className="text-base font-bold text-white">
                        {category.name}
                      </h4>
                    </div>

                    <div className="relative z-10 mt-2">
                      <span className="text-xs font-semibold text-white/80 group-hover:text-white">
                        Explore →
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Apply - Admissions CTA */}
        <ScrollReveal>
          <div className="rounded-2xl bg-gradient-to-br from-secondary via-secondary to-secondary/90 p-8 lg:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-3 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-lg font-bold">
                    3
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full">
                    {activeIntake ? "Applications Open" : "Apply Now"}
                  </span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold">
                  {activeIntake?.name || "Start Your Application"}
                </h3>
                <p className="mt-4 text-white/90 max-w-md">
                  {activeIntake
                    ? "Use the published intake information to prepare your application and next steps."
                    : "Ready to join Kisii University? Begin your application process and embark on your academic journey."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-secondary hover:bg-white/90"
                  >
                    <Link href="/admissions/how-to-apply">Apply Now</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Link href="/admissions">Admission Guide</Link>
                  </Button>
                </div>
              </div>

              {activeIntake && (
                <div className="lg:col-span-1">
                  <p className="text-sm font-medium text-white/80 mb-3 text-center lg:text-left">
                    Application Deadline
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { value: countdown.days, label: "Days" },
                      { value: countdown.hours, label: "Hrs" },
                      { value: countdown.minutes, label: "Min" },
                      { value: countdown.seconds, label: "Sec" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-white/20 backdrop-blur-sm rounded-xl p-3"
                      >
                        <p className="text-2xl lg:text-3xl font-bold">
                          {String(item.value).padStart(2, "0")}
                        </p>
                        <p className="text-xs text-white/80 mt-1">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
