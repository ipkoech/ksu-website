"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, PlayCircle, X } from "lucide-react";

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
      <div className={`relative overflow-hidden bg-slate-950 ${className ?? ""}`}>
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
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] bg-slate-950/40 p-3 backdrop-blur-xl sm:p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/20 bg-white/75 shadow-[0_28px_90px_-38px_rgba(15,23,42,0.75)]"
          initial={{ scale: 0.98, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.98, y: 18 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
            aria-label="Close gallery preview"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <div className="grid min-h-0 flex-1 place-items-center bg-slate-50/70 p-3 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.figure
                key={selectedItem.id}
                className="relative h-full max-h-[72vh] w-full max-w-5xl overflow-hidden rounded-lg bg-slate-950 shadow-md"
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 22, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                <GalleryMedia item={selectedItem} className="absolute inset-0" priority />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 text-white sm:p-5">
                  <h2 className="max-w-3xl text-lg font-bold leading-6 sm:text-2xl">
                    {selectedItem.title}
                  </h2>
                  {selectedItem.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
                      {selectedItem.description}
                    </p>
                  ) : null}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 touch-none"
        >
          <div className="rounded-xl border border-blue-300/40 bg-sky-100/40 px-3 py-2 shadow-lg backdrop-blur-xl">
            <div className="flex items-center -space-x-2">
              {items.slice(0, 12).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-200 transition ${
                    selectedItem.id === item.id
                      ? "z-30 -translate-y-2 scale-110 ring-2 ring-white shadow-lg"
                      : "hover:z-20 hover:-translate-y-1 hover:ring-2 hover:ring-white/60"
                  }`}
                  style={{ transform: `rotate(${index % 2 === 0 ? -8 : 8}deg)` }}
                  aria-label={`Preview ${item.title}`}
                >
                  <GalleryMedia item={item} className="absolute inset-0" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function MediaGalleryBento({
  items,
  title,
  description,
}: {
  items: MediaGalleryBentoItem[];
  title: string;
  description: string;
}) {
  const [selectedItem, setSelectedItem] = useState<MediaGalleryBentoItem | null>(null);
  const [orderedItems, setOrderedItems] = useState(items);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  if (!orderedItems.length) {
    return (
      <article className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        No gallery records are currently published.
      </article>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
          Gallery
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-3 auto-rows-[76px] sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
      >
        {orderedItems.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            className={`group relative overflow-hidden rounded-xl bg-slate-100 text-left shadow-sm outline-none ring-primary/35 transition focus-visible:ring-2 ${item.span}`}
            onClick={() => {
              if (!isDragging) setSelectedItem(item);
            }}
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
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.75}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, info) => {
              setIsDragging(false);
              const moveDistance = info.offset.x + info.offset.y;
              if (Math.abs(moveDistance) <= 50) return;
              setOrderedItems((current) => {
                const next = [...current];
                const [dragged] = next.splice(index, 1);
                if (!dragged) return current;
                const targetIndex =
                  moveDistance > 0
                    ? Math.min(index + 1, next.length)
                    : Math.max(index - 1, 0);
                next.splice(targetIndex, 0, dragged);
                return next;
              });
            }}
          >
            <GalleryMedia item={item} className="absolute inset-0" priority={index < 2} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-85 transition group-hover:opacity-100" />
            {item.type === "video" ? (
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
                <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                Video
              </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <h2 className="line-clamp-1 text-sm font-bold text-white sm:text-base">
                {item.title}
              </h2>
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">
                  {item.description}
                </p>
              ) : null}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {selectedItem ? (
        <GalleryModal
          selectedItem={selectedItem}
          items={orderedItems}
          onSelect={setSelectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </section>
  );
}
