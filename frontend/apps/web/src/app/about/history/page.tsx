import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  Landmark,
  MapPinned,
  MoveRight,
  PhoneCall,
  School,
  Sparkles,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData, normalizeQuickFacts } from "@/lib/about-data";

type Fact = { label: string; value: string };
type Milestone = {
  year: string;
  title: string;
  detail: string;
  icon: LucideIcon;
};

const HISTORY_IMAGES = [
  "/images/history/KSUGreenLandscapingMay2026-3810.jpg",
  "/images/history/KSUGreenLandscapingMay2026-3885.jpg",
  "/images/history/KSUB-RollPhotos2025-122.jpg",
];

const HANDBOOK_INSIGHTS = [
  {
    title: "Teacher training roots",
    body: "The institution began on 61 acres donated by the County Council of Gusii and first served the region through teacher preparation.",
    icon: School,
  },
  {
    title: "University campus expansion",
    body: "Egerton University took over the college as one of Kenya's early university campuses, opening the way for degree-level programmes.",
    icon: Building2,
  },
  {
    title: "Chartered public university",
    body: "Rapid academic growth, collaborations, enrollment and regional development led to the 2013 charter as Kenya's 13th public university.",
    icon: Landmark,
  },
  {
    title: "Scenic academic setting",
    body: "The Main Campus sits about two kilometres from Kisii Town Centre in an environment suited to teaching, research and community service.",
    icon: MapPinned,
  },
];

const PROGRAMME_FIELDS = [
  "Business and Economics",
  "Education and Human Resource Development",
  "Information Science and Technology",
  "Agriculture and Natural Resource Development",
  "Arts and Social Sciences",
  "Pure and Applied Sciences",
  "Law",
  "Health Sciences",
];

function factValue(facts: Fact[], patterns: RegExp[]) {
  return facts.find((fact) =>
    patterns.some(
      (pattern) => pattern.test(fact.label) || pattern.test(fact.value),
    ),
  )?.value;
}

function sentenceForYear(summary: string | null | undefined, year: string) {
  return summary
    ?.split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .find((sentence) => sentence.includes(year));
}

function cleanTitle(label: string) {
  return label
    .replace(/\b(year|date)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHistoryMilestones(
  summary: string | null | undefined,
  facts: Fact[],
  foundingYear?: string,
) {
  const guide: Array<{
    year?: string;
    title: string;
    icon: LucideIcon;
    patterns: RegExp[];
    fallbackDetail: string;
  }> = [
    {
      year: foundingYear,
      title: "Established",
      icon: Sprout,
      patterns: [/founding/i, /established/i],
      fallbackDetail: "Founded as Kisii Primary Teachers Training College.",
    },
    {
      title: "Upgraded",
      icon: Sparkles,
      patterns: [/1983/i, /secondary/i, /upgrade/i],
      fallbackDetail: "Upgraded to Kisii Teachers Training College.",
    },
    {
      title: "Egerton Campus",
      icon: Landmark,
      patterns: [/egerton/i, /1994/i],
      fallbackDetail: "Taken over by Egerton University as a campus.",
    },
    {
      title: "First Degree",
      icon: GraduationCap,
      patterns: [/first degree/i, /1999/i],
      fallbackDetail: "Launched the first degree programme in commerce.",
    },
    {
      title: "Constituent College",
      icon: School,
      patterns: [/constituent/i, /2007/i],
      fallbackDetail: "Established as a constituent college of Egerton University.",
    },
    {
      title: "Charter Granted",
      icon: BookOpenCheck,
      patterns: [/charter/i, /2013/i],
      fallbackDetail: "Granted charter status as Kenya's 13th public university.",
    },
  ];

  return guide
    .map((item): Milestone | null => {
      const fact = facts.find((entry) =>
        item.patterns.some(
          (pattern) => pattern.test(entry.label) || pattern.test(entry.value),
        ),
      );
      const year =
        item.year ??
        fact?.value.match(/\b(?:19|20)\d{2}\b/)?.[0] ??
        item.patterns
          .map((pattern) => pattern.source.match(/(?:19|20)\d{2}/)?.[0])
          .find(Boolean);
      if (!year) return null;
      return {
        year,
        title: fact ? cleanTitle(fact.label) || item.title : item.title,
        detail: sentenceForYear(summary, year) ?? item.fallbackDetail,
        icon: item.icon,
      };
    })
    .filter((item): item is Milestone => Boolean(item));
}

function EmptyBlock({
  label,
  inverse = false,
}: {
  label: string;
  inverse?: boolean;
}) {
  return (
    <p
      className={
        inverse
          ? "rounded-md border border-dashed border-white/20 bg-white/[0.05] p-4 text-sm leading-6 text-white/65"
          : "rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-500"
      }
    >
      {label} has not been published yet.
    </p>
  );
}

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
      {children}
    </p>
  );
}

