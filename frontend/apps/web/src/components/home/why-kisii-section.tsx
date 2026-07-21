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
import { RevealHeading } from "@/components/home/landing-motion";

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

const whyKisiiImages = [
  "/images/Home/KSUGreenLandscaping.jpg",
  "/images/Home/OurKSU-82.jpg",
  "/images/Home/um-hero.jpg",
] as const;

const institutionalReasonCopy: Record<
  string,
  {
    title: string;
    body: string;
    href: string;
    icon: string;
  }
> = {
  "academic excellence": {
    title: "A public university with academic depth",
    body: "KSU combines accredited programmes, experienced faculty and practical learning for Kenya’s workforce needs.",
    href: "/academics",
    icon: "academic",
  },
  "research & innovation": {
    title: "Research shaped by community priorities",
    body: "From agriculture and health to digital transformation, KSU turns research into practical regional impact.",
    href: "/research",
    icon: "research",
  },
  "global partnerships": {
    title: "Partnerships that open opportunity",
    body: "Strategic collaborations connect students, researchers and communities to wider networks across Africa and beyond.",
    href: "/research/partnerships",
    icon: "partnership",
  },
  "student experience": {
    title: "An inclusive student experience",
    body: "Students find academic support, leadership, clubs, sports and campus services that help them belong and progress.",
    href: "/campus-life",
    icon: "students",
  },
};

const fallbackWhyReasons: HomepageSectionItem[] = [
  {
    id: "why-ksu-public-university",
    title: "A public university with academic depth",
    body_text:
      "KSU combines accredited programmes, experienced faculty and practical learning for Kenya’s workforce needs.",
    cta_label: "Explore academics",
    cta_url: "/academics",
    display_order: 10,
    content: {
      icon: "academic",
      imageUrl: "/images/Home/OurKSU-82.jpg",
      imageAlt: "Kisii University academic community",
    },
  },
  {
    id: "why-ksu-community-research",
    title: "Research shaped by community priorities",
    body_text:
      "From agriculture and health to digital transformation, KSU turns research into practical regional impact.",
    cta_label: "Explore research",
    cta_url: "/research",
    display_order: 20,
    content: {
      icon: "research",
      imageUrl: "/images/about/about-quality-assurance-branded.webp",
      imageAlt: "Research and innovation at Kisii University",
    },
  },
  {
    id: "why-ksu-partnerships",
    title: "Partnerships that open opportunity",
    body_text:
      "Strategic collaborations connect students, researchers and communities to wider networks across Africa and beyond.",
    cta_label: "View partnerships",
    cta_url: "/research/partnerships",
    display_order: 30,
    content: {
      icon: "partnership",
      imageUrl: "/images/HERIAfricaLaunch.jpg",
      imageAlt: "Kisii University partnership launch",
    },
  },
  {
    id: "why-ksu-student-experience",
    title: "An inclusive student experience",
    body_text:
      "Students find academic support, leadership, clubs, sports and campus services that help them belong and progress.",
    cta_label: "Explore campus life",
    cta_url: "/campus-life",
    display_order: 40,
    content: {
      icon: "students",
      imageUrl: "/images/backgrounds/KSUB-RollPhotos2025-123.jpg",
      imageAlt: "Kisii University students",
    },
  },
];

