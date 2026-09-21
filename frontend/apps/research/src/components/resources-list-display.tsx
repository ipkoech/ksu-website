"use client";

import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "./research-ui";

export type ResourceRowDto = {
  id: string;
  title: string;
  summary: string;
  href: string;
  type: string;
  access: string;
  status: string;
  center: string;
  location: string;
  accessHref: string | null;
  accessLabel: string;
};

export function ResourcesListDisplay({ resources }: { resources: ResourceRowDto[] }) {
  return (
    <section id="resources" className="rounded-lg border border-border bg-white p-5 shadow-sm" data-server-data-display="research-resources-tools">
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Resources</p><h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Resource Library</h2></div><Link href="/resources-tools" className="text-sm font-semibold text-primary">View all</Link></div>
      {resources.length > 0 ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-3 py-3">Resource</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Access</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Managing center</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-border">{resources.slice(0, 6).map((resource) => <tr key={resource.id}><td className="px-3 py-3"><Link href={resource.href} className="flex items-start gap-2"><BookOpen aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><span className="font-semibold text-foreground">{resource.title}</span><span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{resource.summary}</span></span></Link></td><td className="px-3 py-3"><Badge>{resource.type}</Badge></td><td className="px-3 py-3 text-muted-foreground">{resource.access}</td><td className="px-3 py-3 text-muted-foreground">{resource.status}</td><td className="px-3 py-3 text-muted-foreground">{resource.center}</td><td className="px-3 py-3 text-muted-foreground">{resource.location}</td><td className="px-3 py-3">{resource.accessHref ? <a href={resource.accessHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">{resource.accessLabel}<ExternalLink aria-hidden className="h-3.5 w-3.5" /></a> : <Link href={resource.href} className="text-sm font-semibold text-primary">Details</Link>}</td></tr>)}</tbody></table></div> : <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No resource records match the current filters.</p>}
    </section>
  );
}