function AtAGlancePanel({
  facts,
  foundingYear,
  charterYear,
}: {
  facts: Fact[];
  foundingYear?: string;
  charterYear?: string;
}) {
  const quickStats = [
    foundingYear ? { label: "Established", value: foundingYear } : null,
    factValue(facts, [/land acres/i])
      ? { label: "Main campus land", value: `${factValue(facts, [/land acres/i])} acres` }
      : null,
    factValue(facts, [/egerton/i])
      ? { label: "Egerton campus", value: factValue(facts, [/egerton/i])! }
      : null,
    charterYear ? { label: "Charter granted", value: charterYear } : null,
  ].filter((item): item is Fact => Boolean(item));

  return (
    <aside className="rounded-none border-t border-white/15 bg-white/[0.08] p-5 text-white backdrop-blur lg:border-l lg:border-t-0 lg:p-7">
      <CalendarDays aria-hidden className="h-6 w-6 text-secondary" />
      <SectionKicker>Kisii University at a glance</SectionKicker>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {quickStats.length ? (
          quickStats.map((fact) => (
            <div
              key={fact.label}
              className="group border border-white/15 bg-white/[0.06] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3"
            >
              <p className="text-2xl font-semibold leading-none text-white">
                {fact.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/58">
                {fact.label}
              </p>
            </div>
          ))
        ) : (
          <EmptyBlock label="Quick facts" inverse />
        )}
      </div>
    </aside>
  );
}

function HistoryImageMosaic() {
  return (
    <div className="grid h-full min-h-[420px] gap-3 p-3 sm:grid-cols-5 lg:min-h-[620px]">
      <div className="relative overflow-hidden rounded-lg sm:col-span-3 sm:row-span-2">
        <PublicImage
          src={HISTORY_IMAGES[0]}
          alt="Kisii University Main Campus sign"
          ratio="fill"
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="h-full rounded-none"
          imageClassName="object-[center_58%] transition duration-700 motion-safe:hover:scale-[1.04]"
        />
      </div>
      <div className="relative min-h-48 overflow-hidden rounded-lg sm:col-span-2">
        <PublicImage
          src={HISTORY_IMAGES[1]}
          alt="Kisii University library study spaces"
          ratio="fill"
          sizes="(min-width: 1024px) 26vw, 100vw"
          className="h-full rounded-none"
          imageClassName="object-[center_58%] transition duration-700 motion-safe:hover:scale-[1.04]"
        />
      </div>
      <div className="relative min-h-48 overflow-hidden rounded-lg bg-primary p-5 text-white sm:col-span-2">
        <p className="text-5xl font-semibold leading-none">13th</p>
        <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
          Public university in Kenya after receiving the Kisii University
          Charter in 2013.
        </p>
      </div>
    </div>
  );
}

function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute left-8 top-0 hidden h-full w-px bg-primary/20 md:block" />
      <div className="grid gap-3 p-4 sm:p-6 lg:grid-cols-3 xl:grid-cols-6 xl:p-8">
        {milestones.length ? (
          milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <article
                key={`${milestone.year}-${milestone.title}`}
                className="group relative min-h-64 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/70 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white transition duration-300 group-hover:bg-secondary group-hover:text-slate-950">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <p className="mt-5 text-4xl font-bold leading-none text-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-4 text-base font-bold text-slate-950">
                  {milestone.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {milestone.detail}
                </p>
              </article>
            );
          })
        ) : (
          <div className="lg:col-span-3 xl:col-span-6">
            <EmptyBlock label="History milestones" />
          </div>
        )}
      </div>
    </div>
  );
}

function HandbookInsightCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="group min-h-60 border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/70 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function AcademicFieldPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.14]">
      {label}
    </span>
  );
}

function HistoryCtaBand() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/images/history/KSUB-RollPhotos2025-122.jpg')] bg-cover bg-center opacity-30"
      />
      <div aria-hidden className="absolute inset-0 bg-primary/75" />
      <div className="relative grid max-w-none gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <SectionKicker>Take the next step</SectionKicker>
          <h2 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
            Be part of a university shaped by service, scholarship and regional
            transformation.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-primary"
          >
            <PhoneCall aria-hidden className="h-4 w-4" />
            Contact Us
          </Link>
          <Link
            href="/admissions"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Apply Now
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function AboutHistoryPage() {
  const overview = await getOverviewData();
  const facts = normalizeQuickFacts(overview?.quick_facts);
  const foundingYear =
    overview?.founding_year?.toString() ??
    factValue(facts, [/founding/i, /established/i]);
  const charterYear = factValue(facts, [/charter year/i, /charter/i]);
  const milestones = buildHistoryMilestones(
    overview?.history_summary,
    facts,
    foundingYear,
  );

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="overflow-hidden bg-slate-950 text-white">
          <div className="max-w-none px-4 py-6 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "History" },
              ]}
            />
          </div>

          <div className="grid max-w-none lg:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,0.72fr)]">
              <div className="flex items-end px-4 py-10 sm:px-6 lg:px-8">
                <div className="max-w-5xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
                  <SectionKicker>History of Kisii University</SectionKicker>
                  <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                    From teacher training roots to chartered public university
                  </h1>
                  {overview?.history_summary ? (
                    <p className="mt-7 max-w-4xl text-base leading-8 text-white/76 sm:text-lg">
                      {overview.history_summary}
                    </p>
                  ) : (
                    <div className="mt-7 max-w-xl">
                      <EmptyBlock label="History summary" inverse />
                    </div>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/admissions"
                      className="inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
                    >
                      Apply Now
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-primary"
                    >
                      Contact Us
                      <MoveRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <HistoryImageMosaic />
            </div>

            <AtAGlancePanel
              facts={facts}
              foundingYear={foundingYear}
              charterYear={charterYear}
            />
          </div>
        </section>

        <section className="bg-white">
          <div className="grid max-w-none lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 px-4 py-8 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
              <CalendarDays aria-hidden className="h-6 w-6 text-primary" />
              <SectionKicker>Milestones</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                A journey of growth and public service
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The timeline is shaped by the handbook history section and the
                published university quick facts.
              </p>
            </aside>
            <HistoryTimeline milestones={milestones} />
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <div className="max-w-4xl">
              <SectionKicker>Handbook highlights</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                The institutional story behind the dates
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The handbook frames Kisii University as a public chartered
                institution committed to quality education, research, extension
                services, regional development and service to humanity.
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {HANDBOOK_INSIGHTS.map((item) => (
                <HandbookInsightCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-12 text-white sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <div>
              <SectionKicker>Academic expansion</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold">
                Programmes developed for professional and regional needs
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/76">
                The handbook records continued development of academic
                programmes under Senate and Commission for University Education
                guidelines, with professional accreditation supporting quality
                and continuity.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {PROGRAMME_FIELDS.map((field) => (
                <AcademicFieldPill key={field} label={field} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="grid max-w-none lg:grid-cols-2">
            <div className="min-h-[420px]">
              <PublicImage
                src={HISTORY_IMAGES[1]}
                alt="Kisii University learning spaces"
                ratio="fill"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full rounded-none"
                imageClassName="object-[center_58%]"
              />
            </div>
            <div className="flex items-center px-4 py-10 sm:px-6 lg:px-12">
              <div className="max-w-2xl">
                <SectionKicker>Main Campus</SectionKicker>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                  A scenic setting for study, research and community engagement
                </h2>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {overview?.physical_address
                    ? `The Main Campus is located at ${overview.physical_address}.`
                    : "The Main Campus location is published through the university profile."}{" "}
                  The handbook describes a setting close to Kisii Town Centre,
                  supported by satellite campuses that bring education and
                  research closer to communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        <HistoryCtaBand />
      </AboutPageLenis>
    </PageShell>
  );
}
