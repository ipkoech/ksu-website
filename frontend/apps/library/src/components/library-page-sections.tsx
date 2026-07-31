"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LibraryBranch } from "@ksu/api-client";
import { LibraryHeroMotion, LibraryHeroContentMotion } from "./library-motion";

export function EditorialPageHero({
  eyebrow,
  title,
  body,
  imageSrc = "/images/library/library-exterior.jpg",
  imageAlt = "The Kisii University Library building",
  breadcrumbs,
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <LibraryHeroMotion>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.94)_0%,rgba(2,20,49,0.78)_52%,rgba(2,20,49,0.3)_100%)]" />
      <div className="relative mx-auto flex min-h-[min(520px,62vh)] max-w-[1680px] items-center px-4 py-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <LibraryHeroContentMotion>
          {breadcrumbs?.length ? (
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                  {item.href && index < breadcrumbs.length - 1 ? <Link href={item.href} className="hover:text-white">{item.label}</Link> : <span className={index === breadcrumbs.length - 1 ? "text-white" : undefined}>{item.label}</span>}
                  {index < breadcrumbs.length - 1 ? <ChevronRight aria-hidden className="h-3.5 w-3.5" /> : null}
                </span>
              ))}
            </nav>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary sm:text-sm">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-white/85 sm:text-lg">{body}</p>
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </LibraryHeroContentMotion>
      </div>
    </LibraryHeroMotion>
  );
}

export function EditorialSection({
  eyebrow,
  title,
  body,
  tone = "white",
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: "white" | "soft";
  children: ReactNode;
}) {
  return (
    <section className={tone === "soft" ? "border-y border-border bg-surface-subtle px-4 py-14 sm:px-6 lg:px-8" : "bg-white px-4 py-14 sm:px-6 lg:px-8"}>
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary sm:text-sm">{eyebrow}</p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-5xl">{title}</h2>
          {body ? <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">{body}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export type TabItem = { id: string; label: string; content: ReactNode };

export function TabSet({ tabs, defaultTab }: { tabs: TabItem[]; defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  if (!active) return null;

  return (
    <div>
      <div role="tablist" aria-label="Library information" className="flex flex-wrap border-b border-border">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={tab.id === active.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`min-h-11 border-b-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${tab.id === active.id ? "border-secondary text-primary" : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div id={`panel-${active.id}`} role="tabpanel" aria-labelledby={active.id} className="pt-6 text-sm leading-7 text-muted-foreground">{active.content}</div>
    </div>
  );
}

export type DisclosureItem = { id: string; title: string; content: ReactNode };

export function DisclosureList({ items }: { items: DisclosureItem[] }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? "");
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div key={item.id}>
            <button type="button" aria-expanded={open} aria-controls={`disclosure-${item.id}`} onClick={() => setOpenId(open ? "" : item.id)} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
              {item.title}
              <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open ? <div id={`disclosure-${item.id}`} className="pb-5 pr-8 text-sm leading-7 text-muted-foreground">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function BranchContactRow({ branch, selected, onSelect }: { branch: LibraryBranch; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(branch.id)} className={`flex w-full items-center justify-between gap-4 border-b border-border px-3 py-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${selected ? "border-l-4 border-l-secondary bg-primary/5 text-primary" : "hover:bg-surface-subtle"}`}>
      <span><span className="block text-sm font-semibold">{branch.name}</span><span className="mt-1 block text-xs text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</span></span>
      <ChevronRight aria-hidden className="h-4 w-4 shrink-0" />
    </button>
  );
}

export function TextActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">{children}<ArrowRight aria-hidden className="h-4 w-4" /></Link>;
}
