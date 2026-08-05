"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { heriAfricaFrontendUrl } from "@/lib/service-urls";

export interface PartnershipChapterContent {
  id: string;
  kicker: string;
  body: string;
}

export interface PartnershipSpotlightContent {
  eyebrow?: string;
  headline?: string;
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
  chapters?: PartnershipChapterContent[];
}

const defaultContent: Required<Omit<PartnershipSpotlightContent, "chapters">> = {
  eyebrow: "Kisii University × HERI Africa",
  headline: "Building Africa together",
  summary:
    "A strategic alliance advancing research, enterprise, and community transformation across the continent.",
  imageUrl: "/logos/ksu-bck1.jpg",
  imageAlt: "The Kisii University and HERI Africa partnership",
};

const smallImage = "/images/HERIAfricaLaunch.jpg";

/** Split a headline near its midpoint for the desktop two-line break. */
function splitHeadline(headline: string): [string, string | null] {
  const words = headline.split(" ");
  if (words.length < 4) return [headline, null];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/**
 * The KSU × HERI Africa signature moment, studio-editorial style: numbered
 * badge, oversized heading, then image / summary + CTA / image aligned to a
 * shared baseline on desktop.
 */
export function StrategicPartnershipSection({
  spotlight,
}: {
  spotlight?: PartnershipSpotlightContent;
}) {
  /* Field-level fallback: CMS fields can arrive explicitly undefined, and a
     bare spread would let them clobber the defaults. */
  const content = {
    eyebrow: spotlight?.eyebrow ?? defaultContent.eyebrow,
    headline: spotlight?.headline ?? defaultContent.headline,
    summary: spotlight?.summary ?? defaultContent.summary,
    imageUrl: spotlight?.imageUrl ?? defaultContent.imageUrl,
    imageAlt: spotlight?.imageAlt ?? defaultContent.imageAlt,
  };
  const [headlineLead, headlineRest] = splitHeadline(content.headline);

  return (
    <section
      id="strategic-partnership"
      aria-labelledby="partnership-heading"
      className="overflow-hidden bg-white pb-16 pt-12 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Badge row */}
        <div className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-overlay text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            1
          </span>
          <span className="rounded-full px-3 py-1 text-[12px] font-medium text-brand-overlay sm:px-4 sm:py-1.5 sm:text-[13px]">
            {content.eyebrow}
          </span>
        </div>

        {/* Heading */}
        <h2
          id="partnership-heading"
          className="mb-10 px-5 font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,3.2rem)] font-normal leading-[1.12] tracking-[-0.02em] text-brand-overlay sm:mb-12 sm:px-8 lg:mb-16 lg:px-12"
        >
          {headlineLead}
          {headlineRest ? (
            <>
              <span className="sm:hidden"> </span>
              <br className="hidden sm:block" />
              <em className="italic">{headlineRest}</em>
            </>
          ) : null}
        </h2>

        {/* Mobile / tablet */}
        <div className="px-5 sm:px-8 lg:hidden">
          <p className="mb-6 text-[15px] font-medium leading-[1.6] text-brand-overlay sm:text-[17px]">
            {content.summary}
          </p>
          <div className="mb-8">
            <RollButton label="Visit HERI Africa" href={heriAfricaFrontendUrl} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="sm:w-[45%]">
              <div className="relative aspect-[438/346] w-full overflow-hidden rounded-xl sm:rounded-2xl">
                <PublicImage
                  src={smallImage}
                  alt="The HERI Africa launch at Kisii University"
                  ratio="fill"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover"
                  sizes="(min-width: 640px) 45vw, 100vw"
                />
              </div>
            </div>
            <div className="sm:w-[55%]">
              <div className="relative aspect-[900/600] w-full overflow-hidden rounded-xl sm:rounded-2xl">
                <PublicImage
                  src={content.imageUrl}
                  alt={content.imageAlt}
                  ratio="fill"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover"
                  sizes="(min-width: 640px) 55vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 px-5 sm:px-8 lg:grid lg:px-12 xl:gap-8">
          <div className="self-end">
            <div className="relative aspect-[438/346] w-full overflow-hidden rounded-2xl">
              <PublicImage
                src={smallImage}
                alt="The HERI Africa launch at Kisii University"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="26vw"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end self-start">
            <p className="mb-6 max-w-[34ch] text-[16px] font-medium leading-[1.65] text-brand-overlay xl:text-[18px]">
              {content.summary}
            </p>
            <div>
              <RollButton
                label="Visit HERI Africa"
                href={heriAfricaFrontendUrl}
              />
            </div>
          </div>
          <div className="self-end">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <PublicImage
                src={content.imageUrl}
                alt={content.imageAlt}
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="48vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Secondary-orange pill with the text-roll hover: the label is duplicated in
 * a clipped column that shifts up half its height, while the arrow in the
 * white circle rotates from -45° to 0°.
 */
function RollButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-3 rounded-full bg-secondary py-2 pl-5 pr-2 text-[13px] font-medium text-white transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-secondary/90 sm:pl-6 sm:text-[14px]",
        focusVisibleStyles.primary,
      )}
    >
      <span className="h-[20px] overflow-hidden">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span className="flex h-[20px] items-center">{label}</span>
          <span className="flex h-[20px] items-center" aria-hidden>
            {label}
          </span>
        </span>
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white sm:h-8 sm:w-8">
        <ArrowRight
          size={14}
          className="-rotate-45 text-secondary transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-0"
          aria-hidden
        />
      </span>
    </a>
  );
}

export default StrategicPartnershipSection;
