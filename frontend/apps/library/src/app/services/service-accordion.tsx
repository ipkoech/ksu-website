"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { StatusMessage } from "../../components/library-ui";

export type ServiceAccordionItem = {
  id: string;
  title: string;
  content: string;
  meta?: string[];
};

export function ServiceAccordion({ items }: { items: ServiceAccordionItem[] }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? "");
  if (items.length === 0) return <StatusMessage>No public services are available yet.</StatusMessage>;

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button type="button" aria-expanded={open} aria-controls={`service-${item.id}`} onClick={() => setOpenId(open ? "" : item.id)} className="flex min-h-14 w-full items-center justify-between gap-5 py-4 text-left font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
              <span>{item.title}</span>
              <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open ? <div id={`service-${item.id}`} className="pb-5 pr-8 text-sm leading-7 text-muted-foreground"><p>{item.content}</p>{item.meta?.length ? <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">{item.meta.map((value) => <li key={value}>{value}</li>)}</ul> : null}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
