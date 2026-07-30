"use client";

import {
  forwardRef,
  useState,
  useEffect,
  type ReactNode,
  type ImgHTMLAttributes,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import { timing, easing } from "./transitions";
import { useReducedMotion } from "./hooks";

const curtainReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: {
      duration: timing.slow / 1000,
      ease: easing.easeOut,
    },
  },
};

const curtainRevealLeft: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: timing.slow / 1000,
      ease: easing.easeOut,
    },
  },
};

const curtainRevealRight: Variants = {
  hidden: { clipPath: "inset(0 0 0 100%)" },
  visible: {
    clipPath: "inset(0 0 0 0%)",
    transition: {
      duration: timing.slow / 1000,
      ease: easing.easeOut,
    },
  },
};

const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.reveal / 1000,
      ease: easing.easeOut,
    },
  },
};

const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: timing.reveal / 1000,
      ease: easing.easeOut,
    },
  },
};

const revealVariants = {
  curtain: curtainReveal,
  curtainLeft: curtainRevealLeft,
  curtainRight: curtainRevealRight,
  scale: scaleReveal,
  blur: blurReveal,
};

export type AssetRevealType = keyof typeof revealVariants;

export interface AssetRevealProps {
  children: ReactNode;
  type?: AssetRevealType;
  delay?: number;
  className?: string;
  onRevealComplete?: () => void;
}

export function AssetReveal({
  children,
  type = "curtain",
  delay = 0,
  className,
  onRevealComplete,
}: AssetRevealProps) {
  const reducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={revealVariants[type]}
      transition={{ delay: delay / 1000 }}
      onAnimationComplete={() => onRevealComplete?.()}
    >
      {children}
    </motion.div>
  );
}

export interface RevealImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad"> {
  revealType?: AssetRevealType;
  revealDelay?: number;
  containerClassName?: string;
  showSkeleton?: boolean;
  aspectRatio?: "auto" | "video" | "square" | "portrait";
}

export const RevealImage = forwardRef<HTMLImageElement, RevealImageProps>(
  (
    {
      src,
      alt,
      revealType = "curtain",
      revealDelay = 0,
      className,
      containerClassName,
      showSkeleton = true,
      aspectRatio = "auto",
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const reducedMotion = useReducedMotion();

    const aspectRatioClass = {
      auto: "",
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
    };

    if (reducedMotion) {
      return (
        <div className={cn("relative overflow-hidden", aspectRatioClass[aspectRatio], containerClassName)}>
          <img
            ref={ref}
            src={src}
            alt={alt}
            className={cn("h-full w-full object-cover", className)}
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatioClass[aspectRatio],
          containerClassName
        )}
      >
        {showSkeleton && !isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={revealVariants[revealType]}
          transition={{ delay: revealDelay / 1000 }}
          className="h-full w-full"
        >
          <img
            ref={ref}
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            {...props}
          />
        </motion.div>
      </div>
    );
  }
);
RevealImage.displayName = "RevealImage";

export interface RevealVideoProps {
  src: string;
  poster?: string;
  revealType?: AssetRevealType;
  revealDelay?: number;
  className?: string;
  containerClassName?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: "auto" | "video" | "square";
}

export function RevealVideo({
  src,
  poster,
  revealType = "curtain",
  revealDelay = 0,
  className,
  containerClassName,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  aspectRatio = "video",
}: RevealVideoProps) {
  const reducedMotion = useReducedMotion();

  const aspectRatioClass = {
    auto: "",
    video: "aspect-video",
    square: "aspect-square",
  };

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatioClass[aspectRatio],
          containerClassName
        )}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            className={cn("h-full w-full object-cover", className)}
          />
        ) : (
          <video
            src={src}
            poster={poster}
            muted={muted}
            loop={loop}
            controls={controls}
            className={cn("h-full w-full object-cover", className)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatioClass[aspectRatio],
        containerClassName
      )}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={revealVariants[revealType]}
        transition={{ delay: revealDelay / 1000 }}
        className="h-full w-full"
      >
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          controls={controls}
          className={cn("h-full w-full object-cover", className)}
        />
      </motion.div>
    </div>
  );
}
