import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Gem,
  GraduationCap,
  Landmark,
  Scale,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getAboutSchools,
  getOverviewData,
  getPhilosophy,
  normalizeQuickFacts,
  splitCoreValues,
} from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";

function EmptyBlock({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </p>
  );
}

function factValue(
  facts: Array<{ label: string; value: string }>,
  patterns: RegExp[],
) {
  return facts.find((fact) =>
    patterns.some((pattern) => pattern.test(fact.label)),
  )?.value;
}

function splitParagraphs(items: Array<string | null | undefined>) {
  return items
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));
}

function SectionHeading({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  return (
    <div>
      <h1
        className={
          compact
            ? "text-lg font-bold leading-tight text-slate-950"
            : "font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
        }
      >
        {title}
      </h1>
      <div className="mt-3 h-0.5 w-12 bg-secondary" />
    </div>
  );
}

function AboutHeroPanel({
  title,
  motto,
  paragraphs,
  imageUrl,
  stats,
}: {
  title: string;
  motto?: string | null;
  paragraphs: string[];
  imageUrl: string;
  stats: Array<{ label: string; value: string; icon: LucideIcon }>;
}) {
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,680px)] lg:items-start">
      <div className="min-w-0 pt-2">
        <SectionHeading title={title} />
        {motto ? (
          <p className="mt-4 text-sm font-semibold text-primary">{motto}</p>
        ) : null}
        {paragraphs.length ? (
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyBlock label="University description" />
          </div>
        )}
        <Link
          href="/about/history"
          className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          Learn more about our journey in <span>History</span>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <PublicImage
          src={imageUrl}
          alt="Kisii University campus"
          ratio="news"
          priority
          sizes="(min-width: 1280px) 680px, (min-width: 1024px) 46vw, 100vw"
          className="rounded-none"
        />
        <div className="grid gap-0 border-t border-slate-200 bg-slate-50/80 sm:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex min-h-24 items-center gap-4 border-slate-200 px-6 py-4 sm:border-l first:sm:border-l-0"
              >
                <Icon aria-hidden className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold leading-none text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
                </div>
                {index < stats.length - 1 ? (
                  <span className="sr-only">,</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function IdentityCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="min-h-[220px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-primary">
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <div className="mt-4">
        <SectionHeading title={title} compact />
      </div>
      <div className="mt-5 text-sm leading-6 text-slate-700">{children}</div>
    </article>
  );
}

function ExploreCard({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group grid min-h-24 grid-cols-[56px_minmax(0,1fr)_24px] items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.02]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-primary">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-950">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">
          {body}
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="h-4 w-4 justify-self-end text-slate-900 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

function SchoolCard({
  name,
  slug,
  summary,
  departments,
}: {
  name: string;
  slug: string;
  summary?: string | null;
  departments?: number;
}) {
  return (
    <Link
      href={`/academics/schools/${slug}`}
      className="group block min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.02]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 transition group-hover:text-primary">
          {name}
        </h3>
        <ArrowRight
          aria-hidden
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
      {summary ? (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">
          {summary}
        </p>
      ) : null}
      {departments ? (
        <p className="mt-4 text-xs font-semibold text-primary">
          {departments} departments
        </p>
      ) : null}
    </Link>
  );
}

export default async function AboutPage() {
  const [overview, schools] = await Promise.all([
    getOverviewData(),
    getAboutSchools(),
  ]);
  const coreValues = splitCoreValues(overview?.core_values);
  const facts = normalizeQuickFacts(overview?.quick_facts);
  const philosophy = getPhilosophy(overview);
  const coverImageUrl =
    publicFileUrl(overview?.cover_image_id) ??
    "/images/backgrounds/about-hero.jpg";
  const title = overview?.name ? `About ${overview.name}` : "About Us";
  const paragraphs = splitParagraphs([
    overview?.overview,
    overview?.history_summary,
    overview?.physical_address
      ? `The Main Campus is located at ${overview.physical_address}, supporting teaching, research, innovation and community service from Kisii County.`
      : null,
  ]);
  const stats = [
    {
      label: "Established",
      value:
        overview?.founding_year?.toString() ??
        factValue(facts, [/founding/i, /established/i]),
      icon: CalendarDays,
    },
    {
      label: "Chartered",
      value: factValue(facts, [/charter year/i, /chartered/i]),
      icon: GraduationCap,
    },
    {
      label: "Schools",
      value: factValue(facts, [/schools/i]),
      icon: Landmark,
    },
  ].filter(
    (item): item is { label: string; value: string; icon: LucideIcon } =>
      Boolean(item.value),
  );

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About Us" },
              ]}
            />
            <AboutHeroPanel
              title={title}
              motto={overview?.motto}
              paragraphs={paragraphs}
              imageUrl={coverImageUrl}
              stats={stats}
            />
          </div>
        </section>

        <section className="bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-0 md:grid-cols-2 xl:grid-cols-4">
            <IdentityCard icon={Target} title="Mission">
              {overview?.mission ? (
                <p>{overview.mission}</p>
              ) : (
                <EmptyBlock label="Mission" />
              )}
            </IdentityCard>

            <IdentityCard icon={Eye} title="Vision">
              {overview?.vision ? (
                <p>{overview.vision}</p>
              ) : (
                <EmptyBlock label="Vision" />
              )}
            </IdentityCard>

            <IdentityCard icon={Gem} title="Core Values">
              {coreValues.length ? (
                <ul className="space-y-2">
                  {coreValues.map((value) => (
                    <li key={value} className="flex gap-2">
                      <CheckCircle2
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyBlock label="Core values" />
              )}
            </IdentityCard>

            <IdentityCard icon={Scale} title="Philosophy">
              {philosophy ? <p>{philosophy}</p> : <EmptyBlock label="Philosophy" />}
            </IdentityCard>
          </div>
        </section>

        <section className="bg-white px-4 pb-7 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <h2 className="text-lg font-bold text-slate-950">
              Explore More About Kisii University
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ExploreCard
                title="History"
                href="/about/history"
                icon={Clock3}
                body="Discover the university journey since 1965 and key milestones."
              />
              <ExploreCard
                title="Governance"
                href="/about/governance"
                icon={UsersRound}
                body="Learn about councils, statutory bodies and public mandates."
              />
              <ExploreCard
                title="Management"
                href="/about/university-management"
                icon={UserRound}
                body="Meet the university leadership and management team."
              />
              <ExploreCard
                title="Quality Assurance"
                href="/about/quality-assurance"
                icon={ShieldCheck}
                body="Review quality, planning and service accountability resources."
              />
            </div>
          </div>
        </section>

        {schools.length ? (
          <section className="border-t border-slate-200 bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
            <div className="max-w-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-primary">Our Schools</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Browse the academic schools published through the university
                    backend.
                  </p>
                </div>
                <Link
                  href="/academics/schools"
                  className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                >
                  View academics
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {schools.map((school) => (
                  <SchoolCard
                    key={school.id}
                    name={school.name}
                    slug={school.slug}
                    summary={school.description ?? school.about}
                    departments={school.departments_count}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </AboutPageLenis>
    </PageShell>
  );
}
