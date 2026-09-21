"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type PartnerRelationshipDto = {
  id: string;
  title: string;
  href: string;
  meta: string;
};

export type PartnerRelationshipGroupDto = {
  title: string;
  records: PartnerRelationshipDto[];
};

export function PartnerRelationshipsDisplay({ groups }: { groups: PartnerRelationshipGroupDto[] }) {
  const visibleGroups = groups.filter((group) => group.records.length > 0);
  if (visibleGroups.length === 0) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-server-data-display="research-partner-detail">
      {visibleGroups.map((group) => (
        <section key={group.title} className="min-w-0 rounded-lg border border-border bg-surface-subtle p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold text-primary">{group.title}</h3><span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-muted-foreground">{group.records.length}</span></div>
          <div className="divide-y divide-border rounded-md border border-border bg-white">
            {group.records.slice(0, 5).map((record) => <Link key={record.id} href={record.href} className="group flex items-start justify-between gap-3 px-3 py-3"><span className="min-w-0"><span className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{record.title}</span><span className="mt-1 line-clamp-1 text-xs text-muted-foreground">{record.meta}</span></span><ArrowRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary" /></Link>)}
          </div>
        </section>
      ))}
    </div>
  );
}
