"use client";

import { forwardRef, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import {
  fadeUp,
  kenBurns,
  crossfade,
  hoverLift,
  tapScale,
  type PresetName,
  presets,
} from "./presets";
import { timing, stagger } from "./transitions";
import {
  useScrollReveal,
  useStaggerChildren,
  useReducedMotion,
  useImageRotation,
  useCountUp,
} from "./hooks";

export interface RevealSectionProps {
  children: ReactNode;
  animation?: PresetName;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  as?: "div" | "section" | "article" | "aside";
  className?: string;
  id?: string;
}

export const RevealSection = forwardRef<HTMLDivElement, RevealSectionProps>(
  (
    {
      children,
      animation = "fadeUp",
      delay = 0,
      threshold = 1,
      triggerOnce = true,
      as = "div",
      className,
      id,
    },
    forwardedRef
  ) => {
    const reducedMotion = useReducedMotion();
    const { ref, controls } = useScrollReveal({
      threshold,
      triggerOnce,
      delay,
    });

    const variants = presets[animation];

    if (reducedMotion) {
      const StaticComponent = as;
      return (
        <StaticComponent ref={forwardedRef} className={className} id={id}>
          {children}
        </StaticComponent>
      );
    }

    const MotionComponent = motion[as];

    return (
      <MotionComponent
        ref={(node: HTMLDivElement | null) => {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        initial="hidden"
        animate={controls}
        variants={variants}
        className={className}
        id={id}
      >
        {children}
      </MotionComponent>
    );
  }
);
RevealSection.displayName = "RevealSection";

export interface StaggerGridProps {
  children: ReactNode[];
  columns?: 2 | 3 | 4 | 6;
  staggerDelay?: number;
  origin?: "start" | "center" | "end";
  className?: string;
  itemClassName?: string;
}

export function StaggerGrid({
  children,
  columns = 3,
  staggerDelay = stagger.normal,
  origin = "center",
  className,
  itemClassName,
}: StaggerGridProps) {
  const reducedMotion = useReducedMotion();
  const { ref, controls } = useScrollReveal({ threshold: 0.2 });
  const { getDelay } = useStaggerChildren(children.length, {
    staggerDelay,
    origin,
  });

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  if (reducedMotion) {
    return (
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={controls}
      className={cn("grid gap-4", gridCols[columns], className)}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={fadeUp}
          custom={index}
          transition={{ delay: getDelay(index) / 1000 }}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export interface MotionCardProps {
  children: ReactNode;
  hover?: "lift" | "glow" | "none";
  className?: string;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, hover = "lift", className }, ref) => {
    const reducedMotion = useReducedMotion();

    const hoverAnimation =
      hover === "none" || reducedMotion
        ? undefined
        : hover === "glow"
          ? { scale: 1.01, boxShadow: "0 8px 30px -8px rgba(0, 119, 182, 0.35)" }
          : hoverLift;

    return (
      <motion.div
        ref={ref}
        whileHover={hoverAnimation}
        whileTap={reducedMotion ? undefined : tapScale}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

export interface KenBurnsImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  overlay?: "none" | "gradient" | "dark";
  overlayClassName?: string;
}

export function KenBurnsImage({
  src,
  alt,
  className,
  imageClassName,
  overlay = "none",
  overlayClassName,
}: KenBurnsImageProps) {
  const reducedMotion = useReducedMotion();

  const overlayStyles = {
    none: "",
    gradient: "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
    dark: "bg-black/40",
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        variants={reducedMotion ? undefined : kenBurns}
        initial="initial"
        animate={reducedMotion ? undefined : "animate"}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      {overlay !== "none" && (
        <div
          className={cn(
            "absolute inset-0",
            overlayStyles[overlay],
            overlayClassName
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export interface CrossfadeImagesProps {
  images: string[];
  interval?: number;
  alt?: string;
  className?: string;
  imageClassName?: string;
  overlay?: "none" | "gradient" | "dark";
  kenBurnsEffect?: boolean;
}

export function CrossfadeImages({
  images,
  interval = timing.crossfade,
  alt = "",
  className,
  imageClassName,
  overlay = "none",
  kenBurnsEffect = true,
}: CrossfadeImagesProps) {
  const reducedMotion = useReducedMotion();
  const { currentImage, currentIndex } = useImageRotation(images, interval);

  const overlayStyles = {
    none: "",
    gradient: "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
    dark: "bg-black/40",
  };

  if (reducedMotion || images.length === 1) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
        {overlay !== "none" && (
          <div
            className={cn("absolute inset-0", overlayStyles[overlay])}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={crossfade}
          initial="exit"
          animate="enter"
          exit="exit"
          className="absolute inset-0"
        >
          {kenBurnsEffect ? (
            <motion.img
              src={currentImage}
              alt={alt}
              variants={kenBurns}
              initial="initial"
              animate="animate"
              className={cn("h-full w-full object-cover", imageClassName)}
            />
          ) : (
            <img
              src={currentImage}
              alt={alt}
              className={cn("h-full w-full object-cover", imageClassName)}
            />
          )}
        </motion.div>
      </AnimatePresence>
      {overlay !== "none" && (
        <div
          className={cn("absolute inset-0", overlayStyles[overlay])}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export interface CountUpNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  delay = 0,
  className,
}: CountUpNumberProps) {
  const { ref, count } = useCountUp(value, { duration, delay });

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export interface VideoHeroProps {
  src: string;
  poster?: string;
  fallbackImage?: string;
  className?: string;
  videoClassName?: string;
  overlay?: "none" | "gradient" | "dark" | "light";
  overlayClassName?: string;
  children?: ReactNode;
  muted?: boolean;
  loop?: boolean;
}

export function VideoHero({
  src,
  poster,
  fallbackImage,
  className,
  videoClassName,
  overlay = "gradient",
  overlayClassName,
  children,
  muted = true,
  loop = true,
}: VideoHeroProps) {
  const reducedMotion = useReducedMotion();

  const overlayStyles = {
    none: "",
    gradient:
      "bg-[linear-gradient(90deg,rgba(1,8,22,.52)_0%,rgba(1,8,22,.28)_40%,transparent_70%)]",
    dark: "bg-black/50",
    light: "bg-white/30",
  };

  const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isYouTube ? (
        <iframe
          src={`${src}?autoplay=1&mute=1&loop=1&controls=0&playlist=${src.split("/").pop()}`}
          allow="autoplay; encrypted-media"
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none",
            videoClassName
          )}
          title="Background video"
        />
      ) : (
        <video
          autoPlay={!reducedMotion}
          muted={muted}
          loop={loop}
          playsInline
          preload="metadata"
          poster={poster ?? fallbackImage}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            videoClassName
          )}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {reducedMotion && fallbackImage && (
        <img
          src={fallbackImage}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            videoClassName
          )}
        />
      )}

      {overlay !== "none" && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            overlayStyles[overlay],
            overlayClassName
          )}
          aria-hidden="true"
        />
      )}

      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

export interface PageHeaderProps {
  images: string[];
  interval?: number;
  title: string;
  breadcrumb?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageHeader({
  images,
  interval = timing.crossfade,
  title,
  breadcrumb,
  className,
  contentClassName,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative min-h-[240px] overflow-hidden bg-primary text-white sm:min-h-[280px] lg:min-h-[320px]",
        className
      )}
    >
      <CrossfadeImages
        images={images}
        interval={interval}
        alt=""
        className="absolute inset-0 h-full w-full"
        overlay="gradient"
        kenBurnsEffect
      />

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[240px] max-w-[1680px] flex-col justify-end px-4 pb-8 sm:min-h-[280px] sm:px-6 lg:min-h-[320px] lg:px-8 xl:px-10 2xl:px-12",
          contentClassName
        )}
      >
        {breadcrumb}
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
          {title}
        </h1>
      </div>
    </header>
  );
}
