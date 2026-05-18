"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
}

export function SlideIn({
  children,
  direction = "up",
  ...props
}: SlideInProps) {
  const directionVariants = {
    up: { y: -20, x: 0 },
    down: { y: 20, x: 0 },
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}