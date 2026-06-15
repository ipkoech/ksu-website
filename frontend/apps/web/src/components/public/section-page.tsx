import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartHandshake,
  History,
  Home,
  Landmark,
  Library,
  Megaphone,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";

export type PublicIconName =
  | "arrow"
  | "book"
  | "building"
  | "calendar"
  | "check"
  | "clipboard"
  | "compass"
  | "file"
  | "graduation"
  | "handshake"
  | "heart"
  | "history"
  | "home"
  | "landmark"
  | "library"
  | "megaphone"
  | "news"
  | "search"
  | "shield"
  | "sparkles"
  | "trophy"
  | "user"
  | "users";

export type PublicAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type PublicCard = {
  title: string;
  body: string;
  href?: string;
  action?: string;
  icon?: PublicIconName;
  eyebrow?: string;
  external?: boolean;
};

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

const iconMap: Record<PublicIconName, LucideIcon> = {
  arrow: ArrowRight,
  book: BookOpenCheck,
  building: Building2,
  calendar: CalendarDays,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  compass: Compass,
  file: FileText,
  graduation: GraduationCap,
  handshake: HeartHandshake,
  heart: HeartHandshake,
  history: History,
  home: Home,
  landmark: Landmark,
  library: Library,
  megaphone: Megaphone,
  news: Newspaper,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  trophy: Trophy,
  user: UserRound,
  users: Users,
};

function IconGlyph({
  icon = "file",
  className = "h-5 w-5",
}: {
  icon?: PublicIconName;
  className?: string;
}) {
  const Icon = iconMap[icon] ?? FileText;
  return <Icon aria-hidden className={className} />;
}

function ActionLink({
  action,
  primary = false,
}: {
  action: PublicAction;
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
    : "inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5";

  if (action.external) {
    return (
      <a
        href={action.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {action.label}
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {action.label}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function CardLink({
  card,
  className,
  children,
}: {
  card: PublicCard;
  className: string;
  children: ReactNode;
}) {
  if (!card.href) {
    return <article className={className}>{children}</article>;
  }

  if (card.external) {
    return (
      <a
        href={card.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={card.href} className={className}>
      {children}
    </Link>
  );
}

function StandardCard({
  card,
  dark = false,
}: {
  card: PublicCard;
  dark?: boolean;
}) {
  const linked = Boolean(card.href);
  const className = dark
    ? `group flex min-h-[220px] flex-col rounded-lg border border-white/10 bg-white/[0.04] p-5 transition ${
        linked ? "hover:-translate-y-1 hover:bg-white/[0.08]" : ""
      }`
    : `group flex min-h-[220px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm transition ${
        linked
          ? "hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
          : ""
      }`;

  return (
    <CardLink card={card} className={className}>
      <span
        className={
          dark
            ? "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-secondary ring-1 ring-white/10"
            : "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary shadow-sm ring-1 ring-slate-200 transition group-hover:bg-primary group-hover:text-white"
        }
      >
        <IconGlyph icon={card.icon} />
      </span>
      {card.eyebrow ? (
        <p
          className={
            dark
              ? "mt-6 text-xs font-semibold uppercase text-secondary"
              : "mt-6 text-xs font-semibold uppercase text-secondary"
          }
        >
          {card.eyebrow}
        </p>
      ) : null}
      <h3
        className={
          dark
            ? "mt-4 text-lg font-semibold leading-7 text-white"
            : "mt-4 text-lg font-semibold leading-7 text-slate-950"
        }
      >
        {card.title}
      </h3>
      <p
        className={
          dark
            ? "mt-4 text-sm leading-7 text-white/70"
            : "mt-4 text-sm leading-7 text-slate-600"
        }
      >
        {card.body}
      </p>
      {card.action ? (
        <span
          className={
            dark
              ? "mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-secondary"
              : "mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary"
          }
        >
          {card.action}
          {card.external ? (
            <ExternalLink aria-hidden className="h-4 w-4" />
          ) : (
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition group-hover:translate-x-1"
            />
          )}
        </span>
      ) : null}
    </CardLink>
  );
}

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
      <label className="relative min-w-0">
        <span className="sr-only">{filters.queryPlaceholder ?? "Search records"}</span>
        <Search
          aria-hidden
          className={
            dark
              ? "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              : "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          }
        />
        <input
          type="search"
          name={queryName}
          defaultValue={filters.query}
          placeholder={filters.queryPlaceholder ?? "Search records"}
          className={
            dark
              ? "h-11 w-full rounded-md border border-white/10 bg-slate-950/60 pl-9 pr-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              : "h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
          }
        />
      </label>

      {filters.levelOptions?.length ? (
        <label>
          <span className="sr-only">Programme level</span>
          <select
            name="level"
            defaultValue={filters.level ?? ""}
            className={
              dark
                ? "h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                : "h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            }
          >
            {filters.levelOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {filters.schoolOptions?.length ? (
        <label>
          <span className="sr-only">School</span>
          <select
            name="school_id"
            defaultValue={filters.schoolId ?? ""}
            className={
              dark
                ? "h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                : "h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            }
          >
            {filters.schoolOptions.map((option) => (
              <option key={option.value || "all-schools"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {filters.modeOptions?.length ? (
        <label>
          <span className="sr-only">Study mode</span>
          <select
            name="mode_of_study"
            defaultValue={filters.mode ?? ""}
            className={
              dark
                ? "h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                : "h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            }
          >
            {filters.modeOptions.map((option) => (
              <option key={option.value || "all-modes"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {filters.sortOptions?.length ? (
        <label>
          <span className="sr-only">Sort programmes</span>
          <select
            name="sort"
            defaultValue={filters.sort ?? ""}
            className={
              dark
                ? "h-11 w-full rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                : "h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            }
          >
            {filters.sortOptions.map((option) => (
              <option key={option.value || "recommended"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <button
        type="submit"
        className={
          dark
            ? "inline-flex h-11 items-center justify-center rounded-md bg-secondary px-4 text-sm font-semibold text-slate-950 transition hover:bg-secondary/90"
            : "inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
        }
      >
        {filters.submitLabel ?? "Filter"}
      </button>

      {isActive && filters.clearHref ? (
        <Link
          href={filters.clearHref}
          className={
            dark
              ? "inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              : "inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
          }
        >
          Clear
        </Link>
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
              <StandardCard
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
                    <IconGlyph icon={card.icon} className="h-4 w-4" />
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
                        <ActionLink action={config.primaryAction} primary />
                      ) : null}
                      {config.secondaryActions?.map((action) => (
                        <ActionLink key={action.label} action={action} />
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
                              <IconGlyph icon={item.icon} className="h-4 w-4" />
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
                                  <IconGlyph
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
                  <StandardCard
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
