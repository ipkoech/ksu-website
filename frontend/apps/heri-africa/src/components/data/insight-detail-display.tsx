"use client";

import Image from "next/image";
import { CalendarDays } from "lucide-react";

export type InsightDetailDisplayProps = {
  eyebrow: string;
  title: string;
  excerpt: string | null;
  date: string | null;
  body?: string;
  image?: string | null;
  meta?: Array<{ label: string; href?: string }>;
};

export function InsightDetailDisplay({ eyebrow, title, excerpt, date, body, image, meta = [] }: InsightDetailDisplayProps) {
  return (
    <article className="mx-auto max-w-4xl px-6 py-14 lg:py-20" data-server-data-display="heri-insight-detail">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-bold leading-tight text-heri-blue sm:text-5xl">{title}</h1>
      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
        {date ? (
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-heri-teal" />
            {new Date(date).toLocaleDateString("en-US", { timeZone: "UTC" })}
          </span>
        ) : null}
        {meta.map((item) =>
          item.href ? (
            <a className="font-bold text-heri-teal underline" href={item.href} key={`${item.label}-${item.href}`}>
              {item.label}
            </a>
          ) : (
            <span key={item.label}>{item.label}</span>
          ),
        )}
      </div>
      {image ? (
        <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-3xl">
          <Image alt="" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 900px" src={image} unoptimized />
        </div>
      ) : null}
      {excerpt ? <p className="mt-10 text-xl leading-8 text-slate-600">{excerpt}</p> : null}
      {body ? <div className="prose prose-slate mt-8 max-w-none whitespace-pre-line text-base leading-8">{body}</div> : null}
    </article>
  );
}
