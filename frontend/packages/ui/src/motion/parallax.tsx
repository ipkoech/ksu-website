"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { cn } from "../lib/utils";
import { useReducedMotion } from "./hooks";

// ============================================================================
// Parallax Section - Background moves at different speed than content
// ============================================================================

export interface ParallaxSectionProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundVideo?: string;
  videoPoster?: string;
  speed?: number;
  overlay?: "none" | "light" | "dark" | "gradient" | "primary";
  overlayOpacity?: number;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
}

export function ParallaxSection({
  children,
  backgroundImage,
  backgroundVideo,
  videoPoster,
  speed = 0.5,
  overlay = "dark",
  overlayOpacity = 0.5,
  className,
  contentClassName,
  minHeight = "500px",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const overlayClasses = {
    none: "",
    light: "bg-white",
    dark: "bg-black",
    gradient: "bg-gradient-to-b from-black/70 via-black/50 to-black/70",
    primary: "bg-primary",
  };

  return (
    <section
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ minHeight }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={reducedMotion ? undefined : { y: springY }}
      >
        {backgroundVideo ? (
          <video
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            poster={videoPoster ?? backgroundImage}
            className="h-[120%] w-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="h-[120%] w-full object-cover"
          />
        ) : null}
      </motion.div>

      {/* Overlay */}
      {overlay !== "none" && (
        <div
          className={cn("absolute inset-0 -z-10", overlayClasses[overlay])}
          style={{ opacity: overlay === "gradient" ? 1 : overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  );
}

// ============================================================================
// Parallax Element - Individual element with parallax
// ============================================================================

export interface ParallaxElementProps {
  children: ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function ParallaxElement({
  children,
  speed = 0.2,
  direction = "up",
  className,
}: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = speed * 100;

  const transforms: Record<string, MotionValue<string>> = {
    up: useTransform(scrollYProgress, [0, 1], [`${range}px`, `-${range}px`]),
    down: useTransform(scrollYProgress, [0, 1], [`-${range}px`, `${range}px`]),
    left: useTransform(scrollYProgress, [0, 1], [`${range}px`, `-${range}px`]),
    right: useTransform(scrollYProgress, [0, 1], [`-${range}px`, `${range}px`]),
  };

  const isHorizontal = direction === "left" || direction === "right";
  const motionStyle = reducedMotion
    ? undefined
    : isHorizontal
      ? { x: transforms[direction] }
      : { y: transforms[direction] };

  return (
    <motion.div ref={ref} className={className} style={motionStyle}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// Scroll Progress Indicator
// ============================================================================

export interface ScrollProgressProps {
  position?: "top" | "bottom";
  color?: string;
  height?: number;
  className?: string;
}

export function ScrollProgress({
  position = "top",
  color,
  height = 3,
  className,
}: ScrollProgressProps) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (reducedMotion) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "fixed left-0 right-0 z-50 origin-left bg-primary",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      style={{
        scaleX,
        height,
        backgroundColor: color,
      }}
    />
  );
}

// ============================================================================
// Floating Element - Subtle floating animation
// ============================================================================

export interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function FloatingElement({
  children,
  amplitude = 10,
  duration = 3,
  delay = 0,
  className,
}: FloatingElementProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Scroll-Linked Opacity
// ============================================================================

export interface FadeOnScrollProps {
  children: ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
  className?: string;
}

export function FadeOnScroll({
  children,
  fadeIn = true,
  fadeOut = true,
  className,
}: FadeOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    fadeIn && fadeOut
      ? [0, 0.2, 0.8, 1]
      : fadeIn
        ? [0, 0.3, 1, 1]
        : [1, 1, 0.7, 0],
    fadeIn && fadeOut
      ? [0, 1, 1, 0]
      : fadeIn
        ? [0, 1, 1, 1]
        : [1, 1, 1, 0]
  );

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ opacity }}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// Sticky Reveal - Content reveals as you scroll past sticky element
// ============================================================================

export interface StickyRevealProps {
  children: ReactNode;
  stickyContent: ReactNode;
  height?: string;
  className?: string;
  stickyClassName?: string;
  contentClassName?: string;
}

export function StickyReveal({
  children,
  stickyContent,
  height = "200vh",
  className,
  stickyClassName,
  contentClassName,
}: StickyRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, 0]);

  if (reducedMotion) {
    return (
      <div className={className}>
        {stickyContent}
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)} style={{ height }}>
      <div
        className={cn(
          "sticky top-0 flex h-screen items-center justify-center",
          stickyClassName
        )}
      >
        {stickyContent}
      </div>
      <motion.div
        className={cn("absolute inset-0 flex items-center justify-center", contentClassName)}
        style={{ opacity, y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
