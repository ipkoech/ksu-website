"use client";

import Link from "next/link";
import { ResearchImage } from "./research-image";
import { Badge } from "./research-ui";

export type MentorshipRowDto = {
  id: string;
  slug: string | null;
  title: string;
  summary: string;
  image: string | null;
  type: string;
  status: string;
  deadline: string;
  cohort: string;
  capacity: string;
};

export function MentorshipTable({ records }: { records: MentorshipRowDto[] }) {
  if (records.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm" data-server-data-display="research-mentorship">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Programme</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Application deadline</th>
              <th className="px-4 py-3">Cohort</th>
              <th className="px-4 py-3">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => {
              const href = record.slug ? `/mentorship/${record.slug}` : "/mentorship";
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
                  <td className="px-4 py-3"><Badge>{record.type}</Badge></td>
                  <td className="px-4 py-3"><Badge>{record.status}</Badge></td>
                  <td className="px-4 py-3"><span className="text-muted-foreground">{record.deadline}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{record.cohort}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.capacity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
