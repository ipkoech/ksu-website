"use client";

import { useMemo, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import { timing, easing } from "./transitions";
import { useReducedMotion } from "./hooks";

// ============================================================================
// Text Reveal - Character by character or word by word
// ============================================================================

export type TextRevealType = "char" | "word" | "line";

export interface TextRevealProps {
  text: string;
  type?: TextRevealType;
  className?: string;
  charClassName?: string;
  staggerDelay?: number;
  duration?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  once?: boolean;
  threshold?: number;
}

const charVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function TextReveal({
  text,
  type = "word",
  className,
  charClassName,
  staggerDelay = 30,
  duration = timing.reveal,
  tag = "p",
  once = true,
  threshold = 0.5,
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const Tag = tag;

  const elements = useMemo(() => {
    switch (type) {
      case "char":
        return text.split("").map((char, i) => ({
          key: `char-${i}`,
          content: char === " " ? " " : char,
        }));
      case "word":
        return text.split(" ").map((word, i) => ({
          key: `word-${i}`,
          content: word,
        }));
      case "line":
        return text.split("\n").map((line, i) => ({
          key: `line-${i}`,
          content: line,
        }));
      default:
        return [];
    }
  }, [text, type]);

  const variants = type === "char" ? charVariants : type === "word" ? wordVariants : lineVariants;

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay / 1000,
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={containerVariants}
      aria-label={text}
    >
      {elements.map((element, index) => (
        <motion.span
          key={element.key}
          className={cn(
            "inline-block",
            type === "word" && "mr-[0.25em]",
            charClassName
          )}
          variants={variants}
          transition={{
            duration: duration / 1000,
            ease: easing.easeOut,
          }}
        >
          {element.content}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================================================
// Highlight Text - Text with animated highlight/underline
// ============================================================================

export interface HighlightTextProps {
  children: string;
  highlight?: "underline" | "background" | "gradient";
  highlightColor?: string;
  className?: string;
  delay?: number;
}

export function HighlightText({
  children,
  highlight = "underline",
  highlightColor,
  className,
  delay = 0,
}: HighlightTextProps) {
  const reducedMotion = useReducedMotion();

  const highlightVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: timing.slow / 1000,
        ease: easing.easeOut,
        delay: delay / 1000,
      },
    },
  };

  const backgroundVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: timing.slow / 1000,
        ease: easing.easeOut,
        delay: delay / 1000,
      },
    },
  };

  if (reducedMotion) {
    return <span className={className}>{children}</span>;
  }

  if (highlight === "underline") {
    return (
      <span className={cn("relative inline-block", className)}>
        {children}
        <motion.span
          className="absolute bottom-0 left-0 h-[3px] w-full bg-secondary"
          style={highlightColor ? { backgroundColor: highlightColor } : undefined}
          variants={highlightVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
      </span>
    );
  }

  if (highlight === "background") {
    return (
      <span className={cn("relative inline-block", className)}>
        <motion.span
          className="absolute inset-0 -z-10 bg-secondary/20"
          style={highlightColor ? { backgroundColor: highlightColor } : undefined}
          variants={backgroundVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
        {children}
      </span>
    );
  }

  if (highlight === "gradient") {
    return (
      <motion.span
        className={cn(
          "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
          className
        )}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: timing.slow / 1000, delay: delay / 1000 }}
      >
        {children}
      </motion.span>
    );
  }

  return <span className={className}>{children}</span>;
}

// ============================================================================
// Typewriter Effect
// ============================================================================

export interface TypewriterProps {
  text: string | string[];
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  loop?: boolean;
  pauseBetween?: number;
}

export function Typewriter({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = "|",
  loop = false,
  pauseBetween = 2000,
}: TypewriterProps) {
  const reducedMotion = useReducedMotion();
  const texts = Array.isArray(text) ? text : [text];

  if (reducedMotion) {
    return <span className={className}>{texts[0]}</span>;
  }

  const totalChars = texts.join("").length;
  const duration = totalChars * speed + (texts.length - 1) * pauseBetween;

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000 }}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: "auto" }}
        transition={{
          duration: duration / 1000,
          ease: "linear",
        }}
        className="inline-block overflow-hidden whitespace-nowrap"
      >
        {texts[0]}
      </motion.span>
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="ml-0.5"
        >
          {cursorChar}
        </motion.span>
      )}
    </motion.span>
  );
}

// ============================================================================
// Split Text - For creative text layouts
// ============================================================================

export interface SplitTextProps {
  children: string;
  className?: string;
  lineClassName?: string;
  animation?: "fade" | "slide" | "wave";
  staggerDelay?: number;
}

export function SplitText({
  children,
  className,
  lineClassName,
  animation = "slide",
  staggerDelay = 100,
}: SplitTextProps) {
  const reducedMotion = useReducedMotion();
  const lines = children.split("\n");

  const variants: Record<string, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, y: 40, rotateX: -15 },
      visible: { opacity: 1, y: 0, rotateX: 0 },
    },
    wave: {
      hidden: { opacity: 0, y: 20, scale: 0.9 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
  };

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div
            variants={variants[animation]}
            transition={{
              duration: timing.reveal / 1000,
              ease: easing.easeOut,
              delay: (index * staggerDelay) / 1000,
            }}
            className={lineClassName}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
