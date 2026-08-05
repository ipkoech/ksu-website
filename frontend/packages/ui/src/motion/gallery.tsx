"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import { cn } from "../lib/utils";
import { timing, easing } from "./transitions";
import { useReducedMotion } from "./hooks";
import { useFocusTrap, useLiveAnnounce, focusVisibleStyles } from "./accessibility";

// ============================================================================
// Types
// ============================================================================

export interface GalleryItem {
  id: string;
  src: string;
  thumbnail?: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  type?: "image" | "video";
  videoPoster?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
  span?: 1 | 2;
  featured?: boolean;
}

export type GalleryLayout = "grid" | "masonry" | "bento" | "carousel";
export type GalleryColumns = 2 | 3 | 4 | 5 | 6;
export type HoverEffect = "zoom" | "lift" | "glow" | "reveal" | "none";

// ============================================================================
// Context for Lightbox
// ============================================================================

interface GalleryContextValue {
  openLightbox: (index: number) => void;
  items: GalleryItem[];
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}

// ============================================================================
// Animation Variants
// ============================================================================

const itemReveal: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: timing.reveal / 1000,
      ease: easing.easeOut,
    },
  },
};

const overlayReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: timing.fast / 1000 },
  },
};

const detailsSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal / 1000,
      ease: easing.easeOut,
    },
  },
};

const lightboxVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: timing.normal / 1000 },
  },
  exit: {
    opacity: 0,
    transition: { duration: timing.fast / 1000 },
  },
};

const lightboxImageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal / 1000,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: timing.fast / 1000 },
  },
};

// ============================================================================
// Gallery Grid Component
// ============================================================================

export interface GalleryGridProps {
  items: GalleryItem[];
  layout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: "sm" | "md" | "lg";
  hoverEffect?: HoverEffect;
  showDetails?: "hover" | "always" | "never";
  enableLightbox?: boolean;
  enableFilter?: boolean;
  className?: string;
  itemClassName?: string;
  onItemClick?: (item: GalleryItem, index: number) => void;
}

