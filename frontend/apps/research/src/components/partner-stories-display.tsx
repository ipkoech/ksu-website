"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "./research-ui";

export type PartnerStoryDto = {
  id: string;
  typeLabel: string;
  title: string;
  summary: string;
  href: string;
  partnerName: string;
  date?: string;
  badges: string[];
};

export function PartnerStoriesDisplay({ items }: { items: PartnerStoryDto[] }) {
  if (items.length === 0) return null;
  const [featured, ...rest] = items;
  return (
    <div data-server-data-display="research-partner-stories">
      <Link href={featured.href} className="group block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <StoryContent item={featured} featured />
      </Link>
      {rest.length > 0 ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rest.map((item) => <Link key={item.id} href={item.href} className="group block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"><StoryContent item={item} /></Link>)}</div> : null}
    </div>
  );
}

function StoryContent({ item, featured = false }: { item: PartnerStoryDto; featured?: boolean }) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2"><Badge>{item.typeLabel}</Badge>{item.badges.slice(0, 2).map((badge) => <Badge key={badge}>{badge}</Badge>)}</div>
        <h3 className={`${featured ? "text-2xl" : "text-lg"} mt-3 font-semibold leading-tight text-primary`}>{item.title}</h3>
        {item.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.summary}</p> : null}
      </div>
      <div className={`${featured ? "mt-5 border-t border-border pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" : "mt-4 border-t border-border pt-3"} flex items-center justify-between gap-4`}>
        <span><span className="block text-xs font-semibold uppercase text-muted-foreground">Partner</span><span className="mt-1 block text-sm font-semibold text-foreground">{item.partnerName}</span>{item.date ? <span className="mt-1 block text-xs text-muted-foreground">{item.date}</span> : null}</span>
        <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-primary" />
      </div>
    </>
  );
}
