"use client";

import { NumbersStrip, type NumberStat } from "@ksu/ui/components";

export interface NumbersFactsSectionProps {
  stats: NumberStat[];
  title?: string;
  subtitle?: string;
}

export function NumbersFactsSection({
  stats,
  title,
  subtitle,
}: NumbersFactsSectionProps) {
  if (stats.length === 0) return null;

  return (
    <NumbersStrip
      stats={stats}
      title={title}
      subtitle={subtitle}
      variant="primary"
      countDuration={2500}
    />
  );
}

export default NumbersFactsSection;
