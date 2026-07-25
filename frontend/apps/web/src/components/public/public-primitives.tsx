import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
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

export type PublicFactItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
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

export function PublicIconGlyph({
  icon = "file",
  className = "h-5 w-5",
}: {
  icon?: PublicIconName;
  className?: string;
}) {
  const Icon = iconMap[icon] ?? FileText;
  return <Icon aria-hidden className={className} />;
}

export function PublicActionLink({
  action,
  primary = false,
}: {
  action: PublicAction;
  primary?: boolean;
}) {
  const isDirectProtocol =
    action.href.startsWith("mailto:") || action.href.startsWith("tel:");
  const className = primary
    ? "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
    : "inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5";

  if (action.external) {
    return (
      <a
        href={action.href}
        className={className}
        target={isDirectProtocol ? undefined : "_blank"}
        rel={isDirectProtocol ? undefined : "noopener noreferrer"}
      >
        {action.label}
        {isDirectProtocol ? (
          <ArrowRight aria-hidden className="h-4 w-4" />
        ) : (
          <ExternalLink aria-hidden className="h-4 w-4" />
        )}
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

export function PublicCardShell({
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

export function PublicCardSurface({
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
    : `group flex min-h-[220px] flex-col rounded-lg border border-border bg-surface-subtle p-5 shadow-sm transition ${
        linked
          ? "hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
          : ""
      }`;

  return (
    <PublicCardShell card={card} className={className}>
      <span
        className={
          dark
            ? "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-secondary ring-1 ring-white/10"
            : "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary shadow-sm ring-1 ring-ring transition group-hover:bg-primary group-hover:text-white"
        }
      >
        <PublicIconGlyph icon={card.icon} />
      </span>
      {card.eyebrow ? (
        <p className="mt-6 text-xs font-semibold uppercase text-secondary">
          {card.eyebrow}
        </p>
      ) : null}
      <h3
        className={
          dark
            ? "mt-4 text-lg font-semibold leading-7 text-white"
            : "mt-4 text-lg font-semibold leading-7 text-foreground"
        }
      >
        {card.title}
      </h3>
      <p
        className={
          dark
            ? "mt-4 text-sm leading-7 text-white/70"
            : "mt-4 text-sm leading-7 text-muted-foreground"
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
    </PublicCardShell>
  );
}

export function PublicFilterTextInput({
  name,
  value,
  placeholder,
  label,
  dark = false,
  visibleLabel = false,
  className = "",
}: {
  name: string;
  value?: string | null;
  placeholder: string;
  label: string;
  dark?: boolean;
  visibleLabel?: boolean;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span
        className={
          visibleLabel
            ? "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            : "sr-only"
        }
      >
        {label}
      </span>
      <span className={visibleLabel ? "relative mt-2 block" : "relative block"}>
        <Search
          aria-hidden
          className={
            dark
              ? "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              : "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
          }
        />
        <input
          type="search"
          name={name}
          defaultValue={value?.trim() ?? ""}
          placeholder={placeholder}
          className={
            dark
              ? "h-11 w-full rounded-md border border-white/10 bg-brand-overlay/60 pl-9 pr-3 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              : "h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
          }
        />
      </span>
    </label>
  );
}

export function PublicFilterSelect({
  name,
  label,
  value,
  options,
  allLabel,
  dark = false,
  visibleLabel = false,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: { value: string; label: string }[];
  allLabel?: string;
  dark?: boolean;
  visibleLabel?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span
        className={
          visibleLabel
            ? "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            : "sr-only"
        }
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={value?.trim() ?? ""}
        className={
          dark
            ? "h-11 w-full rounded-md border border-white/10 bg-brand-overlay/60 px-3 text-sm font-semibold text-white outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            : `${visibleLabel ? "mt-2 " : ""}h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none ring-primary/20 transition focus:border-primary focus:ring-4`
        }
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PublicFilterButton({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="submit"
      className={
        dark
          ? "inline-flex h-11 items-center justify-center rounded-md bg-secondary px-4 text-sm font-semibold text-foreground transition hover:bg-secondary/90"
          : "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
      }
    >
      {children}
    </button>
  );
}

export function PublicFilterClearLink({
  href,
  dark = false,
}: {
  href: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        dark
          ? "inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          : "inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
      }
    >
      Clear
    </Link>
  );
}

export function PublicFactRow({ item }: { item: PublicFactItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-foreground">
          {item.label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
          {item.value}
        </span>
      </span>
    </>
  );
  const className =
    "flex w-full min-w-0 gap-3 rounded-xl p-2 transition hover:bg-primary/[0.05]";

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function PublicFactStrip({ facts }: { facts: PublicFactItem[] }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-px bg-surface-muted sm:grid-cols-2 lg:grid-cols-4">
      {facts.slice(0, 4).map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex min-h-[5rem] min-w-0 gap-3 bg-white p-4"
          >
            <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-bold uppercase leading-4 text-muted-foreground">
                {item.label}
              </span>
              <span className="mt-1 block break-words text-sm font-bold leading-5 text-foreground">
                {item.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
