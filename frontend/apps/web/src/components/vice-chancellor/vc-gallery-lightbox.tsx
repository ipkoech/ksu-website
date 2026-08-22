"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VcPublicMedia } from "@ksu/api-client";

export type GalleryImage = Pick<
  VcPublicMedia,
  "id" | "url" | "alt_text" | "caption"
>;

/**
 * The alt text on these records is machine-written and ends on a counter —
 * "KSU Top Achievers Dinner — official Kisii University activity image 3".
 * The leading clause is the occasion and is worth showing; the tail is
 * bookkeeping and is not. Splitting on the em dash recovers the useful half.
 */
function occasionOf(image: GalleryImage) {
  const alt = image.alt_text?.trim();
  if (!alt) return null;
  const [lead] = alt.split(/\s+—\s+/);
  return lead?.trim() || null;
}

/**
 * The tile pattern.
 *
 * These records carry no intrinsic width or height, so the grid cannot be
 * driven by real aspect ratios and the rhythm has to be authored. The cycle is
 * eight tiles long and deliberately never repeats a row shape back to back, so
 * a wall of thirty-odd images reads as composed rather than tiled. Column and
 * row spans are held in one place because the pattern is the design here.
 */
const TILE_PATTERN = [
  "col-span-2 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
] as const;

export function VcGalleryLightbox({
  images: supplied,
}: {
  images: GalleryImage[];
}) {
  // A record with no URL has nothing to show; dropping it keeps the tile
  // pattern unbroken rather than rendering an empty frame in the wall.
  const images = supplied.filter(
    (image): image is GalleryImage & { url: string } => Boolean(image.url),
  );
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  const open = index !== null;
  const current = open ? images[index] : null;

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setIndex(null), []);
  const openAt = useCallback((position: number) => {
    // Recorded here rather than in the effect: by the time the effect runs,
    // focus has already moved and the opening tile is no longer active.
    returnFocusRef.current = document.activeElement;
    setIndex(position);
  }, []);
  const step = useCallback(
    (delta: number) =>
      setIndex((value) =>
        value === null
          ? value
          : (value + delta + images.length) % images.length,
      ),
    [images.length],
  );

  // Lock the page behind the viewer, trap Tab inside it, drive the arrows from
  // the keyboard, and hand focus back to the tile that opened it.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      (returnFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, close, step]);

  if (!images.length) return null;

  const occasion = current ? occasionOf(current) : null;

  return (
    <>
      {/* Image-only tiles. The grid is dense so the authored spans backfill
          rather than leaving holes when a wide tile cannot start a row. */}
      <ul className="grid auto-rows-[8.5rem] grid-flow-dense grid-cols-2 gap-2 sm:auto-rows-[10rem] sm:gap-3 md:grid-cols-4">
        {images.map((image, position) => (
          <li
            key={image.id}
            className={TILE_PATTERN[position % TILE_PATTERN.length]}
          >
            <button
              type="button"
              onClick={() => openAt(position)}
              aria-label={`Open image ${position + 1} of ${images.length}${
                occasionOf(image) ? ` — ${occasionOf(image)}` : ""
              }`}
              className="group relative block size-full overflow-hidden bg-surface-subtle ring-1 ring-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.06] motion-reduce:transform-none"
              />
              {/* The expand affordance: a wash and a mark that only arrive on
                  hover or keyboard focus, so the wall itself stays uncaptioned. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/35 group-focus-visible:bg-primary/35"
              />
              <span
                aria-hidden
                className="absolute bottom-2.5 right-2.5 grid size-8 place-items-center bg-white/95 text-primary opacity-0 transition-[opacity,transform] duration-300 motion-safe:translate-y-1 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0 motion-reduce:transform-none"
              >
                <Expand className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && current && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={
                occasion
                  ? `${occasion} — image ${index + 1} of ${images.length}`
                  : `Image ${index + 1} of ${images.length}`
              }
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[hsl(var(--brand-overlay)/.94)] backdrop-blur-sm"
            >
              {/* The backdrop is its own layer rather than a click test on the
              wrapper: the flex centring means the wrapper's padding and the
              gutters beside the panel are all still the wrapper itself, so a
              target check would miss most of the area that reads as "outside". */}
              <button
                type="button"
                aria-label="Close viewer"
                tabIndex={-1}
                onClick={close}
                className="fixed inset-0 cursor-default focus:outline-none"
              />
              {/* 70% of the viewport on desktop, 94% × 82% on small screens. */}
              <div
                ref={panelRef}
                className="relative z-10 flex h-[82svh] w-[94vw] flex-col md:h-[70svh] md:w-[70vw]"
              >
                {/* The photograph is centred in the panel rather than filling
                    it. Every image in this album is landscape, so on a portrait
                    viewport a full-height frame would band the picture with dead
                    space above and below. The panel keeps its specified size;
                    the image is centred within it and the controls anchor to the
                    panel, so they stay put as the picture changes shape. */}
                <div className="relative flex min-h-0 flex-1 items-center justify-center">
                  <Image
                    key={current.id}
                    src={current.url}
                    alt={current.alt_text || occasion || "Gallery image"}
                    fill
                    sizes="(min-width: 768px) 70vw, 94vw"
                    className="object-contain"
                    priority
                  />

                  <button
                    type="button"
                    ref={closeRef}
                    onClick={close}
                    aria-label="Close viewer"
                    className="absolute right-3 top-3 grid size-11 place-items-center bg-black/55 text-white transition-colors duration-200 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="size-5" aria-hidden />
                  </button>

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-black/55 text-white transition-colors duration-200 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronLeft className="size-5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-black/55 text-white transition-colors duration-200 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <ChevronRight className="size-5" aria-hidden />
                      </button>
                    </>
                  ) : null}
                </div>

                {/* Caption and position, shown only here. `caption` is null on every
                record today, so the occasion carries the line and the caption
                slot takes over the moment the studio fills it in. */}
                <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-4 text-white">
                  <p className="min-w-0 text-sm leading-6 text-white/85">
                    {current.caption || occasion}
                  </p>
                  <p
                    aria-live="polite"
                    className="shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary"
                  >
                    {index + 1} / {images.length}
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
