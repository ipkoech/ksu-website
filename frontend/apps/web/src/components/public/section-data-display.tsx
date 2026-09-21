"use client";

import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import {
  PublicCardSurface,
  PublicIconGlyph,
} from "@/components/public/public-primitives";
import {
  PublicListFilterForm,
  type ListFilterOption,
} from "@/components/public/list-filter-form";
import type { PublicPageSection } from "./section-page";

function gridClass(columns: PublicPageSection["columns"] = 3) {
  if (columns === 2) return "grid gap-5 md:grid-cols-2";
  if (columns === 4) return "grid gap-5 md:grid-cols-2 xl:grid-cols-4";
  return "grid gap-5 md:grid-cols-2 xl:grid-cols-3";
}

function SectionFilterBar({
  filters,
  dark = false,
}: {
  filters: NonNullable<PublicPageSection["filters"]>;
  dark?: boolean;
}) {
  const selects: {
    name: string;
    label: string;
    value?: string;
    allLabel: string;
    options: ListFilterOption[];
  }[] = [];

  if (filters.levelOptions?.length) {
    selects.push({
      name: "level",
      label: "Programme level",
      value: filters.level,
      allLabel: "All levels",
      options: filters.levelOptions,
    });
  }
  if (filters.schoolOptions?.length) {
    selects.push({
      name: "school_id",
      label: "School",
      value: filters.schoolId,
      allLabel: "All schools",
      options: filters.schoolOptions,
    });
  }
  if (filters.modeOptions?.length) {
    selects.push({
      name: "mode_of_study",
      label: "Study mode",
      value: filters.mode,
      allLabel: "All modes",
      options: filters.modeOptions,
    });
  }
  if (filters.sortOptions?.length) {
    selects.push({
      name: "sort",
      label: "Sort programmes",
      value: filters.sort,
      allLabel: "Default sort",
      options: filters.sortOptions,
    });
  }

  return (
    <PublicListFilterForm
      className={
        dark
          ? "mb-6 rounded-lg border border-white/10 bg-white/[0.04] p-3"
          : "mb-6 rounded-lg border border-border bg-white p-3 shadow-sm"
      }
      searchName={filters.queryName ?? "q"}
      searchValue={filters.query}
      searchPlaceholder={filters.queryPlaceholder ?? "Search records"}
      searchLabel={filters.queryPlaceholder ?? "Search records"}
      selects={selects}
      clearHref={filters.clearHref}
      total={0}
      visible={0}
    />
  );
}

function SectionBlock({ section }: { section: PublicPageSection }) {
  if (section.variant === "article") {
    return (
      <ScrollReveal
        as="section"
        className="border-y border-border bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="mx-auto grid w-full max-w-[1120px] gap-8 xl:grid-cols-[280px_minmax(0,760px)] xl:justify-center">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <p className="text-sm font-semibold uppercase text-secondary">
              {section.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
              {section.title}
            </h2>
            {section.cards.length ? (
              <dl className="mt-7 divide-y divide-slate-200 border-y border-border">
                {section.cards.map((card) => (
                  <div
                    key={`${section.eyebrow}-${card.title}`}
                    className="flex gap-3 py-4"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <PublicIconGlyph icon={card.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">
                        {card.title}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">
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
              className="prose prose-slate max-w-none text-base leading-8 text-muted-foreground prose-headings:font-[family-name:var(--font-display)] prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
            />
          </article>
        </div>
      </ScrollReveal>
    );
  }

  const dark = section.tone === "dark";
  const wrapperClass = dark
    ? "border-y border-border bg-brand-overlay px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16"
    : section.tone === "white"
      ? "bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      : "border-y border-border bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16";

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
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground"
            }
          >
            {section.title}
          </h2>
          <RichTextRenderer
            content={section.body}
            className={
              dark
                ? "mt-5 text-base leading-8 text-white/70 [&_*]:text-white/70"
                : "mt-5 text-base leading-8 text-muted-foreground"
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

export function PublicSectionDataDisplay({
  sections,
  continueItems,
  continueTitle,
  continueBody,
  currentHref,
  hideContinue = false,
}: {
  sections: PublicPageSection[];
  continueItems: PublicPageSection["cards"];
  continueTitle?: string;
  continueBody?: string;
  currentHref: string;
  hideContinue?: boolean;
}) {
  return (
    <div data-server-data-display="web-public-sections">
      {sections.map((section) => (
        <SectionBlock
          key={`${currentHref}-${section.eyebrow}`}
          section={section}
        />
      ))}
      {hideContinue ? null : (
        <ScrollReveal
          as="section"
          className="border-y border-border bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="mx-auto w-full max-w-[1680px]">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Continue
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground">
                  {continueTitle ?? "Open related public pages"}
                </h2>
              </div>
              <p className="text-base leading-8 text-muted-foreground">
                {continueBody ??
                  "Use the related public pathways to continue through the website."}
              </p>
            </div>
            <ScrollRevealGroup
              className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              staggerDelay={70}
            >
              {continueItems.map((item) => (
                <PublicCardSurface
                  key={`${currentHref}-continue-${item.title}`}
                  card={item}
                />
              ))}
            </ScrollRevealGroup>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
