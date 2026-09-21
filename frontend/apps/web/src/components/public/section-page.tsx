import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  CampusPageHeader,
  type CampusHeaderImageName,
} from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";
import {
  PublicActionLink,
  PublicIconGlyph,
  type PublicAction,
  type PublicCard,
  type PublicIconName,
} from "@/components/public/public-primitives";
import { AcademicLeadershipStructure } from "@/components/public/academic-leadership-structure";
import type { AcademicOrganization } from "@/lib/public-team-data";
import { PublicSectionDataDisplay } from "./section-data-display";

export type { PublicAction, PublicCard, PublicIconName };

export type PublicPageSection = {
  eyebrow: string;
  title: string;
  body: string;
  tone?: "light" | "white" | "dark";
  variant?: "cards" | "article";
  columns?: 2 | 3 | 4;
  cards: PublicCard[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
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
  /**
   * Pin a campus landmark for the page header. Omit and the header resolves one
   * from `currentHref`, which keeps related routes on the same building.
   */
  headerImage?: CampusHeaderImageName;
  continueTitle?: string;
  continueBody?: string;
  continueItems?: PublicCard[];
  hideContinue?: boolean;
  academicLeadership?: AcademicOrganization | null;
};

export function PublicSectionPage({
  config,
  header,
  heroContent,
  showHero = true,
  heroSize = "default",
  academicLeadership,
  landingContent,
  hideScopeCards = false,
}: {
  config: PublicPageConfig;
  header?: ReactNode;
  heroContent?: ReactNode;
  showHero?: boolean;
  heroSize?: "default" | "compact";
  academicLeadership?: AcademicOrganization | null;
  landingContent?: ReactNode;
  hideScopeCards?: boolean;
}) {
  const continueItems = config.continueItems ?? config.navItems;
  const compactHero = heroSize === "compact";

  return (
    <PageShell header={header}>
      <>
        {showHero ? (
          <>
            <CampusPageHeader
              variant={compactHero ? "compact" : "default"}
              eyebrow={config.eyebrow}
              title={config.title}
              description={config.body}
              breadcrumbs={config.breadcrumb}
              image={config.headerImage}
              seed={config.currentHref}
              actions={
                config.primaryAction || config.secondaryActions?.length ? (
                  <>
                    {config.primaryAction ? (
                      <PublicActionLink action={config.primaryAction} primary />
                    ) : null}
                    {config.secondaryActions?.map((action) => (
                      <PublicActionLink key={action.label} action={action} />
                    ))}
                  </>
                ) : null
              }
            />
            <section
              className={
                compactHero
                  ? "relative overflow-hidden border-b border-border bg-surface-subtle px-4 py-4 sm:px-6 lg:px-8 lg:py-5"
                  : "relative overflow-hidden border-b border-border bg-surface-subtle px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
              }
            >
              <div className="relative mx-auto w-full max-w-[1680px]">
                <div
                  className={
                    compactHero
                      ? "mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_260px] xl:items-start"
                      : "mt-6 grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_280px] xl:items-start"
                  }
                >
                  <nav
                    aria-label={config.navLabel}
                    className="rounded-lg border border-border bg-white p-3 shadow-sm xl:sticky xl:top-28"
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
                              className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-foreground"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary transition group-hover:bg-primary group-hover:text-white">
                                <ChevronRight aria-hidden className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                {item.title}
                              </span>
                            </Link>
                          ) : (
                            <span className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground">
                              {item.title}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div
                    className={
                      compactHero ? "min-w-0 p-1" : "min-w-0 p-1 sm:p-2 lg:p-3"
                    }
                  >
                    {/* Eyebrow, title, body and actions now live on the campus
                      header band above, so this column carries only the
                      page-specific hero content and highlights. */}
                    {heroContent}

                    {!hideScopeCards && config.scopeCards?.length ? (
                      <div
                        className={
                          // Only rule off from hero content that actually sits
                          // above; without it the divider reads as an orphan.
                          !heroContent
                            ? ""
                            : compactHero
                              ? "mt-5 border-t border-border pt-4"
                              : "mt-7 border-t border-border pt-5"
                        }
                      >
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {config.scopeTitle ?? "Page highlights"}
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {config.scopeCards.map((item) => (
                            <div
                              key={item.title}
                              className="rounded-lg border border-border bg-white p-4 shadow-sm"
                            >
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
                                <PublicIconGlyph
                                  icon={item.icon}
                                  className="h-4 w-4"
                                />
                              </span>
                              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                                {item.eyebrow ?? item.title}
                              </p>
                              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                                {item.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <aside className="space-y-5">
                    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase text-secondary">
                        {config.asideTitle ?? "Explore this section"}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {config.asideBody}
                      </p>
                    </div>

                    {config.relatedItems?.length ? (
                      <nav
                        aria-label={config.relatedTitle ?? "Related pages"}
                        className="rounded-lg border border-border bg-white p-3 shadow-sm"
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
                                  className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-foreground"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary transition group-hover:bg-primary group-hover:text-white">
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
                                    className="h-4 w-4 text-muted-foreground/70 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
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
          </>
        ) : null}

        {landingContent}

        {academicLeadership ? (
          <AcademicLeadershipStructure data={academicLeadership} />
        ) : null}

        {landingContent ? null : (
          <PublicSectionDataDisplay
            sections={config.sections}
            continueItems={continueItems}
            continueTitle={config.continueTitle}
            continueBody={config.continueBody}
            currentHref={config.currentHref}
            hideContinue={config.hideContinue}
          />
        )}
      </>
    </PageShell>
  );
}
