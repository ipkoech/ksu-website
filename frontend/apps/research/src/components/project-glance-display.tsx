"use client";

import { BarChart3, Building2, CalendarDays, Coins, Network, Tags, UserRound } from "lucide-react";

export type ProjectGlanceDto = {
  label: string;
  value: string;
  caption?: string;
  icon: "calendar" | "building" | "network" | "user" | "coins" | "chart" | "tags";
};

const icons = {
  calendar: CalendarDays,
  building: Building2,
  network: Network,
  user: UserRound,
  coins: Coins,
  chart: BarChart3,
  tags: Tags,
};

export function ProjectGlanceDisplay({ cards }: { cards: ProjectGlanceDto[] }) {
  if (!cards.length) return null;
  return (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:-mt-10 lg:px-8 xl:px-10 2xl:px-12" data-server-data-display="research-project-detail">
      <dl className={`mx-auto grid max-w-[1580px] overflow-hidden rounded-2xl border border-primary/15 bg-white/95 shadow-[0_24px_65px_-42px_hsl(var(--primary)/0.7)] backdrop-blur sm:grid-cols-2 lg:grid-cols-3 ${cards.length <= 5 ? "xl:grid-cols-5" : "xl:grid-cols-7"}`}>
        {cards.map((fact) => {
          const Icon = icons[fact.icon];
          return (
            <div key={fact.label} className="flex min-h-20 gap-3 border-b border-r border-primary/10 px-4 py-3 last:border-r-0">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 line-clamp-3 break-words text-sm font-semibold leading-5 text-foreground [overflow-wrap:anywhere]">{fact.value}</dd>
                {fact.caption ? <p className="mt-1 line-clamp-1 break-words text-xs leading-4 text-muted-foreground [overflow-wrap:anywhere]">{fact.caption}</p> : null}
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
