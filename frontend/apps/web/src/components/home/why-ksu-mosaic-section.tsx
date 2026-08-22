"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

/**
 * The Why-KSU chapters rendered as one compact mosaic: a single section with
 * symmetric image tiles instead of one full-height block per chapter.
 */
export function WhyKsuMosaicSection({ section }: { section: HomepageSection }) {
  const reducedMotion = useReducedMotion();

  const items = (section.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    )
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section
      id={section.section_key}
      aria-labelledby="why-ksu-heading"
      className="border-b border-border bg-white py-12 lg:py-16"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {section.subtitle ?? "Why choose KSU"}
          </p>
          <h2
            id="why-ksu-heading"
            className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl"
          >
            {section.title ?? "Why Kisii University?"}
          </h2>
          {section.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {section.description}
            </p>
          ) : null}
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <MosaicTile
              key={item.id}
              item={item}
              index={index}
              reducedMotion={Boolean(reducedMotion)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MosaicTile({
  item,
  index,
  reducedMotion,
}: {
  item: HomepageSectionItem;
  index: number;
  reducedMotion: boolean;
}) {
  const imageSrc = contentText(item, "imageUrl") ?? "/logos/ksu-bck1.jpg";
  const imageAlt =
    contentText(item, "imageAlt") ??
    item.media_alt_text ??
    item.title ??
    "Kisii University";
  const body = item.body_text ?? item.subtitle ?? "";

  const tile = (
    <motion.article
      className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-border"
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <PublicImage
        src={imageSrc}
        alt={imageAlt}
        ratio="fill"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,20,49,0.88)_0%,rgba(2,20,49,0.42)_45%,rgba(2,20,49,0.08)_70%,transparent_100%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-xs font-bold text-secondary">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold leading-snug text-white">
          {item.title ?? "Kisii University advantage"}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-white/80">
          {body}
        </p>
        {item.cta_url ? (
          <span className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition group-hover:text-secondary">
            {item.cta_label ?? "Learn more"}
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    </motion.article>
  );

  return item.cta_url ? (
    <Link
      href={item.cta_url}
      className={cn("block rounded-3xl", focusVisibleStyles.primary)}
      aria-label={item.title ?? undefined}
    >
      {tile}
    </Link>
  ) : (
    tile
  );
}

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export default WhyKsuMosaicSection;
