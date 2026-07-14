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
import { PublicImage } from "@/components/public/public-image";

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
      className="overflow-hidden border-b border-blue-100 bg-white py-10 lg:py-12"
    >
      <div
        ref={isVisible.ref}
        data-visible={isVisible.visible ? "true" : "false"}
        className="mx-auto max-w-[1680px] px-4 transition duration-700 motion-safe:translate-y-4 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
          <div className="relative min-h-[440px] overflow-hidden bg-primary">
            <PublicImage
              src={itemImageUrl(reasons[0])}
              alt={
                contentText(reasons[0], "imageAlt") ??
                reasons[0]?.media_alt_text ??
                section.title ??
                "Kisii University"
              }
              ratio="fill"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover object-[50%_42%]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(0,61,43,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                {section.subtitle ?? "Why choose KSU"}
              </p>
              <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {section.title ?? "Why Kisii University?"}
              </h2>
              {section.description ? (
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
                  {section.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Reasons to choose KSU
            </p>
            <div className="mt-4 divide-y divide-blue-100 border-y border-blue-100">
            {reasons.map((item, index) => (
              <ReasonStatement
                key={item.id}
                item={item}
                index={index}
                active={isVisible.visible}
              />
            ))}
            </div>
          </div>
        </div>

        {facts.length ? (
          <aside className="relative mt-8 overflow-hidden bg-primary p-4 text-white sm:p-5 lg:p-6">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                {factsSection?.title ?? "KSU at a glance"}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
                {facts.map((fact, index) => {
                  const Icon = statIcons[index % statIcons.length];
                  return (
                    <div
                      key={fact.id}
                      className="group border-l border-white/15 pl-3 transition duration-300 first:border-l-0 first:pl-0 hover:-translate-y-0.5 sm:first:border-l sm:first:pl-3 lg:first:border-l-0 lg:first:pl-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
                          <CountUpValue
                            value={fact.title ?? ""}
                            active={isVisible.visible}
                            delay={index * 90}
                          />
                        </span>
                      </div>
                      <span className="mt-2 block text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-white/68">
                        {factSubtitle(fact)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/about"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 border border-white/15 bg-white px-5 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
              >
                Explore more facts
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function ReasonStatement({
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
    <div
      className="group flex gap-4 py-5 transition duration-500 hover:pl-2 motion-safe:translate-y-3 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
      data-visible={active ? "true" : "false"}
      style={{ transitionDelay: active ? `${120 + index * 85}ms` : "0ms" }}
    >
      <div>
        <span className="block font-[family-name:var(--font-display)] text-sm font-semibold text-secondary">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary ring-1 ring-blue-100 transition group-hover:bg-primary group-hover:text-white">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
          <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-slate-950">
            {item.title ?? "Kisii University advantage"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
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
      </div>
    </div>
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

function itemImageUrl(item: HomepageSectionItem) {
  return contentText(item, "imageUrl");
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
