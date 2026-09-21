"use client";

import { Badge } from "./research-ui";

export type ImpactMetricRowDto = {
  id: string;
  title: string;
  summary: string;
  category: string;
  value: string;
  period: string;
  source: string;
  linkedWork: string;
};

export function ImpactMetricTable({ records }: { records: ImpactMetricRowDto[] }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-sm" data-server-data-display="research-impact-metrics">
      <div className="border-b border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Published metric records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Linked work</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((metric) => (
              <tr key={metric.id} className="transition hover:bg-surface-subtle">
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{metric.title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{metric.summary}</p>
                </td>
                <td className="px-4 py-3"><Badge>{metric.category}</Badge></td>
                <td className="px-4 py-3 font-semibold text-primary">{metric.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{metric.period}</td>
                <td className="px-4 py-3 text-muted-foreground">{metric.source}</td>
                <td className="px-4 py-3 text-muted-foreground">{metric.linkedWork}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
