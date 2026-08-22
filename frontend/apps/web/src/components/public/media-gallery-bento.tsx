"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  PlayCircle,
  X,
} from "lucide-react";

export type MediaGalleryBentoItem = {
  id: string;
  type: "image" | "video" | "file";
  title: string;
  description?: string | null;
  url?: string | null;
  href: string;
  span: string;
};

function GalleryMedia({
  item,
  className,
  onClick,
  priority = false,
}: {
  item: MediaGalleryBentoItem;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isBuffering, setIsBuffering] = useState(item.type === "video");

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "80px", threshold: 0.1 },
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [item.type]);

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current) return;

    if (!isInView) {
      videoRef.current.pause();
      return;
    }

    const video = videoRef.current;
    const play = async () => {
      try {
        if (video.readyState >= 3) {
          setIsBuffering(false);
          await video.play();
          return;
        }
        setIsBuffering(true);
        video.oncanplay = async () => {
          setIsBuffering(false);
          await video.play().catch(() => undefined);
        };
      } catch {
        setIsBuffering(false);
      }
    };

    void play();
  }, [isInView, item.type]);

  if (item.type === "video" && item.url) {
    return (
      <div className={`relative overflow-hidden bg-brand-overlay ${className ?? ""}`}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          onClick={onClick}
          playsInline
          muted
          loop
          preload="metadata"
        >
          <source src={item.url} />
        </video>
        {isBuffering ? (
          <div className="absolute inset-0 grid place-items-center bg-black/15">
            <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        ) : null}
      </div>
    );
  }

  if (item.type === "image" && item.url) {
    return (
      <Image
        src={item.url}
        alt={item.title}
        fill
        priority={priority}
        sizes="(min-width: 1280px) 38vw, (min-width: 768px) 54vw, 100vw"
        className={`object-cover ${className ?? ""}`}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-primary/10 text-primary ${className ?? ""}`}
      onClick={onClick}
    >
      <FileText className="h-10 w-10" aria-hidden />
    </div>
  );
}

function GalleryModal({
  selectedItem,
  items,
  onClose,
  onSelect,
}: {
  selectedItem: MediaGalleryBentoItem;
  items: MediaGalleryBentoItem[];
  onClose: () => void;
  onSelect: (item: MediaGalleryBentoItem) => void;
}) {
  const selectedIndex = items.findIndex((item) => item.id === selectedItem.id);
  const selectOffset = (offset: number) => {
    const nextIndex = (selectedIndex + offset + items.length) % items.length;
    const nextItem = items[nextIndex];
    if (nextItem) onSelect(nextItem);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] grid place-items-center bg-brand-overlay/75 p-3 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Expanded view: ${selectedItem.title}`}
        onClick={onClose}
      >
        <motion.div
          className="relative grid h-[82vh] w-[94vw] grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[70vh] sm:w-[70vw]"
          initial={{ scale: 0.98, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.98, y: 18 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-primary shadow-sm backdrop-blur transition-colors hover:bg-white"
            aria-label="Close gallery preview"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <div className="relative min-h-0 bg-brand-overlay">
            <AnimatePresence mode="wait">
              <motion.figure
                key={selectedItem.id}
                className="relative h-full w-full overflow-hidden bg-brand-overlay"
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 22, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                <GalleryMedia item={selectedItem} className="absolute inset-0 object-contain" priority />
              </motion.figure>
            </AnimatePresence>
            {items.length > 1 ? <>
              <button type="button" onClick={() => selectOffset(-1)} className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-2xl bg-white/90 text-primary shadow-sm hover:bg-white" aria-label="Previous image"><ChevronLeft aria-hidden className="h-5 w-5" /></button>
              <button type="button" onClick={() => selectOffset(1)} className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-2xl bg-white/90 text-primary shadow-sm hover:bg-white" aria-label="Next image"><ChevronRight aria-hidden className="h-5 w-5" /></button>
            </> : null}
          </div>
          <figcaption className="border-t border-primary/10 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="font-[family-name:var(--font-display)] text-xl font-normal leading-tight text-primary sm:text-2xl">{selectedItem.title}</h2>{selectedItem.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{selectedItem.description}</p> : null}</div>
              <span className="shrink-0 text-xs font-bold text-muted-foreground">{selectedIndex + 1} / {items.length}</span>
            </div>
          </figcaption>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function MediaGalleryBento({
  items,
  title,
  description,
  compact = false,
}: {
  items: MediaGalleryBentoItem[];
  title: string;
  description: string;
  compact?: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<MediaGalleryBentoItem | null>(null);
  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
      const index = items.findIndex((item) => item.id === selectedItem.id);
      if (event.key === "ArrowRight") setSelectedItem(items[(index + 1) % items.length] ?? null);
      if (event.key === "ArrowLeft") setSelectedItem(items[(index - 1 + items.length) % items.length] ?? null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [items, selectedItem]);

  if (!items.length) {
    return (
      <article className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted-foreground">
        No gallery records are currently published.
      </article>
    );
  }

  return (
    <section className={compact ? "min-w-0" : "rounded-2xl border border-border bg-white p-4 ring-1 ring-primary/10 sm:p-5 lg:p-6"}>
      {!compact ? <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
          Gallery
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-normal leading-tight tracking-tight text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div> : null}

      <motion.div
        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${compact ? "auto-rows-[88px] sm:auto-rows-[100px]" : "auto-rows-[130px] sm:auto-rows-[110px]"}`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
      >
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            className={`group relative overflow-hidden rounded-2xl bg-surface-muted text-left outline-none ring-primary/35 transition focus-visible:ring-2 ${item.span}`}
            onClick={() => setSelectedItem(item)}
            variants={{
              hidden: { y: 42, scale: 0.94, opacity: 0 },
              visible: {
                y: 0,
                scale: 1,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 340,
                  damping: 25,
                  delay: index * 0.025,
                },
              },
            }}
            whileHover={{ scale: 1.015 }}
          >
            <GalleryMedia item={item} className="absolute inset-0" priority={index < 2} />
            {item.type === "video" ? (
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
                <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                Video
              </div>
            ) : null}
            <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 aria-hidden className="h-4 w-4" /></span>
          </motion.button>
        ))}
      </motion.div>

      {selectedItem ? (
        <GalleryModal
          selectedItem={selectedItem}
          items={items}
          onSelect={setSelectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </section>
  );
}
