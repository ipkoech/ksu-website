import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  HeartHandshake,
  Home,
  Mail,
  Megaphone,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getContactPageConfig } from "@/lib/utility-page-data";
import type {
  PublicAction,
  PublicCard,
  PublicIconName,
  PublicPageSection,
} from "@/components/public/section-page";

const iconMap: Partial<Record<PublicIconName, LucideIcon>> = {
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  file: FileText,
  handshake: HeartHandshake,
  home: Home,
  megaphone: Megaphone,
};

function IconGlyph({
  icon = "handshake",
  className = "h-5 w-5",
}: {
  icon?: PublicIconName;
  className?: string;
}) {
  const Icon = iconMap[icon] ?? HeartHandshake;
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
    ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
    : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

  if (action.external) {
    return (
      <a
        href={action.href}
        className={className}
        target={action.href.startsWith("mailto:") ? undefined : "_blank"}
        rel={
          action.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
        }
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

function ContactCard({
  card,
  dark = false,
}: {
  card: PublicCard;
  dark?: boolean;
}) {
  const content = (
    <>
      <span
        className={
          dark
            ? "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-secondary ring-1 ring-white/10"
            : "inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15"
        }
      >
        <IconGlyph icon={card.icon} />
      </span>
      <p
        className={
          dark
            ? "mt-5 text-xs font-semibold uppercase text-secondary"
            : "mt-5 text-xs font-semibold uppercase text-secondary"
        }
      >
        {card.eyebrow ?? "Contact"}
      </p>
      <h3
        className={
          dark
            ? "mt-3 text-lg font-semibold leading-7 text-white"
            : "mt-3 text-lg font-semibold leading-7 text-slate-950"
        }
      >
        {card.title}
      </h3>
      <p
        className={
          dark
            ? "mt-3 text-sm leading-7 text-white/70"
            : "mt-3 text-sm leading-7 text-slate-600"
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
            <ArrowRight aria-hidden className="h-4 w-4" />
          )}
        </span>
      ) : null}
    </>
  );

  const className = dark
    ? "group flex min-h-[220px] flex-col rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
    : "group flex min-h-[220px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]";

  if (!card.href) {
    return <article className={className}>{content}</article>;
  }

  if (card.external) {
    return (
      <a
        href={card.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={card.href} className={className}>
      {content}
    </Link>
  );
}

function ContactSection({ section }: { section: PublicPageSection }) {
  const dark = section.tone === "dark";
  const wrapperClass = dark
    ? "border-y border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16"
    : "border-y border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16";
  const gridClass =
    section.columns === 2
      ? "grid gap-5 md:grid-cols-2"
      : "grid gap-5 md:grid-cols-2 xl:grid-cols-3";

  return (
    <ScrollReveal as="section" className={wrapperClass}>
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
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
          <p
            className={
              dark
                ? "mt-5 text-base leading-8 text-white/70"
                : "mt-5 max-w-xl text-base leading-8 text-slate-600"
            }
          >
            {section.body}
          </p>
        </div>
        <ScrollRevealGroup className={gridClass} staggerDelay={70}>
          {section.cards.map((card) => (
            <ContactCard
              key={`${section.eyebrow}-${card.title}`}
              card={card}
              dark={dark}
            />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

export default async function ContactPage() {
  const config = await getContactPageConfig();
  const [mainSection, ...restSections] = config.sections;
  const primaryCards = mainSection?.cards.slice(0, 3) ?? [];

  return (
    <PageShell>
      <>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto w-full max-w-[1440px]">
            <BreadcrumbTrail items={config.breadcrumb} />

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-end">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase text-secondary">
                  {config.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  {config.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {config.body}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {config.primaryAction ? (
                    <ActionLink action={config.primaryAction} primary />
                  ) : null}
                  {config.secondaryActions?.map((action) => (
                    <ActionLink key={action.label} action={action} />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-3 lg:col-span-1">
                  <p className="text-xs font-semibold uppercase text-secondary">
                    Direct channels
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <a
                      href="mailto:info@kisiiuniversity.ac.ke"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Mail aria-hidden className="h-4 w-4 text-primary" />
                      Email
                    </a>
                    <a
                      href="tel:+254720875082"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <Phone aria-hidden className="h-4 w-4 text-primary" />
                      Call
                    </a>
                    <Link
                      href="/search"
                      className="flex min-h-11 items-center gap-3 rounded-md bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
                    >
                      <FileText aria-hidden className="h-4 w-4 text-primary" />
                      Search directory
                    </Link>
                  </div>
                </div>

                {primaryCards.map((card) => (
                  <ContactCard key={`hero-${card.title}`} card={card} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {mainSection ? <ContactSection section={mainSection} /> : null}
        {restSections.map((section) => (
          <ContactSection key={section.eyebrow} section={section} />
        ))}
      </>
    </PageShell>
  );
}
