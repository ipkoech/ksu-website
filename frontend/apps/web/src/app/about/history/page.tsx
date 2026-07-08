import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  FileText,
  GraduationCap,
  Landmark,
  PhoneCall,
  School,
  Sparkles,
  Sprout,
  Target,
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

const HISTORY_HERO_IMAGE = "/images/backgrounds/bg-history.jpg";

const INSTITUTIONAL_NOTES = [
  {
    title: "Teacher training foundation",
    body: "The institution opened its story through teacher preparation, serving education needs in the Gusii region before expanding into broader higher education.",
    icon: School,
  },
  {
    title: "University-level growth",
    body: "The Egerton University period created a stronger academic base, new programmes, and the pathway toward constituent college status.",
    icon: Landmark,
  },
  {
    title: "Public university mandate",
    body: "The charter marked a new phase of academic authority, institutional stewardship, research, outreach, and service to national development.",
    icon: BookOpenCheck,
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

function strategicGoals(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return [];
  const goals = (value as { strategic_goals?: unknown }).strategic_goals;
  return Array.isArray(goals)
    ? goals.filter((goal): goal is string => typeof goal === "string")
    : [];
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-500">
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

function ScrollRevealSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  return (
    <section
      className={`${className} motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-700`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
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
      ? {
          label: "Main campus land",
          value: `${factValue(facts, [/land acres/i])} acres`,
        }
      : null,
    factValue(facts, [/egerton/i])
      ? { label: "Egerton campus", value: factValue(facts, [/egerton/i])! }
      : null,
    charterYear ? { label: "Charter granted", value: charterYear } : null,
  ].filter((item): item is Fact => Boolean(item));

  return (
    <aside className="border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
          <CalendarDays aria-hidden className="h-5 w-5" />
        </span>
        <SectionKicker>Kisii University at a glance</SectionKicker>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {quickStats.length ? (
          quickStats.map((fact) => (
            <div
              key={fact.label}
              className="group border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3"
            >
              <p className="text-2xl font-semibold leading-none text-primary">
                {fact.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {fact.label}
              </p>
            </div>
          ))
        ) : (
          <EmptyBlock label="Quick facts" />
        )}
      </div>
    </aside>
  );
}

function InteractiveMilestoneCard({
  milestone,
  index,
}: {
  milestone: Milestone;
  index: number;
}) {
  const Icon = milestone.icon;
  const isEven = index % 2 === 0;

  return (
    <article className="group relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] lg:items-center">
      <div className={isEven ? "lg:col-start-1" : "lg:col-start-3"}>
        <div
          className="relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-slate-200/70 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-secondary transition duration-300 group-hover:h-2"
          />
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-white transition duration-300 group-hover:bg-secondary group-hover:text-slate-950">
              <Icon aria-hidden className="h-6 w-6" />
            </span>
            <div>
              <p className="text-3xl font-bold leading-none text-primary">
                {milestone.year}
              </p>
              <h3 className="mt-3 text-lg font-bold text-slate-950">
                {milestone.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {milestone.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden h-full lg:col-start-2 lg:block">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/20" />
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-secondary bg-white text-sm font-bold text-primary shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
          {index + 1}
        </span>
      </div>
    </article>
  );
}

function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative p-4 sm:p-6 lg:p-8">
      {milestones.length ? (
        <div className="space-y-5 lg:space-y-0">
          {milestones.map((milestone, index) => (
            <InteractiveMilestoneCard
              key={`${milestone.year}-${milestone.title}`}
              milestone={milestone}
              index={index}
            />
          ))}
        </div>
      ) : (
        <EmptyBlock label="History milestones" />
      )}
    </div>
  );
}

function InstitutionalNoteCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="group border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/70">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function StrategicDirectionCard({
  goal,
  index,
}: {
  goal: string;
  index: number;
}) {
  return (
    <article className="group flex gap-4 border border-white/15 bg-white/[0.08] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-slate-950">
        {index + 1}
      </span>
      <p className="text-sm font-semibold leading-6 text-white">{goal}</p>
    </article>
  );
}

function AcademicFieldPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary">
      {label}
    </span>
  );
}

function HistoryCtaBand() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="grid max-w-none gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
  const goals = strategicGoals(overview?.strategic_priorities);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="overflow-hidden bg-white">
          <div className="max-w-none px-4 py-5 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "History" },
              ]}
            />
          </div>

          <div className="grid max-w-none gap-0 border-y border-slate-200 lg:grid-cols-[minmax(0,1fr)_430px]">
            <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.68fr)]">
              <div className="flex items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
                  <SectionKicker>History of Kisii University</SectionKicker>
                  <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
                    From teacher training roots to chartered public university
                  </h1>
                  {overview?.history_summary ? (
                    <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
                      {overview.history_summary}
                    </p>
                  ) : (
                    <div className="mt-6 max-w-xl">
                      <EmptyBlock label="History summary" />
                    </div>
                  )}
                </div>
              </div>

              <div className="min-h-[280px] lg:min-h-[360px]">
                <PublicImage
                  src={HISTORY_HERO_IMAGE}
                  alt="Historic Kisii University campus building"
                  ratio="fill"
                  priority
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="h-full rounded-none"
                  imageClassName="object-cover"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <AtAGlancePanel
                facts={facts}
                foundingYear={foundingYear}
                charterYear={charterYear}
              />
            </div>
          </div>
        </section>

        <ScrollRevealSection className="bg-white">
          <div className="grid max-w-none lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 px-4 py-8 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
              <div className="sticky top-24">
              <CalendarDays aria-hidden className="h-6 w-6 text-primary" />
              <SectionKicker>Milestones</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                Growth through public service
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Key dates are drawn from the university profile and published
                institutional facts, then presented as a connected journey.
              </p>
              </div>
            </aside>
            <HistoryTimeline milestones={milestones} />
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection
          className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
          delay={80}
        >
          <div className="grid max-w-none gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="sticky top-24 self-start">
              <SectionKicker>Institutional story</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                The journey behind the dates
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Kisii University has grown from a teacher training institution
                into a public university with teaching, research, innovation,
                extension, and community service responsibilities.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {INSTITUTIONAL_NOTES.map((item) => (
                <InstitutionalNoteCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection
          className="bg-primary px-4 py-12 text-white sm:px-6 lg:px-8"
          delay={120}
        >
          <div className="grid max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <div className="sticky top-24 self-start">
              <Target aria-hidden className="h-6 w-6 text-secondary" />
              <SectionKicker>Strategic direction</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold">
                Priorities guiding the next chapter
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/76">
                The university's current direction connects quality education,
                knowledge generation, partnerships, infrastructure, financial
                sustainability, and a defined research niche.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.length ? (
                goals.map((goal, index) => (
                  <StrategicDirectionCard
                    key={goal}
                    goal={goal}
                    index={index}
                  />
                ))
              ) : (
                <p className="rounded-md border border-dashed border-white/20 bg-white/[0.06] p-4 text-sm leading-6 text-white/70">
                  Strategic goals have not been published yet.
                </p>
              )}
            </div>
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection
          className="bg-white px-4 py-12 sm:px-6 lg:px-8"
          delay={160}
        >
          <div className="grid max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <div className="sticky top-24 self-start">
              <FileText aria-hidden className="h-6 w-6 text-primary" />
              <SectionKicker>Academic expansion</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                Programmes shaped by professional and regional needs
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Academic growth has expanded the university's reach across
                sciences, technology, business, education, law, agriculture,
                arts, social sciences, and health-related disciplines.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {PROGRAMME_FIELDS.map((field) => (
                <AcademicFieldPill key={field} label={field} />
              ))}
            </div>
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection
          className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
          delay={200}
        >
          <div className="grid max-w-none gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center">
            <div>
              <SectionKicker>Main Campus</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                A setting for study, research and community engagement
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-600 lg:max-w-4xl">
              {overview?.physical_address
                ? `The Main Campus is located at ${overview.physical_address}.`
                : "The Main Campus location is published through the university profile."}{" "}
              The campus environment supports teaching, learning, research,
              innovation, outreach, and public service across the university's
              academic and administrative units.
            </p>
          </div>
        </ScrollRevealSection>

        <HistoryCtaBand />
      </AboutPageLenis>
    </PageShell>
  );
}