export function GalleryGrid({
  items,
  layout = "grid",
  columns = 3,
  gap = "md",
  hoverEffect = "reveal",
  showDetails = "hover",
  enableLightbox = true,
  enableFilter = false,
  className,
  itemClassName,
  onItemClick,
}: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const categories = enableFilter
    ? Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    : [];

  const filteredItems = filter
    ? items.filter((item) => item.category === filter)
    : items;

  const openLightbox = useCallback((index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "masonry":
        return cn("columns-1", columnClasses[columns], gapClasses[gap]);
      case "bento":
        return cn("grid", columnClasses[columns], gapClasses[gap], "auto-rows-[200px]");
      default:
        return cn("grid", columnClasses[columns], gapClasses[gap]);
    }
  };

  return (
    <GalleryContext.Provider value={{ openLightbox, items: filteredItems }}>
      <div className={className}>
        {enableFilter && categories.length > 0 && (
          <GalleryFilter
            categories={categories as string[]}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        )}

        <div className={getLayoutClasses()}>
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <GalleryItem
                key={item.id}
                item={item}
                index={index}
                layout={layout}
                hoverEffect={hoverEffect}
                showDetails={showDetails}
                reducedMotion={reducedMotion}
                className={itemClassName}
                onClick={() => {
                  onItemClick?.(item, index);
                  openLightbox(index);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {enableLightbox && lightboxIndex !== null && (
          <Lightbox
            items={filteredItems}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={setLightboxIndex}
          />
        )}
      </div>
    </GalleryContext.Provider>
  );
}

// ============================================================================
// Gallery Item Component
// ============================================================================

interface GalleryItemProps {
  item: GalleryItem;
  index: number;
  layout: GalleryLayout;
  hoverEffect: HoverEffect;
  showDetails: "hover" | "always" | "never";
  reducedMotion: boolean;
  className?: string;
  onClick?: () => void;
}

function GalleryItem({
  item,
  index,
  layout,
  hoverEffect,
  showDetails,
  reducedMotion,
  className,
  onClick,
}: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  const getSpanClasses = () => {
    if (layout !== "bento") return "";
    if (item.featured) return "col-span-2 row-span-2";
    if (item.span === 2) return "col-span-2";
    return "";
  };

  const getHoverClasses = () => {
    if (reducedMotion || hoverEffect === "none") return "";
    switch (hoverEffect) {
      case "zoom":
        return "group-hover:scale-110";
      case "lift":
        return "";
      case "glow":
        return "";
      case "reveal":
        return "group-hover:scale-105";
      default:
        return "";
    }
  };

  const containerHoverClasses = () => {
    if (reducedMotion || hoverEffect === "none") return "";
    switch (hoverEffect) {
      case "lift":
        return "hover:-translate-y-2 hover:shadow-xl";
      case "glow":
        return "hover:shadow-[0_0_30px_rgba(0,119,182,0.3)]";
      default:
        return "";
    }
  };

  const content = (
    <motion.div
      layout
      variants={reducedMotion ? undefined : itemReveal}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg bg-muted",
        layout === "masonry" ? "mb-4 break-inside-avoid" : "",
        aspectClasses[item.aspectRatio ?? "auto"],
        getSpanClasses(),
        containerHoverClasses(),
        "transition-all duration-300",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {item.type === "video" ? (
        <>
          <img
            src={item.videoPoster ?? item.thumbnail ?? item.src}
            alt={item.alt}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              getHoverClasses()
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm"
              whileHover={reducedMotion ? undefined : { scale: 1.1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            >
              <Play className="h-7 w-7 ml-1" fill="currentColor" />
            </motion.div>
          </div>
        </>
      ) : (
        <img
          src={item.thumbnail ?? item.src}
          alt={item.alt}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            getHoverClasses()
          )}
        />
      )}

      {/* Hover Overlay */}
      {showDetails !== "never" && (
        <AnimatePresence>
          {(showDetails === "always" || isHovered) && (
            <motion.div
              variants={overlayReveal}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
              <motion.div
                variants={detailsSlideUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-x-0 bottom-0 p-4"
              >
                {item.category && (
                  <span className="mb-2 inline-block rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {item.category}
                  </span>
                )}
                {item.title && (
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white line-clamp-2">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="mt-1 text-sm text-white/80 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.date && (
                  <p className="mt-2 text-xs text-white/60">{item.date}</p>
                )}
              </motion.div>

              {/* Action buttons */}
              <div className="absolute right-3 top-3 flex gap-2">
                <motion.button
                  whileHover={reducedMotion ? undefined : { scale: 1.1 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                  aria-label="Expand"
                >
                  <Maximize2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );

  return content;
}

// ============================================================================
// Gallery Filter
// ============================================================================

interface GalleryFilterProps {
  categories: string[];
  activeFilter: string | null;
  onFilterChange: (category: string | null) => void;
}

function GalleryFilter({
  categories,
  activeFilter,
  onFilterChange,
}: GalleryFilterProps) {
  const reducedMotion = useReducedMotion();
  const { announce, LiveRegion } = useLiveAnnounce();

  const handleFilterChange = (category: string | null) => {
    onFilterChange(category);
    const message = category
      ? `Showing ${category} items`
      : "Showing all items";
    announce(message);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter gallery">
      <motion.button
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        onClick={() => handleFilterChange(null)}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          focusVisibleStyles.default,
          activeFilter === null
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
        aria-pressed={activeFilter === null}
      >
        All
      </motion.button>
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          onClick={() => handleFilterChange(category)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            focusVisibleStyles.default,
            activeFilter === category
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          aria-pressed={activeFilter === category}
        >
          {category}
        </motion.button>
      ))}
      <LiveRegion />
    </div>
  );
}

// ============================================================================
// Lightbox Component
// ============================================================================

export interface LightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentItem = items[currentIndex];

  // Focus trap: keeps tab within lightbox
  useFocusTrap(containerRef as React.RefObject<HTMLElement>, true);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [currentIndex, items.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        variants={lightboxVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Image ${currentIndex + 1} of ${items.length}: ${currentItem.title ?? currentItem.alt}`}
      >
        {/* Close button */}
        <motion.button
          whileHover={reducedMotion ? undefined : { scale: 1.1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.95 }}
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
            focusVisibleStyles.white
          )}
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </motion.button>

        {/* Navigation - Previous */}
        {currentIndex > 0 && (
          <motion.button
            whileHover={reducedMotion ? undefined : { scale: 1.1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className={cn(
              "absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
              focusVisibleStyles.white
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
        )}

        {/* Navigation - Next */}
        {currentIndex < items.length - 1 && (
          <motion.button
            whileHover={reducedMotion ? undefined : { scale: 1.1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className={cn(
              "absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
              focusVisibleStyles.white
            )}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        )}

        {/* Image/Video */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            variants={lightboxImageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === "video" ? (
              <video
                src={currentItem.src}
                poster={currentItem.videoPoster}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] rounded-lg"
              />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.alt}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Info panel */}
        {(currentItem.title || currentItem.description) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-3xl text-center">
              {currentItem.category && (
                <span className="mb-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                  {currentItem.category}
                </span>
              )}
              {currentItem.title && (
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                  {currentItem.title}
                </h2>
              )}
              {currentItem.description && (
                <p className="mt-2 text-white/80">{currentItem.description}</p>
              )}
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/60">
                {currentItem.date && <span>{currentItem.date}</span>}
                <span>
                  {currentIndex + 1} of {items.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index);
                }}
                className={cn(
                  "h-16 w-16 flex-shrink-0 overflow-hidden rounded-md transition-all",
                  index === currentIndex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                    : "opacity-50 hover:opacity-100"
                )}
              >
                <img
                  src={item.thumbnail ?? item.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Bento Gallery - Preset Layouts
// ============================================================================

export interface BentoGalleryProps {
  items: GalleryItem[];
  pattern?: "hero-left" | "hero-right" | "hero-center" | "balanced";
  className?: string;
}

export function BentoGallery({
  items,
  pattern = "hero-left",
  className,
}: BentoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  const getItemClasses = (index: number) => {
    switch (pattern) {
      case "hero-left":
        if (index === 0) return "col-span-2 row-span-2";
        return "";
      case "hero-right":
        if (index === 2) return "col-span-2 row-span-2";
        return "";
      case "hero-center":
        if (index === 1) return "col-span-2 row-span-2";
        return "";
      case "balanced":
        if (index === 0 || index === 3) return "col-span-2";
        return "";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className={cn(
          "grid auto-rows-[180px] gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {items.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.id}
            variants={reducedMotion ? undefined : itemReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl bg-muted",
              getItemClasses(index)
            )}
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={item.thumbnail ?? item.src}
              alt={item.alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute inset-x-0 bottom-0 p-4">
                {item.title && (
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                    {item.title}
                  </h3>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
