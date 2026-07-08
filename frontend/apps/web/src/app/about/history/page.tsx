import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  FileText,
  History,
  Landmark,
  MapPinned,
  ScrollText,
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
};

const HERO_IMAGE = "/images/about/about-history-hero-branded.webp";

function factValue(facts: Fact[], patterns: RegExp[]) {
  return facts.find((fact) =>
    patterns.some(
      (pattern) => pattern.test(fact.label) || pattern.test(fact.value),
    ),
  )?.value;
}

function yearFromText(value: string) {
  return value.match(/\b(?:19|20)\d{2}\b/)?.[0];
}

function sentenceForYear(summary: string | null | undefined, year: string) {
  return summary
    ?.split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .find((sentence) => sentence.includes(year));
}

function milestoneTitle(label: string) {
  return label
    .replace(/\b(year|date)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHistoryMilestones(
  summary: string | null | undefined,
  facts: Fact[],
) {
  const milestones = new Map<string, Milestone>();

  facts.forEach((fact) => {
    const year = yearFromText(fact.value);
    if (!year) return;
    milestones.set(year, {
      year,
      title: milestoneTitle(fact.label) || "Published milestone",
      detail:
        sentenceForYear(summary, year) ??
        `${fact.label}: ${fact.value}.`,
    });
  });

  summary?.match(/\b(?:19|20)\d{2}\b/g)?.forEach((year) => {
    if (milestones.has(year)) return;
    milestones.set(year, {
      year,
      title: "Published milestone",
      detail: sentenceForYear(summary, year) ?? summary,
    });
  });

  return Array.from(milestones.values()).sort(
    (first, second) => Number(first.year) - Number(second.year),
  );
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
          ? "rounded-md border border-dashed border-white/20 bg-white/[0.04] p-4 text-sm leading-6 text-white/60"
          : "rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500"
      }
    >
      {label} has not been published yet.
    </p>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
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
  const priorityFacts = [
    foundingYear ? { label: "Established", value: foundingYear } : null,
    factValue(facts, [/egerton/i])
      ? { label: "Egerton Campus", value: factValue(facts, [/egerton/i])! }
      : null,
    factValue(facts, [/first degree/i])
      ? { label: "First Degree", value: factValue(facts, [/first degree/i])! }
      : null,
    charterYear ? { label: "Chartered", value: charterYear } : null,
  ].filter((item): item is Fact => Boolean(item));

  const displayFacts = priorityFacts.length ? priorityFacts : facts.slice(0, 6);

  return (
    <aside className="h-full bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="max-w-none">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-secondary">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <SectionLabel>At a glance</SectionLabel>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Published quick facts
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {displayFacts.length ? (
            displayFacts.map((fact) => (
              <div
                key={`${fact.label}-${fact.value}`}
                className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/55">
                  {fact.label}
                </span>
                <span className="text-right text-base font-bold text-white">
                  {fact.value}
                </span>
              </div>
            ))
          ) : (
            <EmptyBlock label="Quick facts" inverse />
          )}
        </div>
      </div>
    </aside>
  );
}

function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="grid gap-0 border-y border-slate-200 bg-white md:grid-cols-2 xl:grid-cols-3">
      {milestones.length ? (
        milestones.map((milestone) => (
          <article
            key={milestone.year}
            className="min-h-44 border-b border-slate-200 p-5 md:border-r xl:p-6"
          >
            <p className="text-4xl font-bold leading-none text-primary">
              {milestone.year}
            </p>
            <h3 className="mt-4 text-base font-bold text-slate-950">
              {milestone.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {milestone.detail}
            </p>
          </article>
        ))
      ) : (
        <div className="p-5 xl:p-6">
          <EmptyBlock label="History milestones" />
        </div>
      )}
    </div>
  );
}

function ContextLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group grid min-h-28 grid-cols-[minmax(0,1fr)_24px] items-center gap-4 border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:bg-primary/[0.02]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-950">{title}</span>
        <span className="mt-2 block text-xs leading-5 text-slate-600">
          {body}
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="h-4 w-4 justify-self-end text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

export default async function AboutHistoryPage() {
  const overview = await getOverviewData();
  const facts = normalizeQuickFacts(overview?.quick_facts);
  const foundingYear =
    overview?.founding_year?.toString() ??
    factValue(facts, [/founding/i, /established/i]);
  const charterYear = factValue(facts, [/charter year/i, /charter/i]);
  const milestones = buildHistoryMilestones(overview?.history_summary, facts);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-none px-4 py-6 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "History" },
              ]}
            />
          </div>

          <div className="grid max-w-none lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="grid min-h-[560px] lg:grid-cols-[minmax(0,0.84fr)_minmax(360px,0.56fr)]">
              <div className="flex items-end bg-primary px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-secondary">
                      <History aria-hidden className="h-6 w-6" />
                    </span>
                    <SectionLabel>History</SectionLabel>
                  </div>
                  <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                    Institutional history
                  </h1>
                  {overview?.history_summary ? (
                    <p className="mt-6 max-w-3xl text-base leading-8 text-white/82">
                      {overview.history_summary}
                    </p>
                  ) : (
                    <div className="mt-6 max-w-xl">
                      <EmptyBlock label="History summary" inverse />
                    </div>
                  )}
                </div>
              </div>

              <div className="min-h-[360px]">
                <PublicImage
                  src={HERO_IMAGE}
                  alt="Kisii University historical campus view"
                  ratio="fill"
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="h-full rounded-none"
                />
              </div>
            </div>

            <AtAGlancePanel
              facts={facts}
              foundingYear={foundingYear}
              charterYear={charterYear}
            />
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="grid max-w-none lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-white px-4 py-7 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
              <ScrollText aria-hidden className="h-6 w-6 text-primary" />
              <SectionLabel>Milestones</SectionLabel>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                From college roots to chartered university
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The timeline presents the handbook-backed years published in the
                university record and its quick facts.
              </p>
            </aside>
            <HistoryTimeline milestones={milestones} />
          </div>
        </section>

        <section className="bg-white">
          <div className="grid max-w-none border-t border-slate-200 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
            <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <FileText aria-hidden className="h-6 w-6 text-primary" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">
                Source of this page
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This page renders the published university information record:
                history summary, founding year, and quick facts.
              </p>
            </div>
            <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <Landmark aria-hidden className="h-6 w-6 text-primary" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">
                Institutional context
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                History is shown alongside governance, management, and quality
                assurance so the public record stays easy to scan.
              </p>
            </div>
            <div className="p-5 sm:p-6 lg:p-8">
              <MapPinned aria-hidden className="h-6 w-6 text-primary" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">
                Main campus
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {overview?.physical_address ??
                  "Campus location details have not been published yet."}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <div className="flex items-center gap-3">
              <BookOpenText aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-950">
                Related institutional pages
              </h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ContextLink
                title="About Us"
                href="/about"
                body="Read the university overview, mission, vision, and core values."
              />
              <ContextLink
                title="Governance"
                href="/about/governance"
                body="Review the public governance structure and institutional mandate."
              />
              <ContextLink
                title="Quality Assurance"
                href="/about/quality-assurance"
                body="See planning, service charter, and quality assurance resources."
              />
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
