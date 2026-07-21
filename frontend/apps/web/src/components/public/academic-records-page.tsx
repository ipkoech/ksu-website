import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Search } from "lucide-react";
import type {
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicListFilterForm } from "@/components/public/list-filter-form";

type AcademicRecordsKind =
  | "schools"
  | "programmes"
  | "calendar"
  | "examinations";

const pageMedia: Record<
  AcademicRecordsKind,
  { src: string; alt: string; kicker: string }
> = {
  schools: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Kisii University students learning together",
    kicker: "Schools, departments and disciplines",
  },
  programmes: {
    src: "/images/Home/KSUGreenLandscaping.jpg",
    alt: "Kisii University campus grounds",
    kicker: "Find a programme built for your future",
  },
  calendar: {
    src: "/images/Home/um-hero.jpg",
    alt: "Kisii University campus buildings",
    kicker: "Plan your academic year",
  },
  examinations: {
    src: "/images/Home/VCProfSUKUBA.jpg",
    alt: "Kisii University academic leadership",
    kicker: "Dates, timetables and notices",
  },
};

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

function Records({
  kind,
  section,
}: {
  kind: AcademicRecordsKind;
  section: PublicPageSection;
}) {
  if (kind === "calendar") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {section.cards.map((card) => (
          <Link
            key={card.title}
            href={card.href ?? "#"}
            className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
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
            <ArrowRight
              className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ))}
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
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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

export function AcademicRecordsPage({
  config,
  kind,
}: {
  config: PublicPageConfig;
  kind: AcademicRecordsKind;
}) {
  const section = sectionFor(config);
  const media = pageMedia[kind];

  return (
    <PageShell>
      <BreadcrumbTrail items={config.breadcrumb} />
      <main>
        <section className="border-b border-border bg-white px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto grid w-full max-w-[1680px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                {config.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-foreground sm:text-6xl">
                {config.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {config.body}
              </p>
              <p className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <span className="h-px w-8 bg-secondary" />
                {media.kicker}
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-100">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid w-full max-w-[1680px] gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {section.body}
              </p>
            </aside>
            <div className="min-w-0">
              {section.filters ? (
                <PublicListFilterForm
                  className="mb-8 border-b border-border pb-5"
                  searchName={section.filters.queryName ?? "q"}
                  searchValue={section.filters.query}
                  searchPlaceholder={
                    section.filters.queryPlaceholder ?? "Search records"
                  }
                  searchLabel={
                    section.filters.queryPlaceholder ?? "Search records"
                  }
                  selects={[]}
                  clearHref={section.filters.clearHref}
                  total={section.cards.length}
                  visible={section.cards.length}
                />
              ) : null}
              <Records kind={kind} section={section} />
              {!section.cards.length ? (
                <div className="flex items-center gap-3 border-y border-border py-10 text-muted-foreground">
                  <Search className="h-5 w-5" aria-hidden /> No published
                  records are available yet.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
