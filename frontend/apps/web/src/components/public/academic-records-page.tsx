import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Download,
  FileText,
  Search,
  ExternalLink,
  ContactRound,
  ShieldCheck,
} from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import type {
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import { PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { AboutReveal } from "@/components/about/about-reveal";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import { PublicListFilterForm } from "@/components/public/list-filter-form";
import { PublicImage } from "@/components/public/public-image";

type AcademicRecordsKind =
  | "schools"
  | "departments"
  | "programmes"
  | "calendar"
  | "examinations";

function sectionFor(config: PublicPageConfig): PublicPageSection {
  return (
    config.sections[0] ?? {
      eyebrow: "Academic records",
      title: config.title,
      body: config.body,
      cards: [],
    }
  );
}

function RecordLink({
  title,
  body,
  href,
  eyebrow,
}: {
  title: string;
  body: string;
  href?: string;
  eyebrow?: string;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {body}
        </p>
      </div>
      {href ? (
        <ArrowRight
          className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="group flex gap-5 border-b border-border py-5 first:border-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {content}
    </Link>
  ) : (
    <div className="flex gap-5 border-b border-border py-5 first:border-t">
      {content}
    </div>
  );
}

function _Records({
  kind,
  section,
}: {
  kind: AcademicRecordsKind;
  section: PublicPageSection;
}) {
  if (kind === "calendar") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {section.cards.map((card) => {
          const content = (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                <CalendarDays className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
                  {card.eyebrow ?? "Academic date"}
                </span>
                <span className="mt-1 block font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                  {card.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {card.body}
                </span>
              </span>
              {card.href ? (
                <ArrowRight
                  className="h-5 w-5 text-primary transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden
                />
              ) : null}
            </>
          );
          return card.href ? (
            <Link
              key={card.title}
              href={card.href}
              className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              {content}
            </Link>
          ) : (
            <article
              key={card.title}
              className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:items-center"
            >
              {content}
            </article>
          );
        })}
      </div>
    );
  }

  if (kind === "examinations") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {section.cards.map((card) => (
          <Link
            key={card.title}
            href={card.href ?? "#"}
            className="group flex items-start gap-4 py-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {card.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {card.body}
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Open document{" "}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        kind === "schools"
          ? "grid gap-x-8 md:grid-cols-2"
          : kind === "programmes"
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "divide-y divide-border border-y border-border"
      }
    >
      {section.cards.map((card, index) => (
        <RecordLink
          key={card.title}
          title={card.title}
          body={card.body}
          href={card.href}
          eyebrow={
            card.eyebrow ??
            (kind === "schools"
              ? `School ${String(index + 1).padStart(2, "0")}`
              : undefined)
          }
        />
      ))}
    </div>
  );
}

const heroContent: Record<
  AcademicRecordsKind,
  { title: string; image: string; cta: { href: string; label: string } }
> = {
  schools: {
    title: "Schools that shape possibility",
    image: "/images/about-us/gate-1.jpg",
    cta: { href: "/academics/programmes", label: "Browse programmes" },
  },
  departments: {
    title: "The communities behind every discipline",
    image: "/images/about-us/ict-village-1.jpg",
    cta: { href: "/academics/programmes", label: "Browse programmes" },
  },
  programmes: {
    title: "Find your direction",
    image: "/images/about-us/law-4.jpg",
    cta: { href: "/admissions", label: "Explore admissions" },
  },
  calendar: {
    title: "Plan your academic year",
    image: "/images/about-us/pathway-3.jpg",
    cta: { href: "/academics/examinations", label: "Examination resources" },
  },
  examinations: {
    title: "Prepare with confidence",
    image: "/images/about-us/science-complex-3.jpg",
    cta: { href: "/academics/calendar", label: "Academic calendar" },
  },
};

function AcademicHero({
  config,
  kind,
}: {
  config: PublicPageConfig;
  kind: AcademicRecordsKind;
}) {
  const hero = heroContent[kind];

  return (
    <section className="relative isolate min-h-[430px] overflow-hidden bg-primary text-white">
      <Image
        src={hero.image}
        alt={config.title}
        fill
        priority
        sizes="100vw"
        className="object-cover motion-safe:animate-ken-burns"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,28,68,.97)_0%,rgba(4,38,83,.84)_44%,rgba(4,38,83,.18)_82%)]" />
      <div className="relative mx-auto flex min-h-[430px] w-full max-w-[1680px] flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-semibold text-white/70"
        >
          {config.breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span className="mx-2" aria-hidden>
                  /
                </span>
              ) : null}
              {item.href && index < config.breadcrumb.length - 1 ? (
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mt-8 ksu-mt-compact max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
            {config.eyebrow}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-[3.6rem]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
            {config.body}
          </p>
          <Link
            href={hero.cta.href}
            className="mt-7 inline-flex min-h-12 items-center gap-2 bg-secondary px-5 py-3 text-sm font-bold uppercase text-foreground transition hover:bg-amber-400"
          >
            {hero.cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SchoolsEditorial({ section }: { section: PublicPageSection }) {
  return (
    <>
      <section className="border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic structure
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Where disciplines become <em className="italic">communities.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Our schools bring related disciplines together, creating focused
              communities for teaching, professional practice, research and
              collaboration.
            </p>
            <Link
              href="/academics/programmes"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Browse all programmes{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </AboutReveal>
          <ImageCurtainReveal
            className="min-h-[330px] overflow-hidden rounded-3xl ring-1 ring-primary/10 sm:min-h-[420px]"
            direction="right"
          >
            <PublicImage
              src="/images/backgrounds/KSUGreenLandscapingMay2026-9664.jpg"
              alt="Academic buildings and landscaped grounds at Kisii University"
              ratio="fill"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full w-full"
              imageClassName="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.03]"
            />
          </ImageCurtainReveal>
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-12 sm:px-8 lg:px-16 xl:px-20">
        <AboutReveal className="mx-auto w-full max-w-7xl">
          {section.filters ? (
            <PublicListFilterForm
              className="rounded-3xl bg-white p-5 ring-1 ring-primary/10 sm:p-7"
              searchName={section.filters.queryName ?? "q"}
              searchValue={section.filters.query}
              searchPlaceholder="Search by school or discipline"
              searchLabel="Search schools and faculties"
              selects={[]}
              clearHref={section.filters.clearHref}
              total={section.cards.length}
              visible={section.cards.length}
            />
          ) : null}
        </AboutReveal>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="border-b border-primary/15 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Schools & faculties
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary">
              Explore our academic <em className="italic">communities.</em>
            </h2>
          </div>
          <div className="mt-8 space-y-10">
            {section.cards.map((card, index) => {
              const meta = card.metadata ?? {};
              const featured = Boolean(card.image) && index % 3 === 0;
              return (
                <AboutReveal key={card.title} delay={index % 2 ? 100 : 0}>
                  <article
                    className={
                      featured
                        ? "grid overflow-hidden rounded-3xl ring-1 ring-primary/10 lg:grid-cols-[1.05fr_1.2fr]"
                        : "grid gap-6 border-b border-primary/15 pb-10 lg:grid-cols-[10rem_1fr_1.1fr_auto] lg:items-start"
                    }
                  >
                    {featured ? (
                      <div className="relative min-h-[310px] bg-primary/5 lg:min-h-[390px]">
                        <PublicImage
                          src={card.image}
                          alt={`${card.title} at Kisii University`}
                          ratio="fill"
                          className="absolute inset-0 h-full w-full"
                          imageClassName="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.03]"
                          sizes="(min-width: 1024px) 46vw, 100vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 lg:block">
                        <span className="font-[family-name:var(--font-display)] text-3xl font-normal text-secondary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground lg:mt-3">
                          {meta.type ?? "Academic school"}
                        </p>
                      </div>
                    )}
                    <div
                      className={
                        featured
                          ? "flex flex-col justify-center p-7 sm:p-9 lg:p-10"
                          : ""
                      }
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                        {meta.type ?? "Academic school"}
                        {meta.code ? ` · ${meta.code}` : ""}
                      </p>
                      <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
                        {card.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {card.body}
                      </p>
                      {featured ? (
                        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-t border-primary/10 pt-5 text-sm">
                          {meta.dean ? (
                            <span>
                              <strong className="font-bold text-primary">
                                Dean
                              </strong>{" "}
                              · {meta.dean}
                            </span>
                          ) : null}
                          {meta.departments ? (
                            <span>
                              <strong className="font-bold text-primary">
                                Structure
                              </strong>{" "}
                              · {meta.departments}
                            </span>
                          ) : null}
                          {meta.location ? (
                            <span>
                              <strong className="font-bold text-primary">
                                Location
                              </strong>{" "}
                              · {meta.location}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {featured ? (
                        <Link
                          href={card.href ?? "/academics/schools"}
                          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                          Explore school{" "}
                          <ArrowRight aria-hidden className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                    {!featured ? (
                      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
                        {meta.dean ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Dean
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.dean}
                            </dd>
                          </div>
                        ) : null}
                        {meta.departments ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Academic structure
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.departments}
                            </dd>
                          </div>
                        ) : null}
                        {meta.location ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Location
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.location}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}
                    {!featured ? (
                      <Link
                        href={card.href ?? "/academics/schools"}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
                      >
                        Explore school{" "}
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </article>
                </AboutReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Interdisciplinary learning
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              Connected across <em className="italic">disciplines.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Schools give every discipline a home while opening opportunities
              to learn, investigate and collaborate across the university.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/academics/programmes"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Explore programmes <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/research"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
            >
              Discover research <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Continue exploring academics"
        className="border-b border-primary/10 bg-white px-5 sm:px-8 lg:px-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Departments", "/academics/departments"],
            ["Programmes", "/academics/programmes"],
            ["Academic calendar", "/academics/calendar"],
            ["Admissions", "/admissions"],
          ].map(([title, href], index) => (
            <Link
              key={href}
              href={href}
              className={`group flex min-h-24 items-center justify-between gap-4 py-6 sm:px-5 ${index ? "sm:border-l sm:border-primary/10" : ""}`}
            >
              <span className="font-[family-name:var(--font-display)] text-lg font-normal text-primary">
                {title}
              </span>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 text-secondary transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function ProgrammeFinder({
  section,
  page,
  pageHref,
  hasNextPage,
}: {
  section: PublicPageSection;
  page: number;
  pageHref: (page: number) => string;
  hasNextPage: boolean;
}) {
  const resultCount = section.cards.length;
  const pagination = section.pagination;
  const total = pagination?.total ?? resultCount;
  const firstResult = resultCount
    ? (page - 1) * (pagination?.perPage ?? 12) + 1
    : 0;
  const lastResult = resultCount ? firstResult + resultCount - 1 : 0;

  return (
    <section className="bg-white px-5 py-7 sm:px-8 lg:px-16 lg:py-10 xl:px-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary/15 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Published catalogue
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary sm:text-3xl">
              {resultCount
                ? `${total} programme${total === 1 ? "" : "s"}`
                : "No matching programmes"}
            </h2>
          </div>
          {resultCount ? (
            <span className="text-sm text-muted-foreground">
              Showing {firstResult}–{lastResult} of {total}
            </span>
          ) : null}
        </div>

        <ul className="divide-y divide-primary/10 border-b border-primary/10">
          {section.cards.map((card, index) => {
            const meta = card.metadata ?? {};
            const intakes = Array.isArray(meta.intakeMonths)
              ? meta.intakeMonths.join(", ")
              : meta.intakeMonths;
            const previewId = `programme-preview-${page}-${index}`;
            return (
              <li key={`${card.title}-${index}`} className="group relative">
                <Link
                  href={card.href ?? "/academics/programmes"}
                  aria-describedby={previewId}
                  className="grid min-h-16 items-center gap-x-5 gap-y-1 py-3 pr-2 transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none sm:grid-cols-[minmax(0,2fr)_minmax(7rem,.6fr)_minmax(7rem,.7fr)_auto] sm:px-4"
                >
                  <span className="min-w-0">
                    <span className="block font-[family-name:var(--font-display)] text-lg leading-tight text-primary group-hover:text-secondary">
                      {card.title}
                    </span>
                    {meta.code ? (
                      <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                        {meta.code}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {meta.level ?? "Programme"}
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    {meta.duration ?? meta.mode ?? "View details"}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 text-secondary transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <aside
                  id={previewId}
                  role="tooltip"
                  className="pointer-events-none invisible absolute right-10 top-[calc(100%-0.25rem)] z-30 hidden w-[min(24rem,calc(100vw-3rem))] translate-y-2 overflow-hidden rounded-2xl bg-primary text-white opacity-0 shadow-2xl ring-1 ring-white/10 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:block"
                >
                  {card.image ? (
                    <PublicImage
                      src={card.image}
                      alt=""
                      ratio="news"
                      className="bg-white/5"
                      imageClassName="object-cover"
                      sizes="384px"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-secondary">
                      {meta.level ?? "Academic programme"}
                      {meta.department ? ` · ${meta.department}` : ""}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-xl leading-tight">
                      {card.title}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/75">
                      {meta.overview ?? card.body}
                    </p>
                    <p className="mt-4 text-xs text-white/65">
                      {[
                        meta.duration,
                        meta.mode,
                        intakes ? `Intakes: ${intakes}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </aside>
              </li>
            );
          })}
        </ul>

        <nav
          className="mt-10 flex items-center justify-between border-y border-primary/15 py-5 text-sm"
          aria-label="Programme catalogue pages"
        >
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="inline-flex min-h-11 items-center font-bold text-primary hover:underline"
            >
              ← Previous page
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page}
            {pagination?.pages ? ` of ${pagination.pages}` : ""}
          </span>
          {hasNextPage ? (
            <Link
              href={pageHref(page + 1)}
              className="inline-flex min-h-11 items-center font-bold text-primary hover:underline"
            >
              Next page →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </section>
  );
}

function ProgrammeHeroSearch({ section }: { section: PublicPageSection }) {
  const filters = section.filters;
  if (!filters) return null;

  return (
    <PublicListFilterForm
      className="max-w-5xl rounded-xl bg-white/95 p-3 text-foreground shadow-xl backdrop-blur-sm ring-1 ring-white/30"
      searchName={filters.queryName ?? "q"}
      searchValue={filters.query}
      searchPlaceholder="Search by programme name, subject or keyword"
      searchLabel="Search programmes"
      selects={[
        ...(filters.levelOptions
          ? [
              {
                name: "level",
                label: "Level",
                value: filters.level,
                allLabel: "All levels",
                options: filters.levelOptions,
              },
            ]
          : []),
        ...(filters.schoolOptions
          ? [
              {
                name: "school_id",
                label: "School",
                value: filters.schoolId,
                allLabel: "All schools",
                options: filters.schoolOptions,
              },
            ]
          : []),
        ...(filters.modeOptions
          ? [
              {
                name: "mode_of_study",
                label: "Study mode",
                value: filters.mode,
                allLabel: "All modes",
                options: filters.modeOptions,
              },
            ]
          : []),
        ...(filters.sortOptions
          ? [
              {
                name: "sort",
                label: "Sort",
                value: filters.sort,
                allLabel: "Recommended",
                options: filters.sortOptions,
              },
            ]
          : []),
      ]}
      clearHref={filters.clearHref}
      total={section.pagination?.total ?? section.cards.length}
      visible={section.cards.length}
    />
  );
}

function DepartmentsDirectory({ section }: { section: PublicPageSection }) {
  const groups = new Map<string, typeof section.cards>();
  for (const card of section.cards) {
    const school =
      typeof card.metadata?.school === "string"
        ? card.metadata.school
        : "Other academic departments";
    groups.set(school, [...(groups.get(school) ?? []), card]);
  }

  return (
    <>
      <section className="border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic departments
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Teaching, scholarship and expertise in{" "}
              <em className="italic">community.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Departments are the academic homes where staff expertise,
              programme delivery and disciplinary inquiry come together.
            </p>
          </AboutReveal>
          <ImageCurtainReveal
            direction="right"
            className="min-h-[330px] overflow-hidden rounded-3xl ring-1 ring-primary/10 sm:min-h-[420px]"
          >
            <PublicImage
              src="/images/about-us/ict-village-1.jpg"
              alt="Students and staff in an academic setting at Kisii University"
              ratio="fill"
              className="h-full w-full"
              imageClassName="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.03]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </ImageCurtainReveal>
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-12 sm:px-8 lg:px-16 xl:px-20">
        <AboutReveal className="mx-auto w-full max-w-7xl">
          {section.filters ? (
            <PublicListFilterForm
              className="rounded-3xl bg-white p-5 ring-1 ring-primary/10 sm:p-7"
              searchName={section.filters.queryName ?? "q"}
              searchValue={section.filters.query}
              searchPlaceholder="Search by department or discipline"
              searchLabel="Search departments"
              selects={
                section.filters.schoolOptions
                  ? [
                      {
                        name: "school_id",
                        label: "School",
                        value: section.filters.schoolId,
                        allLabel: "All schools",
                        options: section.filters.schoolOptions,
                      },
                    ]
                  : []
              }
              clearHref={section.filters.clearHref}
              total={section.cards.length}
              visible={section.cards.length}
            />
          ) : null}
        </AboutReveal>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto w-full max-w-7xl space-y-16">
          {[...groups.entries()].map(([school, cards], groupIndex) => (
            <AboutReveal key={school} delay={groupIndex % 2 ? 100 : 0}>
              <div className="flex items-end gap-5 border-b border-primary/15 pb-5">
                <span className="h-1 w-12 bg-secondary" aria-hidden />
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Academic school
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">
                    {school}
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-primary/10">
                {cards.map((card) => {
                  const meta = card.metadata ?? {};
                  return (
                    <article
                      key={card.title}
                      className="grid gap-5 py-7 lg:grid-cols-[5rem_1.05fr_1fr_auto] lg:items-start"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-primary/20 text-primary">
                        <Building2 aria-hidden className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                          {meta.code
                            ? `Department ${meta.code}`
                            : "Academic department"}
                        </p>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {card.body}
                        </p>
                      </div>
                      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
                        {meta.head ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Head of department
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.head}
                            </dd>
                          </div>
                        ) : null}
                        {meta.programmes ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Programmes
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.programmes}
                            </dd>
                          </div>
                        ) : null}
                        {meta.email ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Contact
                            </dt>
                            <dd className="mt-1 break-all text-foreground">
                              {meta.email}
                            </dd>
                          </div>
                        ) : null}
                        {meta.location ? (
                          <div>
                            <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Office
                            </dt>
                            <dd className="mt-1 text-foreground">
                              {meta.location}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                      <Link
                        href={card.href ?? "/academics/departments"}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
                      >
                        View department{" "}
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </AboutReveal>
          ))}
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Academic expertise
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
              Expertise that moves knowledge{" "}
              <em className="italic">forward.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Meet the people, programmes and research communities advancing
              knowledge within and across disciplines.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/academics/programmes"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Explore programmes <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/research"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
            >
              Discover research <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function calendarDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function CalendarEditorial({
  section,
  config,
}: {
  section: PublicPageSection;
  config: PublicPageConfig;
}) {
  const selected = config.scopeCards?.[0];
  const meta = selected?.metadata ?? {};
  const calendarCards = section.cards.filter(
    (card) => card.metadata?.academicYear,
  );
  const documentCards = section.cards.filter(
    (card) => card.eyebrow === "Official document",
  );
  let normalizedEvents: Array<Record<string, unknown>> = [];
  try {
    normalizedEvents =
      typeof meta.normalizedEvents === "string"
        ? JSON.parse(meta.normalizedEvents)
        : [];
  } catch {
    normalizedEvents = [];
  }
  const milestones = [
    {
      type: "Registration",
      title: "Registration period",
      start: meta.registrationStart,
      end: meta.registrationEnd,
    },
    {
      type: "Registration",
      title: "Late registration deadline",
      start: meta.lateRegistrationEnd,
    },
    {
      type: "Teaching",
      title: "Teaching period",
      start: meta.teachingStart,
      end: meta.teachingEnd,
    },
    {
      type: "Examination",
      title: "Examination period",
      start: meta.examStart,
      end: meta.examEnd,
    },
    {
      type: "Results",
      title: "Expected results release",
      start: meta.resultsRelease,
    },
    ...normalizedEvents.map((event) => ({
      type: String(event.event_type ?? "University event"),
      title: String(event.title ?? "Academic event"),
      start: typeof event.start_date === "string" ? event.start_date : null,
      end: typeof event.end_date === "string" ? event.end_date : null,
      description:
        typeof event.description === "string" ? event.description : null,
      location: typeof event.location === "string" ? event.location : null,
    })),
  ].filter((item) => item.start);
  milestones.sort((a, b) => String(a.start).localeCompare(String(b.start)));

  return (
    <>
      <section className="border-b border-primary/10 bg-surface-subtle px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <AboutReveal>
            <form
              method="GET"
              className="grid gap-5 rounded-3xl bg-white p-6 ring-1 ring-primary/10 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Academic year
                <select
                  name="academic_year"
                  defaultValue={String(meta.academicYear ?? "")}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
                >
                  <option value="">Current academic year</option>
                  {[
                    ...new Set(
                      calendarCards.map((card) =>
                        String(card.metadata?.academicYear ?? ""),
                      ),
                    ),
                  ]
                    .filter(Boolean)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Semester
                <select
                  name="semester"
                  defaultValue={String(meta.semester ?? "")}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
                >
                  <option value="">Current semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-xs font-bold uppercase tracking-wide text-white"
              >
                View calendar <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </form>
          </AboutReveal>
        </div>
      </section>

      {selected ? (
        <section className="border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <AboutReveal>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {meta.status === "current"
                      ? "Current semester"
                      : "Published semester"}
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
                    {selected.title}
                  </h2>
                </div>
                {documentCards[0]?.href ? (
                  <Link
                    href={documentCards[0].href}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    Download calendar{" "}
                    <Download aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              <dl className="mt-10 grid border-y border-primary/15 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Semester begins", meta.startDate],
                  ["Semester ends", meta.endDate],
                  [
                    "Registration",
                    meta.registrationStart && meta.registrationEnd
                      ? `${calendarDate(String(meta.registrationStart))} – ${calendarDate(String(meta.registrationEnd))}`
                      : null,
                  ],
                  ["Teaching begins", meta.teachingStart],
                  ["Examinations begin", meta.examStart],
                ]
                  .filter((item) => item[1])
                  .map(([label, value], index) => (
                    <div
                      key={String(label)}
                      className={`py-5 sm:px-5 ${index ? "sm:border-l sm:border-primary/10" : ""}`}
                    >
                      <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-2 font-[family-name:var(--font-display)] text-lg font-normal tracking-tight text-primary">
                        {String(value).includes("–")
                          ? value
                          : calendarDate(String(value))}
                      </dd>
                    </div>
                  ))}
              </dl>
            </AboutReveal>
          </div>
        </section>
      ) : null}

      <section className="bg-surface-subtle px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_18rem]">
          <AboutReveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Semester timeline
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary">
              Important dates, in <em className="italic">order.</em>
            </h2>
            <div className="mt-9 border-t border-primary/15">
              {milestones.map((item, index) => (
                <article
                  key={`${item.title}-${String(item.start)}-${index}`}
                  className="grid gap-4 border-b border-primary/15 py-6 sm:grid-cols-[9rem_1fr]"
                >
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                      {calendarDate(String(item.start))}
                    </p>
                    {item.end ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        to {calendarDate(String(item.end))}
                      </p>
                    ) : null}
                  </div>
                  <div className="border-l-2 border-secondary pl-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                      {item.type}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                      {item.title}
                    </h3>
                    {"description" in item && item.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    {"location" in item && item.location ? (
                      <p className="mt-2 text-xs font-bold text-foreground">
                        {item.location}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </AboutReveal>
          <AboutReveal variant="right" className="lg:pt-20">
            <aside className="rounded-3xl bg-primary p-6 text-white ring-1 ring-primary/20">
              <CalendarDays aria-hidden className="h-7 w-7 text-secondary" />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight">
                Keep your semester on track.
              </h3>
              <div className="mt-6 border-t border-white/15">
                {[
                  ["Examination timetable", "/academics/examinations"],
                  ["Student portal", "https://portal.kisiiuniversity.ac.ke"],
                  ["Contact the university", "/contact"],
                ].map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-12 items-center justify-between border-b border-white/15 text-sm font-bold text-white/85 hover:text-white"
                  >
                    {label}
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 text-secondary"
                    />
                  </Link>
                ))}
              </div>
            </aside>
          </AboutReveal>
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Publishing assurance
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
            Important dates, <em className="italic">clearly published.</em>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            Calendar updates are reviewed before publication. When an official
            schedule changes, the latest published calendar becomes the public
            reference.
          </p>
        </div>
      </section>

      {documentCards.length ? (
        <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Related documents
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary">
              Official calendar <em className="italic">resources.</em>
            </h2>
            <div className="mt-8 border-t border-primary/15">
              {documentCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href ?? "#"}
                  className="group grid gap-3 border-b border-primary/15 py-5 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center"
                >
                  <span className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                    {card.title}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {card.body}
                  </span>
                  <Download
                    aria-hidden
                    className="h-4 w-4 text-primary transition-transform group-hover:translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ExaminationsEditorial({
  section,
  config,
}: {
  section: PublicPageSection;
  config: PublicPageConfig;
}) {
  const context = config.scopeCards?.[0];
  const meta = context?.metadata ?? {};
  let timetables: Array<Record<string, unknown>> = [];
  try {
    timetables =
      typeof meta.timetableData === "string"
        ? JSON.parse(meta.timetableData)
        : [];
  } catch {
    timetables = [];
  }
  const currentTimetable = timetables[0];
  const timetableRecord =
    currentTimetable &&
    typeof currentTimetable.timetable === "object" &&
    currentTimetable.timetable
      ? (currentTimetable.timetable as Record<string, unknown>)
      : null;
  const sittingCount =
    currentTimetable && Array.isArray(currentTimetable.sittings)
      ? currentTimetable.sittings.length
      : 0;
  const pdfFallback =
    section.cards.find((card) =>
      card.title.toLowerCase().includes("timetable"),
    ) ?? section.cards[0];
  const quickActions = [
    ["Find my timetable", "#current-timetable", CalendarDays],
    ["Examination notices", "#examination-notices", FileText],
    ["Candidate guidelines", "#candidate-guidance", ShieldCheck],
    ["Student portal", "https://portal.kisiiuniversity.ac.ke", ExternalLink],
    ["Contact examinations", "/contact", ContactRound],
  ] as const;
  return (
    <>
      <nav
        aria-label="Examination quick actions"
        className="border-b border-primary/10 bg-white px-5 sm:px-8 lg:px-16 xl:px-20"
      >
        <div className="mx-auto grid w-full max-w-7xl sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map(([label, href, Icon], index) => (
            <Link
              key={label}
              href={href}
              className={`group flex min-h-24 items-center gap-3 py-6 sm:px-5 ${index ? "sm:border-l sm:border-primary/10" : ""}`}
            >
              <Icon aria-hidden className="h-5 w-5 shrink-0 text-secondary" />
              <span className="font-[family-name:var(--font-display)] text-base font-normal text-primary">
                {label}
              </span>
              <ArrowRight
                aria-hidden
                className="ml-auto h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </nav>

      <section className="border-b border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <AboutReveal variant="left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Examination services
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Everything you need to prepare{" "}
              <em className="italic">with confidence.</em>
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Find official examination periods, published timetables, candidate
              guidance and results access in one clear place.
            </p>
          </AboutReveal>
          <ImageCurtainReveal
            direction="right"
            className="min-h-[330px] overflow-hidden rounded-3xl ring-1 ring-primary/10 sm:min-h-[420px]"
          >
            <PublicImage
              src="/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg"
              alt="Kisii University student preparing for examinations"
              ratio="fill"
              className="h-full w-full"
              imageClassName="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.03]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </ImageCurtainReveal>
        </div>
      </section>

      <section
        id="current-timetable"
        className="scroll-mt-28 bg-surface-subtle px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <AboutReveal>
            <div className="rounded-3xl bg-primary p-7 text-white ring-1 ring-primary/20 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    Current examination period
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
                    {context?.title ?? "Examination schedule"}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/75">
                    {context?.body ??
                      "Published examination dates will appear here."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/75">
                    {meta.examStart ? (
                      <span>
                        <strong className="text-white">Begins</strong> ·{" "}
                        {calendarDate(String(meta.examStart))}
                      </span>
                    ) : null}
                    {meta.examEnd ? (
                      <span>
                        <strong className="text-white">Ends</strong> ·{" "}
                        {calendarDate(String(meta.examEnd))}
                      </span>
                    ) : null}
                    {timetableRecord?.version ? (
                      <span>
                        <strong className="text-white">Version</strong> ·{" "}
                        {String(timetableRecord.version)}
                      </span>
                    ) : null}
                    {sittingCount ? (
                      <span>
                        <strong className="text-white">
                          Published sittings
                        </strong>{" "}
                        · {sittingCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentTimetable ? (
                    <Link
                      href="/academics/examinations/timetable"
                      className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
                    >
                      Find my exams{" "}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {pdfFallback?.href ? (
                    <Link
                      href={pdfFallback.href}
                      className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
                    >
                      Download PDF <Download aria-hidden className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
              {!currentTimetable && pdfFallback ? (
                <p className="mt-7 border-t border-white/15 pt-5 text-sm leading-6 text-white/70">
                  The structured timetable is not yet available. Use the
                  official published PDF while the searchable schedule is being
                  prepared.
                </p>
              ) : null}
            </div>
          </AboutReveal>
        </div>
      </section>

      <section
        id="candidate-guidance"
        className="scroll-mt-28 bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Candidate guidance
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight sm:text-5xl">
            Before you enter the <em className="italic">examination room.</em>
          </h2>
          <div className="mt-10 grid border-y border-white/15 md:grid-cols-5">
            {[
              [
                "Identification",
                "Carry the valid identification specified in official examination guidance.",
              ],
              [
                "Reporting time",
                "Arrive early enough for verification and seating before the paper begins.",
              ],
              [
                "Permitted materials",
                "Bring only materials explicitly allowed for your examination.",
              ],
              [
                "Conduct",
                "Follow invigilator instructions and all published examination regulations.",
              ],
              [
                "Special arrangements",
                "Confirm approved accommodations with the examinations office in advance.",
              ],
            ].map(([title, body], index) => (
              <article
                key={title}
                className={`py-6 md:px-5 ${index ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}
              >
                <ShieldCheck aria-hidden className="h-6 w-6 text-secondary" />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="examination-notices"
        className="scroll-mt-28 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Official notices
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary">
            Published examination <em className="italic">resources.</em>
          </h2>
          {section.cards.length ? (
            <div className="mt-8 border-t border-primary/15">
              {section.cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href ?? "#"}
                  className="group grid gap-3 border-b border-primary/15 py-6 sm:grid-cols-[.7fr_1.4fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                      {card.metadata?.type ?? "Official notice"}
                    </span>
                    <span className="mt-2 block font-[family-name:var(--font-display)] text-xl font-normal text-primary">
                      {card.title}
                    </span>
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {card.body}
                    {card.metadata?.version
                      ? ` · Version ${card.metadata.version}`
                      : ""}
                  </span>
                  <Download
                    aria-hidden
                    className="h-4 w-4 text-primary transition-transform group-hover:translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-8 border-y border-primary/15 py-6 text-sm text-muted-foreground">
              No examination notices are currently published.
            </p>
          )}
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-4">
          {[
            [
              "Examination regulations",
              pdfFallback?.href ?? "/academics/examinations",
              "Review the rules governing examination conduct.",
            ],
            [
              "Deferred examinations",
              "/contact",
              "Ask about approved deferred examination processes.",
            ],
            [
              "Special arrangements",
              "/contact",
              "Contact the university about approved accommodations.",
            ],
            [
              "Results",
              "https://portal.kisiiuniversity.ac.ke",
              "Access individual results securely in the student portal.",
            ],
          ].map(([title, href, body]) => (
            <Link
              key={title}
              href={href}
              className="group border-t border-primary/15 pt-5"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {body}
              </p>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary group-hover:underline">
                Open resource <ArrowRight aria-hidden className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Examination updates
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight">
              Stay informed when schedules <em className="italic">change.</em>
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/70">
              Subscribe to university updates and continue checking the official
              timetable before every examination.
            </p>
          </div>
          <NewsletterSubscribeForm variant="dark" />
        </div>
      </section>
    </>
  );
}

export function AcademicRecordsPage({
  config,
  kind,
  page = 1,
}: {
  config: PublicPageConfig;
  kind: AcademicRecordsKind;
  page?: number;
}) {
  const section = sectionFor(config);
  const isProgrammeFinder = kind === "programmes";
  const hasNextPage =
    isProgrammeFinder &&
    (section.pagination
      ? page < section.pagination.pages
      : section.cards.length >= 12);
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    const filters = section.filters;
    if (filters?.query) params.set("q", filters.query);
    if (filters?.level) params.set("level", filters.level);
    if (filters?.schoolId) params.set("school_id", filters.schoolId);
    if (filters?.mode) params.set("mode_of_study", filters.mode);
    if (filters?.sort) params.set("sort", filters.sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return `${config.currentHref}${query ? `?${query}` : ""}`;
  };

  return (
    <PageShell>
      <AboutPageLenis>
        {kind === "programmes" ? (
          <CampusPageHeader
            seed="/academics/programmes"
            variant="compact"
            titleWeight="normal"
            eyebrow="Programme Catalogue"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Academics", href: "/academics" },
              { label: "Programmes" },
            ]}
            title={
              <>
                Find your path <em className="italic">at Kisii.</em>
              </>
            }
            description="Compare undergraduate, postgraduate, diploma and certificate programmes, then follow the route from discovery to application."
          >
            <ProgrammeHeroSearch section={section} />
          </CampusPageHeader>
        ) : kind === "schools" ? (
          <CampusPageHeader
            seed="/academics/schools"
            variant="feature"
            titleWeight="normal"
            eyebrow="Schools & Faculties"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Academics", href: "/academics" },
              { label: "Schools & Faculties" },
            ]}
            title={
              <>
                Distinct disciplines.{" "}
                <em className="italic">One university.</em>
              </>
            }
            description="Explore the academic communities where programmes, professional expertise, research and student learning come together."
          />
        ) : kind === "departments" ? (
          <CampusPageHeader
            seed="/academics/departments"
            variant="feature"
            titleWeight="normal"
            eyebrow="Academic Departments"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Academics", href: "/academics" },
              { label: "Departments" },
            ]}
            title={
              <>
                The communities behind{" "}
                <em className="italic">every discipline.</em>
              </>
            }
            description="Explore the departments responsible for teaching, scholarship, staff expertise and programme delivery across Kisii University."
          />
        ) : kind === "calendar" ? (
          <CampusPageHeader
            seed="/academics/calendar"
            variant="feature"
            titleWeight="normal"
            eyebrow="Academic Calendar"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Academics", href: "/academics" },
              { label: "Academic Calendar" },
            ]}
            title={
              <>
                Plan the semester <em className="italic">with confidence.</em>
              </>
            }
            description="Review published registration, teaching, examination and results dates, together with official calendar updates."
          />
        ) : kind === "examinations" ? (
          <CampusPageHeader
            seed="/academics/examinations"
            variant="feature"
            titleWeight="normal"
            eyebrow="Examinations"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Academics", href: "/academics" },
              { label: "Examinations" },
            ]}
            title={
              <>
                Prepare. Sit. <em className="italic">Progress.</em>
              </>
            }
            description="Find official examination schedules, candidate guidance, notices and secure routes to your academic results."
          />
        ) : (
          <AcademicHero config={config} kind={kind} />
        )}
        {kind === "schools" ? <SchoolsEditorial section={section} /> : null}
        {kind === "departments" ? (
          <DepartmentsDirectory section={section} />
        ) : null}
        {kind === "programmes" ? (
          <ProgrammeFinder
            section={section}
            page={page}
            pageHref={pageHref}
            hasNextPage={hasNextPage}
          />
        ) : null}
        {kind === "calendar" ? (
          <CalendarEditorial section={section} config={config} />
        ) : null}
        {kind === "examinations" ? (
          <ExaminationsEditorial section={section} config={config} />
        ) : null}
        {!section.cards.length ? (
          <div className="mx-auto flex max-w-[1680px] items-center gap-3 border-y border-border px-4 py-10 text-muted-foreground sm:px-6 lg:px-8">
            <Search className="h-5 w-5" aria-hidden /> No published records are
            available yet.
          </div>
        ) : null}
      </AboutPageLenis>
    </PageShell>
  );
}
