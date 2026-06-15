import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import {
  PublicActionLink,
  PublicCardSurface,
  PublicFilterButton,
  PublicFilterClearLink,
  PublicFilterSelect,
  PublicFilterTextInput,
  PublicIconGlyph,
  type PublicAction,
  type PublicCard,
  type PublicIconName,
} from "@/components/public/public-primitives";

export type { PublicAction, PublicCard, PublicIconName };

export type PublicPageSection = {
  eyebrow: string;
  title: string;
  body: string;
  tone?: "light" | "white" | "dark";
  variant?: "cards" | "article";
  columns?: 2 | 3 | 4;
  cards: PublicCard[];
  filters?: {
    action: string;
    query?: string;
    queryName?: string;
    queryPlaceholder?: string;
    level?: string;
    levelOptions?: { value: string; label: string }[];
    schoolId?: string;
    schoolOptions?: { value: string; label: string }[];
    mode?: string;
    modeOptions?: { value: string; label: string }[];
    sort?: string;
    sortOptions?: { value: string; label: string }[];
    submitLabel?: string;
    clearHref?: string;
  };
};

export type PublicPageConfig = {
  sectionLabel: string;
  currentHref: string;
  breadcrumb: { label: string; href?: string }[];
  navLabel: string;
  navItems: PublicCard[];
  eyebrow: string;
  title: string;
  body: string;
  primaryAction?: PublicAction;
  secondaryActions?: PublicAction[];
  scopeTitle?: string;
  scopeCards?: PublicCard[];
  asideTitle?: string;
  asideBody?: string;
  relatedTitle?: string;
  relatedItems?: PublicCard[];
  sections: PublicPageSection[];
  continueTitle?: string;
  continueBody?: string;
  continueItems?: PublicCard[];
  hideContinue?: boolean;
};

function gridClass(columns: PublicPageSection["columns"] = 3) {
  if (columns === 2) {
    return "grid gap-5 md:grid-cols-2";
  }

  if (columns === 4) {
    return "grid gap-5 md:grid-cols-2 xl:grid-cols-4";
  }

  return "grid gap-5 md:grid-cols-2 xl:grid-cols-3";
}

function SectionFilterBar({
  filters,
  dark = false,
}: {
  filters: NonNullable<PublicPageSection["filters"]>;
  dark?: boolean;
}) {
  const queryName = filters.queryName ?? "q";
  const isActive = Boolean(
    filters.query ||
      filters.level ||
      filters.schoolId ||
      filters.mode ||
      filters.sort,
  );

  return (
    <form
      action={filters.action}
      className={
        dark
          ? "mb-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(4,minmax(140px,180px))_auto_auto]"
          : "mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(4,minmax(140px,180px))_auto_auto]"
      }
    >
      <PublicFilterTextInput
        name={queryName}
        value={filters.query}
        placeholder={filters.queryPlaceholder ?? "Search records"}
        label={filters.queryPlaceholder ?? "Search records"}
        dark={dark}
      />

      {filters.levelOptions?.length ? (
        <PublicFilterSelect
          name="level"
          label="Programme level"
          value={filters.level}
          options={filters.levelOptions}
          dark={dark}
        />
      ) : null}

      {filters.schoolOptions?.length ? (
        <PublicFilterSelect
          name="school_id"
          label="School"
          value={filters.schoolId}
          options={filters.schoolOptions}
          dark={dark}
        />
      ) : null}

      {filters.modeOptions?.length ? (
        <PublicFilterSelect
          name="mode_of_study"
          label="Study mode"
          value={filters.mode}
          options={filters.modeOptions}
          dark={dark}
        />
      ) : null}

      {filters.sortOptions?.length ? (
        <PublicFilterSelect
          name="sort"
          label="Sort programmes"
          value={filters.sort}
          options={filters.sortOptions}
          dark={dark}
        />
      ) : null}

      <PublicFilterButton dark={dark}>
        {filters.submitLabel ?? "Filter"}
      </PublicFilterButton>

      {isActive && filters.clearHref ? (
        <PublicFilterClearLink href={filters.clearHref} dark={dark} />
      ) : null}
    </form>
  );
}

function SectionBlock({ section }: { section: PublicPageSection }) {
  if (section.variant === "article") {
    return <ArticleSectionBlock section={section} />;
  }

  const dark = section.tone === "dark";
  const wrapperClass = dark
    ? "border-y border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16"
    : section.tone === "white"
      ? "bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      : "border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16";

  return (
    <ScrollReveal as="section" className={wrapperClass}>
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-28">
          <p className="text-sm font-semibold uppercase text-secondary">
            {section.eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white"
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950"
            }
          >
            {section.title}
          </h2>
          <RichTextRenderer
            content={section.body}
            className={
              dark
                ? "mt-5 text-base leading-8 text-white/70 [&_*]:text-white/70"
                : "mt-5 text-base leading-8 text-slate-600"
            }
          />
        </div>
        <div className="min-w-0">
          {section.filters ? (
            <SectionFilterBar filters={section.filters} dark={dark} />
          ) : null}
          <ScrollRevealGroup
            className={gridClass(section.columns)}
            staggerDelay={70}
          >
            {section.cards.map((card) => (
              <PublicCardSurface
                key={`${section.eyebrow}-${card.title}`}
                card={card}
                dark={dark}
              />
            ))}
          </ScrollRevealGroup>
        </div>
      </div>
    </ScrollReveal>
  );
}

