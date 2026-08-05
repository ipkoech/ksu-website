"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import { timing, easing } from "./transitions";
import { useReducedMotion, useScrollReveal } from "./hooks";
import { fadeUp } from "./presets";

const sectionFadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.reveal / 1000,
      ease: easing.easeOut,
    },
  },
};

const sectionFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: timing.normal / 1000,
      ease: easing.easeOut,
    },
  },
};

const sectionSlideUp: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: timing.slow / 1000,
      ease: easing.easeOut,
    },
  },
};

const sectionParallax: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.slower / 1000,
      ease: easing.easeOut,
    },
  },
};

const sectionVariants = {
  fadeUp: sectionFadeUp,
  fadeIn: sectionFadeIn,
  slideUp: sectionSlideUp,
  parallax: sectionParallax,
};

export type SectionTransition = keyof typeof sectionVariants;

export interface SectionProps {
  children: ReactNode;
  transition?: SectionTransition;
  delay?: number;
  threshold?: number;
  as?: "section" | "div" | "article" | "aside";
  fullWidth?: boolean;
  padded?: boolean;
  className?: string;
  id?: string;
}

export function Section({
  children,
  transition = "fadeUp",
  delay = 0,
  threshold = 0.15,
  as = "section",
  fullWidth = false,
  padded = true,
  className,
  id,
}: SectionProps) {
  const reducedMotion = useReducedMotion();
  const { ref, controls } = useScrollReveal({
    threshold,
    delay,
  });

  const paddingClasses = padded
    ? "px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10 2xl:px-12"
    : "";

  const content = fullWidth ? (
    children
  ) : (
    <div className="mx-auto max-w-[1680px]">{children}</div>
  );

  if (reducedMotion) {
    if (as === "section") {
      return (
        <section className={cn(paddingClasses, className)} id={id}>
          {content}
        </section>
      );
    }
    if (as === "article") {
      return (
        <article className={cn(paddingClasses, className)} id={id}>
          {content}
        </article>
      );
    }
    if (as === "aside") {
      return (
        <aside className={cn(paddingClasses, className)} id={id}>
          {content}
        </aside>
      );
    }
    return (
      <div className={cn(paddingClasses, className)} id={id}>
        {content}
      </div>
    );
  }

  return (
    <motion.section
      ref={ref as React.RefObject<HTMLElement>}
      initial="hidden"
      animate={controls}
      variants={sectionVariants[transition]}
      className={cn(paddingClasses, className)}
      id={id}
    >
      {content}
    </motion.section>
  );
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleSize?: "default" | "large" | "xlarge";
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  titleSize = "default",
  actions,
  className,
}: SectionHeaderProps) {
  const reducedMotion = useReducedMotion();

  const titleSizes = {
    default: "text-3xl sm:text-4xl",
    large: "text-4xl sm:text-5xl",
    xlarge: "text-4xl sm:text-5xl lg:text-6xl",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center mx-auto",
  };

  const content = (
    <div className={cn("max-w-3xl", alignStyles[align], className)}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-2 font-[family-name:var(--font-display)] font-bold leading-tight text-foreground",
          titleSizes[titleSize]
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );

  if (reducedMotion) {
    return content;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={fadeUp}
    >
      {content}
    </motion.div>
  );
}

export interface SectionDividerProps {
  variant?: "line" | "gradient" | "dots" | "none";
  className?: string;
}

export function SectionDivider({
  variant = "line",
  className,
}: SectionDividerProps) {
  if (variant === "none") return null;

  const variants = {
    line: "h-px bg-border",
    gradient:
      "h-px bg-gradient-to-r from-transparent via-border to-transparent",
    dots: "h-4 flex items-center justify-center gap-2",
  };

  if (variant === "dots") {
    return (
      <div className={cn(variants[variant], className)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-border"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("mx-auto max-w-[1680px]", variants[variant], className)}
      role="separator"
    />
  );
}

export interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down" | "fade";
}

const pageTransitionVariants: Record<string, Variants> = {
  left: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  right: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export function PageTransition({
  children,
  direction = "up",
}: PageTransitionProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants[direction]}
      transition={{
        duration: timing.normal / 1000,
        ease: easing.easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}

export interface ContentRevealProps {
  children: ReactNode;
  stagger?: boolean;
  staggerDelay?: number;
  className?: string;
}

export function ContentReveal({
  children,
  stagger = false,
  staggerDelay = 50,
  className,
}: ContentRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger ? staggerDelay / 1000 : 0,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: timing.reveal / 1000,
        ease: easing.easeOut,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
}
