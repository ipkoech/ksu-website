"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

type WhyKisiiSectionProps = {
  section: HomepageSection;
  factsSection?: HomepageSection | null;
};

const reasonIcons: Record<string, LucideIcon> = {
  academic: GraduationCap,
  excellence: GraduationCap,
  partnership: Handshake,
  partnerships: Handshake,
  research: Lightbulb,
  innovation: Lightbulb,
  student: Users,
  students: Users,
};

const statIcons = [
  Users,
  BookOpenCheck,
  GraduationCap,
  Landmark,
  Lightbulb,
  Sparkles,
] satisfies LucideIcon[];

export function WhyKisiiSection({
  section,
  factsSection,
}: WhyKisiiSectionProps) {
  const isVisible = useInViewport<HTMLDivElement>();
  const reasons = useMemo(() => displayItems(section).slice(0, 4), [section]);
  const facts = useMemo(
    () => displayItems(factsSection).slice(0, 7),
    [factsSection],
  );

  return (
    <section
      id={section.section_key}
      className="overflow-hidden border-b border-blue-100 bg-white py-8 lg:py-10"
    >
      <div
        ref={isVisible.ref}
        data-visible={isVisible.visible ? "true" : "false"}
        className="mx-auto grid max-w-[1680px] gap-5 px-4 transition duration-700 motion-safe:translate-y-4 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)] lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-sm shadow-blue-100/60 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                {section.subtitle ?? "Why choose KSU"}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                {section.title ?? "Why Kisii University?"}
              </h2>
              {section.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {section.description}
                </p>
              ) : null}
            </div>
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/20 sm:flex">
              <Landmark className="h-5 w-5" aria-hidden />
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reasons.map((item, index) => (
              <ReasonCard
                key={item.id}
                item={item}
                index={index}
                active={isVisible.visible}
              />
            ))}
          </div>
        </div>

        {facts.length ? (
          <aside className="relative overflow-hidden rounded-xl bg-primary p-4 text-white shadow-sm shadow-primary/20 sm:p-5">
            <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute -bottom-20 left-6 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                {factsSection?.title ?? "KSU at a glance"}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                Proof in numbers
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {facts.map((fact, index) => {
                  const Icon = statIcons[index % statIcons.length];
                  return (
                    <div
                      key={fact.id}
                      className="group flex min-h-[62px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.075] p-2 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.11]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-secondary ring-1 ring-white/10">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-[family-name:var(--font-display)] text-lg font-semibold leading-none sm:text-xl">
                          <CountUpValue
                            value={fact.title ?? ""}
                            active={isVisible.visible}
                            delay={index * 90}
                          />
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-white/62">
                          {factSubtitle(fact)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function ReasonCard({
  item,
  index,
  active,
}: {
  item: HomepageSectionItem;
  index: number;
  active: boolean;
}) {
  const Icon = reasonIcon(item, index);
  const content = (
    <article
      className="group h-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/50 transition duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md motion-safe:translate-y-3 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
      data-visible={active ? "true" : "false"}
      style={{ transitionDelay: active ? `${120 + index * 85}ms` : "0ms" }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary ring-1 ring-blue-100 transition duration-300 group-hover:bg-primary group-hover:text-white">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-slate-950">
            {item.title ?? "Kisii University advantage"}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
            {item.body_text ?? item.subtitle}
          </p>
        </div>
      </div>
      {item.cta_url ? (
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-primary">
          {item.cta_label ?? "Learn more"}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </article>
  );

  return item.cta_url ? (
    <Link href={item.cta_url} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

function CountUpValue({
  value,
  active,
  delay = 0,
}: {
  value: string;
  active: boolean;
  delay?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const [current, setCurrent] = useState(
    reducedMotion ? (parsed.numeric ?? 0) : 0,
  );

  useEffect(() => {
    if (!active || parsed.numeric === null || Number.isNaN(parsed.numeric)) {
      return;
    }

    if (reducedMotion) {
      setCurrent(parsed.numeric);
      return;
    }

    let frame = 0;
    let timeout = 0;
    const duration = 950;

    timeout = window.setTimeout(() => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(parsed.numeric! * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [active, delay, parsed.numeric, reducedMotion]);

  if (parsed.numeric === null || Number.isNaN(parsed.numeric)) {
    return <>{parsed.text}</>;
  }

  return (
    <>
      {new Intl.NumberFormat("en-KE").format(current)}
      {parsed.suffix}
    </>
  );
}

function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function displayItems(section?: HomepageSection | null) {
  return (section?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );
}

function reasonIcon(item: HomepageSectionItem, index: number): LucideIcon {
  const key = contentText(item, "icon")?.toLowerCase();
  const fallbacks = [GraduationCap, Lightbulb, Handshake, Users];
  return (key && reasonIcons[key]) || fallbacks[index % fallbacks.length];
}

function contentText(item: HomepageSectionItem, key: string) {
  const value = item.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function factSubtitle(item: HomepageSectionItem) {
  return contentText(item, "label") ?? item.subtitle ?? item.body_text ?? "Fact";
}

function parseStatValue(value: string) {
  const match = value.trim().match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { numeric: null, suffix: "", text: value };

  return {
    numeric: Number(match[1].replace(/,/g, "")),
    suffix: match[2]?.trim() ?? "",
    text: value,
  };
}
