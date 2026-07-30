"use client";

import { NumbersStrip, type NumberStat } from "@ksu/ui/components";

export interface NumbersFactsSectionProps {
  stats: NumberStat[];
  title?: string;
  subtitle?: string;
}

const defaultStats: NumberStat[] = [
  { value: 45000, suffix: "+", label: "Alumni", description: "Graduates worldwide" },
  { value: 18000, suffix: "+", label: "Students", description: "Currently enrolled" },
  { value: 1200, suffix: "+", label: "Staff", description: "Academic & support" },
  { value: 10, label: "Schools", description: "Academic units" },
  { value: 150, suffix: "+", label: "Programmes", description: "Certificate to PhD" },
  { value: 50, suffix: "+", label: "Research Projects", description: "Active initiatives" },
];

export function NumbersFactsSection({
  stats = defaultStats,
  title,
  subtitle,
}: NumbersFactsSectionProps) {
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
