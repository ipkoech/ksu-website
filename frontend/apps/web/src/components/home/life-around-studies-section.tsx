import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { AmbientPageBackground } from "@ksu/ui";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/home/motion-primitives";
import { YouTubeFacade } from "@/components/home/youtube-facade";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

const CAMPUS_FILM = {
  id: "tv2zAL4ry08",
  title: "Kisii University Students Social Life",
};

/**
 * Where each card sits around the film, in reading order.
 *
 * The grid is four columns by three rows. The film holds the middle two
 * columns across the top two rows; four cards flank it down the outer
 * columns and two run the full width beneath. 1+1+4+1+1+2+2 fills all twelve
 * cells, so the composition never ends on a hole.
 */
const CELL_SPANS = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-4 lg:row-start-1",
  "lg:col-start-4 lg:row-start-2",
  "lg:col-span-2 lg:col-start-1 lg:row-start-3",
  "lg:col-span-2 lg:col-start-3 lg:row-start-3",
];

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

/**
 * "Life at Kisii": the students' own film at the centre, with the strands of
 * campus life arranged around it.
 *
 * Cards carry their words in a footer under the photograph rather than laid
 * over it. Text on an image is always a compromise between legibility and
 * seeing the picture; separating them lets the photograph be a photograph.
 */
export function LifeAroundStudiesSection({
  section,
}: {
  section: HomepageSection;
}) {
  const items = (section.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    )
    .slice(0, 6);

  if (items.length === 0) return null;
  const bento = items.length === 6;

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id={section.section_key}
      aria-labelledby="life-heading"
      className="overflow-hidden py-16 text-brand-overlay lg:py-24"
    >
      <div className="ksu-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[42rem]">
            <h2 id="life-heading" className="ksu-l-h2 font-normal">
              {section.title?.trim() || "Life at Kisii"}
            </h2>
            {section.description ? (
              <p className="mt-3 max-w-[56ch] text-brand-overlay/65">
                {section.description}
              </p>
            ) : null}
          </div>
          <Link
            href="/campus-life"
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 font-medium text-secondary",
              focusVisibleStyles.primary,
            )}
          >
            Explore campus life
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        </Reveal>

        {/* Desktop: the film centred, cards around it. */}
        <RevealGroup
          as="div"
          stagger={0.06}
          className="mt-10 hidden auto-rows-[15.5rem] gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(0,15.5rem))]"
        >
          <RevealItem className="h-full sm:col-span-2 lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <YouTubeFacade
              id={CAMPUS_FILM.id}
              title={CAMPUS_FILM.title}
              className="h-full w-full rounded-3xl"
              sizes="(min-width: 1024px) 46vw, 100vw"
            />
          </RevealItem>

          {items.map((item, index) => (
            <RevealItem
              key={item.id}
              className={cn("h-full min-w-0", bento && CELL_SPANS[index])}
            >
              <LifeCard item={item} />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Small screens: the film first, then the cards one flick apart. */}
        <div className="mt-8 sm:hidden">
          <YouTubeFacade
            id={CAMPUS_FILM.id}
            title={CAMPUS_FILM.title}
            className="h-56 w-full rounded-3xl"
            sizes="100vw"
          />
          <ul className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="h-[17rem] w-[74vw] min-w-0 shrink-0 snap-start"
              >
                <LifeCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AmbientPageBackground>
  );
}

/**
 * Photograph on top, words in the footer beneath it. The whole card is one
 * link, so the target is the card rather than a line of text.
 */
function LifeCard({ item }: { item: HomepageSectionItem }) {
  const title = item.title?.trim() || "Campus life";
  const description = item.subtitle?.trim() || item.body_text?.trim();
  const imageSrc =
    contentText(item, "imageUrl") ??
    "/images/student-life/Life-around-studies/culture.jpg";

  const card = (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_14px_34px_-22px_hsl(var(--brand-overlay)/0.45)] ring-1 ring-brand-overlay/8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.06),0_26px_50px_-24px_hsl(var(--brand-overlay)/0.55)]">
      <ImageCurtainReveal className="relative min-h-[7.5rem] flex-1 overflow-hidden">
        <PublicImage
          src={imageSrc}
          alt={item.media_alt_text ?? ""}
          ratio="fill"
          className="absolute inset-0 h-full w-full bg-transparent"
          imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.06]"
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 74vw"
        />
      </ImageCurtainReveal>

      {/* Footer: the words live here, on their own surface, so the
          photograph never has to carry text. */}
      <div className="flex items-start gap-3 border-t border-brand-overlay/8 p-4">
        <span className="min-w-0 flex-1">
          <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
            {title}
          </span>
          {description ? (
            <span className="ksu-l-small mt-1 line-clamp-2 text-brand-overlay/60">
              {description}
            </span>
          ) : null}
        </span>
        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
          aria-hidden
        />
      </div>
    </article>
  );

  return item.cta_url ? (
    <Link
      href={item.cta_url}
      className={cn("block h-full rounded-3xl", focusVisibleStyles.primary)}
      aria-label={title}
    >
      {card}
    </Link>
  ) : (
    card
  );
}

export default LifeAroundStudiesSection;
