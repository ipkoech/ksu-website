import Link from "next/link";
import type { ReactNode } from "react";
import {
  Badge,
  Card,
  CardTitle,
  FilledBadge,
  PageIntro,
  PrimaryLink,
  SecondaryLink,
  Section,
  StatusBadge,
  StatusMessage,
  cardInteractive,
  cardSurface,
} from "@ksu/ui/public";
import type { SectionDensity } from "@ksu/ui/public";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Handshake,
  Lightbulb,
  Menu,
  Newspaper,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Research-app aliases over the shared public primitives (@ksu/ui/public).
   Keep the Research* names so existing imports stay stable; new code can
   import from @ksu/ui/public directly. */

export {
  Badge,
  Card,
  CardTitle,
  FilledBadge,
  PrimaryLink,
  SecondaryLink,
  StatusBadge,
  StatusMessage,
  cardInteractive,
  cardSurface,
};
export const ResearchPageIntro = PageIntro;
export const ResearchSection = Section;
export type ResearchSectionDensity = SectionDensity;

type IconName =
  | "award"
  | "book"
  | "calendar"
  | "flask"
  | "handshake"
  | "lightbulb"
  | "menu"
  | "news"
  | "search"
  | "target"
  | "users"
  | "x";

const iconMap: Record<IconName, LucideIcon> = {
  award: Award,
  book: BookOpen,
  calendar: CalendarDays,
  flask: FlaskConical,
  handshake: Handshake,
  lightbulb: Lightbulb,
  menu: Menu,
  news: Newspaper,
  search: Search,
  target: Target,
  users: Users,
  x: X,
};

export function IconCard({
  icon,
  title,
  body,
  href,
  action = "Open",
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  href?: string;
  action?: string;
  children?: ReactNode;
}) {
  const Icon = iconMap[icon];
  const content = (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="mt-5">
        <CardTitle>{title}</CardTitle>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
      {children}
      {href ? (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
          {action}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition group-hover:translate-x-1"
          />
        </span>
      ) : null}
    </>
  );
  const className = `flex min-h-[230px] flex-col ${href ? `group ${cardInteractive}` : cardSurface}`;

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
