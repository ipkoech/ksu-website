"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { HomepageSection } from "@/lib/homepage-sections";

interface PillarCard {
  id: string;
  /** Heading rendered as two lines. */
  headingLines: [string, string];
  body: string;
}

const fallbackPillars: PillarCard[] = [
  {
    id: "teaching",
    headingLines: ["Learning that prepares", "you for real work"],
    body: "Eight schools deliver programmes shaped with employers and professional bodies, so what you learn on campus is what the world is hiring for.",
  },
  {
    id: "research",
    headingLines: ["Knowledge that solves", "local problems"],
    body: "From food security to public health, our researchers work on the questions that matter to Kenya and the region. They publish answers the world can use.",
  },
  {
    id: "community",
    headingLines: ["A university that serves", "its community"],
    body: "Extension services, enterprise support, and partnerships that carry the university's work beyond the gate: into farms, schools, and county programmes.",
  },
];

/** Split a title near its midpoint into the card's two heading lines. */
function toHeadingLines(title: string): [string, string] {
  const words = title.split(" ");
  if (words.length < 3) return [title, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const CLAMP_LENGTH = 170;

/* Card surface: a deeper shade of the navy ground, not neutral black. */
const cardSurface = "color-mix(in srgb, hsl(var(--brand-overlay)) 72%, black)";

/**
 * One mandate, three promises — the black benefits band: text card with an
 * off-canvas glow, a video card fading into its surface, and a bottom-pinned
 * text card. Long CMS copy collapses behind a read-more toggle.
 */
export function FlowFeaturesSection({
  section,
}: {
  section?: HomepageSection;
}) {
  const pillars = useMemo<PillarCard[]>(() => {
    const items = (section?.items ?? [])
      .filter((item) => item.is_enabled !== false)
      .sort(
        (first, second) =>
          (first.display_order ?? 100) - (second.display_order ?? 100),
      )
      .slice(0, 3);
    if (items.length === 0) return fallbackPillars;
    return items.map((item, index) => {
      const fallback = fallbackPillars[index] ?? fallbackPillars[0];
      return {
        id: item.id || fallback.id,
        headingLines: item.title ? toHeadingLines(item.title) : fallback.headingLines,
        body: item.body_text ?? fallback.body,
      };
    });
  }, [section]);

  const [first, second, third] = [
    pillars[0] ?? fallbackPillars[0],
    pillars[1] ?? fallbackPillars[1],
    pillars[2] ?? fallbackPillars[2],
  ];

  // One card expanded at a time: opening one collapses the other.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <section
      id="mandate-pillars"
      aria-labelledby="mandate-pillars-heading"
      className="ksu-band relative z-10 -mt-[28px] w-full rounded-t-[28px] px-4 sm:px-6 md:px-10"
      style={{ backgroundColor: "hsl(var(--brand-overlay))" }}
    >
      <div className="mx-auto w-full max-w-[1680px]">
        <h2
          id="mandate-pillars-heading"
          className="ksu-d2 mb-10 text-center font-[family-name:var(--font-display)] font-normal text-white sm:mb-14"
        >
          One mandate. <em className="italic">Three promises.</em>
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          {/* Card 1 — text, glow entering from the left */}
          <article className="relative min-h-[380px] overflow-hidden rounded-3xl p-6 sm:min-h-[460px] sm:p-8"
            style={{ backgroundColor: cardSurface }}>
            <div
              className="absolute -left-[420px] top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-primary opacity-30 blur-3xl"
              aria-hidden
            />
            <div className="relative z-10 flex h-full flex-col">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-medium leading-tight text-white sm:text-2xl">
                {first.headingLines[0]}
                {first.headingLines[1] ? (
                  <>
                    <br />
                    {first.headingLines[1]}
                  </>
                ) : null}
              </h3>
              <ExpandableBody
                text={first.body}
                expanded={expandedId === first.id}
                onToggle={() => toggle(first.id)}
                className="mt-12 max-w-[280px] sm:mt-20"
              />
            </div>
          </article>

          {/* Card 2 — video fading into the surface */}
          <article className="relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl sm:min-h-[460px]"
            style={{ backgroundColor: cardSurface }}>
            <div className="relative h-[285px] w-full shrink-0 overflow-hidden sm:h-[345px]">
              <Image
                src="/images/landing-page/why-kisii/sakgwa-academic-block.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
                style={{ background: `linear-gradient(to bottom, transparent, ${cardSurface})` }}
                aria-hidden
              />
            </div>
            <div className="flex flex-1 items-center justify-start p-6 sm:p-8">
              <div>
                <h3 className="text-left font-[family-name:var(--font-display)] text-xl font-medium leading-tight text-white sm:text-2xl">
                  {second.headingLines[0]}
                  {second.headingLines[1] ? (
                    <>
                      <br />
                      {second.headingLines[1]}
                    </>
                  ) : null}
                </h3>
                <ExpandableBody
                  text={second.body}
                  expanded={expandedId === second.id}
                  onToggle={() => toggle(second.id)}
                  className="mt-4 max-w-[320px]"
                />
              </div>
            </div>
          </article>

          {/* Card 3 — text, glow in the top-right, body pinned to the bottom */}
          <article className="relative min-h-[380px] overflow-hidden rounded-3xl p-6 sm:min-h-[460px] sm:p-8"
            style={{ backgroundColor: cardSurface }}>
            <div
              className="absolute -right-28 -top-28 h-56 w-56 rounded-full bg-primary opacity-30 blur-3xl"
              aria-hidden
            />
            <div className="relative z-10 flex h-full flex-col">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-medium leading-tight text-white sm:text-2xl">
                {third.headingLines[0]}
                {third.headingLines[1] ? (
                  <>
                    <br />
                    {third.headingLines[1]}
                  </>
                ) : null}
              </h3>
              <ExpandableBody
                text={third.body}
                expanded={expandedId === third.id}
                onToggle={() => toggle(third.id)}
                className="mt-auto max-w-[320px]"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/**
 * Body copy that clamps past a length threshold; expansion is controlled by
 * the section so only one card is open at a time, and the card grows to
 * show the full text.
 */
function ExpandableBody({
  text,
  expanded,
  onToggle,
  className,
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const needsClamp = text.length > CLAMP_LENGTH;
  const shown =
    !needsClamp || expanded ? text : `${text.slice(0, CLAMP_LENGTH).trimEnd()}…`;

  return (
    <div className={className}>
      <p className="text-[13px] font-light leading-relaxed text-white/70 sm:text-[14px]">
        {shown}
      </p>
      {needsClamp && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-2 text-[13px] font-light text-white/50 underline underline-offset-4 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default FlowFeaturesSection;
