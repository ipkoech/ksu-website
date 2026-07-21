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
  const hasNextPage = isProgrammeFinder && section.cards.length >= 12;
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
      <BreadcrumbTrail items={config.breadcrumb} />
      <main>
        <section
          className={
            isProgrammeFinder
              ? "px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
              : "px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
          }
        >
          <div className="mx-auto w-full max-w-[1680px]">
            <div className="mb-8 max-w-3xl border-b border-border pb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                {config.eyebrow}
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {config.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {config.body}
              </p>
            </div>
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
              {isProgrammeFinder && config.relatedItems?.length ? (
                <div className="mt-8 flex flex-col gap-4 border border-primary/20 bg-primary p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                      Admissions next step
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      Check the active intake before applying.
                    </p>
                  </div>
                  <Link
                    href={config.relatedItems[0].href ?? "/admissions/intakes"}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-secondary hover:text-white"
                  >
                    View intake <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              ) : null}
              {isProgrammeFinder ? (
                <nav
                  className="mt-8 flex items-center justify-between border-t border-border pt-5"
                  aria-label="Programme pages"
                >
                  {page > 1 ? (
                    <Link
                      href={pageHref(page - 1)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />{" "}
                      Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  {hasNextPage ? (
                    <Link
                      href={pageHref(page + 1)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Next <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
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