export function WhyKisiiSection({
  section,
  factsSection,
}: WhyKisiiSectionProps) {
  const isVisible = useInViewport<HTMLDivElement>();
  const reasons = useMemo(() => whyReasonItems(section), [section]);
  const facts = useMemo(
    () => displayItems(factsSection).slice(0, 7),
    [factsSection],
  );

  return (
    <section
      id={section.section_key}
      className="overflow-hidden border-b border-border bg-white/[0.82] py-8 backdrop-blur-[1px] lg:py-10"
    >
      <div
        ref={isVisible.ref}
        data-visible={isVisible.visible ? "true" : "false"}
        className="mx-auto max-w-[1680px] px-4 transition duration-700 motion-safe:translate-y-4 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <header className="grid gap-3 border-b border-border pb-5 lg:grid-cols-12 lg:items-end lg:gap-6">
          <div className="lg:col-span-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              {section.subtitle ?? "Why choose KSU"}
            </p>
            <RevealHeading className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              {section.title ?? "Why Kisii University?"}
            </RevealHeading>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            {section.description ? (
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                {section.description}
              </p>
            ) : (
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Kisii University brings together public-service education,
                applied research and inclusive student support for learners and
                communities in Kenya and beyond.
              </p>
            )}
          </div>
        </header>

        <div className="mt-5 grid gap-x-5 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-8 lg:gap-3">
          <MosaicImage
            fallbackSrc={whyKisiiImages[0]}
            fallbackTitle="Kisii University's green campus"
            className="hidden lg:col-span-5 lg:row-span-5 lg:block"
            sizes="(min-width: 1024px) 40vw, 0px"
            priority
          />
          <div className="border-b border-border sm:pr-4 lg:col-span-4 lg:row-span-2 lg:border-t lg:border-b-0 lg:pr-5">
            <ReasonStatement
              item={reasons[0]}
              index={0}
              active={isVisible.visible}
            />
          </div>
          <MosaicImage
            fallbackSrc={whyKisiiImages[1]}
            fallbackTitle="The Kisii University community"
            className="hidden lg:col-span-3 lg:row-span-3 lg:block"
            sizes="(min-width: 1024px) 25vw, 0px"
          />
          <div className="border-b border-border sm:pl-4 lg:col-span-4 lg:row-span-3 lg:border-t lg:border-b-0 lg:pl-0 lg:pr-5">
            <ReasonStatement
              item={reasons[1]}
              index={1}
              active={isVisible.visible}
            />
          </div>
          <div className="border-b border-border sm:pr-4 lg:col-span-4 lg:row-span-3 lg:border-y lg:pr-5">
            <ReasonStatement
              item={reasons[2]}
              index={2}
              active={isVisible.visible}
            />
          </div>
          <MosaicImage
            fallbackSrc={whyKisiiImages[2]}
            fallbackTitle="Kisii University administration building"
            className="hidden lg:col-span-4 lg:row-span-3 lg:block"
            sizes="(min-width: 1024px) 32vw, 0px"
          />
          <div className="border-b border-border sm:pl-4 lg:col-span-4 lg:row-span-5 lg:flex lg:items-center lg:border-y lg:pl-5">
            <ReasonStatement
              item={reasons[3]}
              index={3}
              active={isVisible.visible}
            />
          </div>
        </div>

        {facts.length ? (
          <aside className="mt-5 border-y border-border py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-secondary lg:max-w-32">
                {factsSection?.title ?? "KSU at a glance"}
              </p>
              <div className="flex flex-1 snap-x gap-3 overflow-x-auto lg:grid lg:grid-cols-7 lg:overflow-visible">
                {facts.slice(0, 7).map((fact, index) => {
                  const Icon = statIcons[index % statIcons.length];
                  return (
                    <div
                      key={fact.id}
                      className="group flex min-w-40 snap-start items-center gap-2.5 text-primary transition duration-300 hover:-translate-y-0.5 lg:min-w-0"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent ring-1 ring-border">
                        <Icon className="h-[18px] w-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-[family-name:var(--font-display)] text-xl font-semibold leading-none lg:text-2xl">
                          <CountUpValue
                            value={fact.title ?? ""}
                            active={isVisible.visible}
                            delay={index * 90}
                          />
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-muted-foreground">
                          {factSubtitle(fact)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/about"
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Explore facts
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
      className="group flex gap-3 py-3 transition duration-500 hover:pl-1 motion-safe:translate-y-3 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
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
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary ring-1 ring-border transition group-hover:bg-primary group-hover:text-white">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-foreground">
              {item.title ?? "Kisii University advantage"}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
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

function MosaicImage({
  item,
  fallbackSrc,
  fallbackTitle,
  className,
  sizes,
  priority = false,
}: {
  item?: HomepageSectionItem;
  fallbackSrc: string;
  fallbackTitle?: string | null;
  className: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-accent ${className}`}>
      <PublicImage
        src={contentText(item, "imageUrl") ?? fallbackSrc}
        alt={
          contentText(item, "imageAlt") ??
          item?.media_alt_text ??
          item?.title ??
          fallbackTitle ??
          "Kisii University"
        }
        ratio="fill"
        priority={priority}
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition duration-700 hover:scale-[1.03]"
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.22))]" />
    </div>
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

function whyReasonItems(section: HomepageSection) {
  const items = displayItems(section)
    .slice(0, 4)
    .map(institutionalizeReasonCopy);
  const existingTitles = new Set(
    items.map((item) => normalizeTitle(item.title)).filter(Boolean),
  );
  const fillers = fallbackWhyReasons.filter(
    (item) => !existingTitles.has(normalizeTitle(item.title)),
  );

  return [...items, ...fillers].slice(0, 4);
}

function institutionalizeReasonCopy(item: HomepageSectionItem) {
  const canonical = institutionalReasonCopy[normalizeTitle(item.title)];
  if (!canonical) return item;

  return {
    ...item,
    title: canonical.title,
    body_text: canonical.body,
    cta_url: item.cta_url ?? canonical.href,
    content: {
      ...(item.content ?? {}),
      icon: contentText(item, "icon") ?? canonical.icon,
    },
  };
}

function normalizeTitle(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function reasonIcon(item: HomepageSectionItem, index: number): LucideIcon {
  const key = contentText(item, "icon")?.toLowerCase();
  const fallbacks = [GraduationCap, Lightbulb, Handshake, Users];
  return (key && reasonIcons[key]) || fallbacks[index % fallbacks.length];
}

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function factSubtitle(item: HomepageSectionItem) {
  return (
    contentText(item, "label") ?? item.subtitle ?? item.body_text ?? "Fact"
  );
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
