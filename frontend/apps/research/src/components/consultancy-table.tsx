"use client";

import Link from "next/link";
import { ResearchImage } from "./research-image";
import { Badge } from "./research-ui";

export type ConsultancyRowDto = {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  image: string | null;
  clientName: string;
  type: string;
  status: string;
  timeline: string;
  value: string;
};

export function ConsultancyTable({ records }: { records: ConsultancyRowDto[] }) {
  if (records.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm" data-server-data-display="research-consultancies">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Consultancy</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => {
              const href = record.slug ? `/consultancies/${record.slug}` : "/consultancies";
              return (
                <tr key={record.id} className="group transition hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link href={href} className="flex items-start gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                      <ResearchImage src={record.image} alt={record.title} width={128} height={96} sizes="64px" className="mt-0.5 h-12 w-16 shrink-0 rounded-md object-cover" />
                      <span>
                        <span className="font-semibold text-foreground transition group-hover:text-primary">{record.title}</span>
                        <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{record.summary}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.clientName}</td>
                  <td className="px-4 py-3"><Badge>{record.type}</Badge></td>
                  <td className="px-4 py-3"><Badge>{record.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{record.timeline}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{record.value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
