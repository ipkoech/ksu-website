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
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { RichTextRenderer } from "@ksu/ui/components";

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
      <a href={action.href} className={className}>
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
      <a href={card.href} className={className}>
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
    ? `group flex min-h-[250px] flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 transition ${
        linked ? "hover:-translate-y-1 hover:bg-white/[0.08]" : ""
      }`
    : `group flex min-h-[250px] flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition ${
        linked
          ? "hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
          : ""
      }`;

  return (
    <CardLink card={card} className={className}>
      <span
        className={
          dark
            ? "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/10"
            : "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200 transition group-hover:bg-primary group-hover:text-white"
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
            ? "mt-4 text-xl font-semibold leading-7 text-white"
            : "mt-4 text-xl font-semibold leading-7 text-slate-950"
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

function SectionBlock({ section }: { section: PublicPageSection }) {
  if (section.variant === "article") {
    return <ArticleSectionBlock section={section} />;
  }

  const dark = section.tone === "dark";
  const wrapperClass = dark
    ? "border-y border-slate-200 bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20"
    : section.tone === "white"
      ? "bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      : "border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20";

  return (
    <section className={wrapperClass}>
      <div className="grid w-full gap-10 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-28">
          <p className="text-sm font-semibold uppercase text-secondary">
            {section.eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white"
                : "mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950"
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
        <div className={gridClass(section.columns)}>
          {section.cards.map((card) => (
            <StandardCard key={`${section.eyebrow}-${card.title}`} card={card} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleSectionBlock({ section }: { section: PublicPageSection }) {
  return (
    <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid w-full gap-10 xl:grid-cols-[300px_minmax(0,840px)] xl:justify-center">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <p className="text-sm font-semibold uppercase text-secondary">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
            {section.title}
          </h2>

          {section.cards.length ? (
            <dl className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
              {section.cards.map((card) => (
                <div key={`${section.eyebrow}-${card.title}`} className="flex gap-3 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
    </section>
  );
}

export function PublicSectionPage({
  config,
  header,
  heroContent,
}: {
  config: PublicPageConfig;
  header?: ReactNode;
  heroContent?: ReactNode;
}) {
  const continueItems = config.continueItems ?? config.navItems;

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_44%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
          <div className="relative w-full">
            <BreadcrumbTrail items={config.breadcrumb} />

            <div className="mt-7 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px] xl:items-start">
              <nav
                aria-label={config.navLabel}
                className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur xl:sticky xl:top-28"
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
                          className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                            <ChevronRight aria-hidden className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">{item.title}</span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700">
                          {item.title}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                    <p className="text-sm font-semibold uppercase text-secondary">
                      {config.eyebrow}
                    </p>
                    <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-slate-950 sm:text-5xl xl:text-6xl">
                      {config.title}
                    </h1>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                      {config.body}
                    </p>
                    {(config.primaryAction || config.secondaryActions?.length) ? (
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {config.primaryAction ? (
                          <ActionLink action={config.primaryAction} primary />
                        ) : null}
                        {config.secondaryActions?.map((action) => (
                          <ActionLink key={action.label} action={action} />
                        ))}
                      </div>
                    ) : null}
                    {heroContent}
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {config.scopeTitle ?? "Page highlights"}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {(config.scopeCards ?? []).map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <IconGlyph icon={item.icon} />
                          </span>
                          <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                            {item.eyebrow ?? item.title}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {item.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
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
                    className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
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
                              className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                                <IconGlyph icon={item.icon} className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">{item.title}</span>
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

        {config.sections.map((section) => (
          <SectionBlock key={`${config.currentHref}-${section.eyebrow}`} section={section} />
        ))}

        <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="w-full">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-secondary">
                  Continue
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
                  {config.continueTitle ?? "Open related public pages"}
                </h2>
              </div>
              <p className="text-base leading-8 text-slate-600">
                {config.continueBody ??
                  "Use the related public pathways to continue through the website."}
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {continueItems.map((item) => (
                <StandardCard key={`${config.currentHref}-continue-${item.title}`} card={item} />
              ))}
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