function ArticleSectionBlock({ section }: { section: PublicPageSection }) {
  return (
    <ScrollReveal
      as="section"
      className="border-y border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto grid w-full max-w-[1120px] gap-8 xl:grid-cols-[280px_minmax(0,760px)] xl:justify-center">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <p className="text-sm font-semibold uppercase text-secondary">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {section.title}
          </h2>

          {section.cards.length ? (
            <dl className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
              {section.cards.map((card) => (
                <div
                  key={`${section.eyebrow}-${card.title}`}
                  className="flex gap-3 py-4"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <PublicIconGlyph icon={card.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {card.title}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold leading-6 text-slate-950">
                      {card.body}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}
        </aside>

        <article className="min-w-0">
          <RichTextRenderer
            content={section.body}
            className="prose prose-slate max-w-none text-base leading-8 text-slate-700 prose-headings:font-[family-name:var(--font-display)] prose-headings:text-slate-950 prose-a:text-primary prose-strong:text-slate-950"
          />
        </article>
      </div>
    </ScrollReveal>
  );
}

export function PublicSectionPage({
  config,
  header,
  heroContent,
  showHero = true,
  heroSize = "default",
}: {
  config: PublicPageConfig;
  header?: ReactNode;
  heroContent?: ReactNode;
  showHero?: boolean;
  heroSize?: "default" | "compact";
}) {
  const continueItems = config.continueItems ?? config.navItems;
  const compactHero = heroSize === "compact";

  return (
    <PageShell header={header}>
      <>
        {showHero ? (
          <section
            className={
              compactHero
                ? "relative overflow-hidden border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 lg:px-8 lg:py-5"
                : "relative overflow-hidden border-b border-slate-200 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            }
          >
            <div className="relative mx-auto w-full max-w-[1680px]">
              <BreadcrumbTrail items={config.breadcrumb} />

              <div
                className={
                  compactHero
                    ? "mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_260px] xl:items-start"
                    : "mt-6 grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_280px] xl:items-start"
                }
              >
                <nav
                  aria-label={config.navLabel}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-28"
                >
                  <p className="px-2 text-xs font-semibold uppercase text-secondary">
                    {config.sectionLabel}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {config.navItems.map((item) => (
                      <li key={item.href ?? item.title}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                              <ChevronRight aria-hidden className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">{item.title}</span>
                          </Link>
                        ) : (
                          <span className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700">
                            {item.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className={compactHero ? "min-w-0 p-1" : "min-w-0 p-1 sm:p-2 lg:p-3"}>
                  <p className="text-sm font-semibold uppercase text-secondary">
                    {config.eyebrow}
                  </p>
                  <h1
                    className={
                      compactHero
                        ? "mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl xl:text-4xl"
                        : "mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl xl:text-5xl"
                    }
                  >
                    {config.title}
                  </h1>
                  <p
                    className={
                      compactHero
                        ? "mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base"
                        : "mt-4 max-w-3xl text-base leading-8 text-slate-600"
                    }
                  >
                    {config.body}
                  </p>
                  {config.primaryAction || config.secondaryActions?.length ? (
                    <div
                      className={
                        compactHero
                          ? "mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                          : "mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                      }
                    >
                      {config.primaryAction ? (
                        <PublicActionLink action={config.primaryAction} primary />
                      ) : null}
                      {config.secondaryActions?.map((action) => (
                        <PublicActionLink key={action.label} action={action} />
                      ))}
                    </div>
                  ) : null}
                  {heroContent}

                  {config.scopeCards?.length ? (
                    <div className={compactHero ? "mt-5 border-t border-slate-200 pt-4" : "mt-7 border-t border-slate-200 pt-5"}>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {config.scopeTitle ?? "Page highlights"}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {config.scopeCards.map((item) => (
                          <div
                            key={item.title}
                            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
                              <PublicIconGlyph icon={item.icon} className="h-4 w-4" />
                            </span>
                            <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
                              {item.eyebrow ?? item.title}
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                              {item.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <aside className="space-y-5">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-secondary">
                      {config.asideTitle ?? "Explore this section"}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {config.asideBody}
                    </p>
                  </div>

                  {config.relatedItems?.length ? (
                    <nav
                      aria-label={config.relatedTitle ?? "Related pages"}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="px-2 text-xs font-semibold uppercase text-secondary">
                        {config.relatedTitle ?? "Related Pages"}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {config.relatedItems.slice(0, 4).map((item) => {
                          if (!item.href) return null;

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                                  <PublicIconGlyph
                                    icon={item.icon}
                                    className="h-4 w-4"
                                  />
                                </span>
                                <span className="min-w-0 flex-1">
                                  {item.title}
                                </span>
                                <ChevronRight
                                  aria-hidden
                                  className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  ) : null}
                </aside>
              </div>
            </div>
          </section>
        ) : null}

        {config.sections.map((section) => (
          <SectionBlock
            key={`${config.currentHref}-${section.eyebrow}`}
            section={section}
          />
        ))}

        {config.hideContinue ? null : (
          <ScrollReveal
            as="section"
            className="border-y border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
          >
            <div className="mx-auto w-full max-w-[1680px]">
              <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase text-secondary">
                    Continue
                  </p>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
                    {config.continueTitle ?? "Open related public pages"}
                  </h2>
                </div>
                <p className="text-base leading-8 text-slate-600">
                  {config.continueBody ??
                    "Use the related public pathways to continue through the website."}
                </p>
              </div>
              <ScrollRevealGroup
                className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                staggerDelay={70}
              >
                {continueItems.map((item) => (
                  <PublicCardSurface
                    key={`${config.currentHref}-continue-${item.title}`}
                    card={item}
                  />
                ))}
              </ScrollRevealGroup>
            </div>
          </ScrollReveal>
        )}
      </>
    </PageShell>
  );
}
