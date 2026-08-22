import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  FilePenLine,
  GraduationCap,
  Headphones,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

type ImmediateAction = {
  label: string;
  href: string;
  description?: string;
};

/** Used only for the slots the CMS has not filled. */
const fallbackActions: ImmediateAction[] = [
  {
    label: "Apply now",
    href: "/admissions/how-to-apply",
    description: "Start your application",
  },
  {
    label: "Find a programme",
    href: "/academics/programmes",
    description: "Explore study options",
  },
  {
    label: "Admissions guide",
    href: "/admissions",
    description: "Requirements and key steps",
  },
  {
    label: "Student portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    description: "Access student services",
  },
  {
    label: "Contact us",
    href: "/contact",
    description: "Find the right office",
  },
];

const icons: LucideIcon[] = [
  FilePenLine,
  GraduationCap,
  BookOpenText,
  LogIn,
  Headphones,
];

function actionFromItem(item: HomepageSectionItem): ImmediateAction | null {
  const label = item.cta_label?.trim() || item.title?.trim();
  const href = item.cta_url?.trim();
  if (!label || !href) return null;
  return {
    label,
    href,
    description:
      item.cta_description?.trim() ||
      item.subtitle?.trim() ||
      item.body_text?.trim() ||
      undefined,
  };
}

function resolveActions(section?: HomepageSection): ImmediateAction[] {
  const managed = (section?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    )
    .map(actionFromItem)
    .filter((action): action is ImmediateAction => action !== null);

  const seen = new Set(managed.map((action) => action.href));
  return [
    ...managed,
    ...fallbackActions.filter((action) => !seen.has(action.href)),
  ].slice(0, 5);
}

/**
 * The service band: five routes that cover almost every reason a visitor
 * arrives. Deep navy and deliberately compact — it is a signpost between two
 * editorial sections, not a section in its own right.
 */
export function ImmediateActionsSection({
  section,
}: {
  section?: HomepageSection;
}) {
  const actions = resolveActions(section);

  return (
    <section
      aria-labelledby="immediate-actions-heading"
      className="relative z-10 bg-primary text-white"
    >
      <div className="ksu-shell py-8 lg:py-9">
        <h2
          id="immediate-actions-heading"
          className="ksu-l-card font-normal text-white"
        >
          Start your journey
        </h2>

        {/* Desktop lays the five routes out in one horizontal row; below that
            they wrap two-up, and single-column on the narrowest screens.
            Nothing is clipped or scrolled away at any width. */}
        <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-0">
          {actions.map((action, index) => {
            const Icon = icons[index] ?? ArrowRight;
            const external = /^https?:\/\//.test(action.href);
            const className = cn(
              "group flex min-h-11 w-full min-w-0 items-center gap-3 py-3 text-white transition-colors duration-200 hover:text-secondary",
              // Hairline separators between the desktop columns only.
              index > 0 && "lg:border-l lg:border-white/20 lg:pl-6",
              index < actions.length - 1 && "lg:pr-6",
              focusVisibleStyles.white,
            );
            const content = (
              <>
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {action.label}
                  </span>
                  {action.description ? (
                    <span className="ksu-l-small block truncate text-white/65">
                      {action.description}
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-secondary"
                  aria-hidden
                />
              </>
            );

            return (
              <li key={`${action.href}-${action.label}`} className="min-w-0">
                {external ? (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <Link href={action.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ImmediateActionsSection;
