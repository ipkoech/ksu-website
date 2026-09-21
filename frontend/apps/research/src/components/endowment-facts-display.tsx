"use client";

import { BadgeDollarSign, CircleDollarSign, Gift, TrendingUp } from "lucide-react";

export type EndowmentFactDto = {
  label: string;
  value: string;
  icon: "money" | "current" | "target" | "distribution";
};

const icons = { money: CircleDollarSign, current: TrendingUp, target: Gift, distribution: BadgeDollarSign };

export function EndowmentFactsDisplay({ facts }: { facts: EndowmentFactDto[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-server-data-display="research-endowment-detail">
      {facts.map((fact) => {
        const Icon = icons[fact.icon];
        return <div key={fact.label} className="rounded-lg border border-border bg-surface-subtle p-4"><Icon aria-hidden className="h-5 w-5 text-primary" /><p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{fact.label}</p><p className="mt-1 text-lg font-semibold text-foreground">{fact.value || "Not published"}</p></div>;
      })}
    </div>
  );
}
