import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AboutNavItem = {
  title: string;
  href: string;
  description?: string;
  action?: string;
  icon: LucideIcon;
};

export function AboutSidebarNav({
  items,
  title = "Explore About",
  ariaLabel = "About section links",
  className = "",
}: {
  items: AboutNavItem[];
  title?: string;
  ariaLabel?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={`rounded-2xl ring-1 ring-primary/10 bg-white p-4 ${className}`}
    >
      <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-muted-foreground transition-[background-color,border-color] duration-200 hover:border-primary/20 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">{item.title}</span>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 text-muted-foreground/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
