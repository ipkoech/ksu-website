"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import {
  useScrollReveal,
  useStaggerChildren,
  useCountUp,
  useReducedMotion,
  fadeUp,
  stagger,
} from "../../motion";

export interface NumberStat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  description?: string;
}

export interface NumbersStripProps extends HTMLAttributes<HTMLElement> {
  stats: NumberStat[];
  title?: string;
  subtitle?: string;
  variant?: "default" | "primary" | "dark";
  countDuration?: number;
}

export const NumbersStrip = forwardRef<HTMLElement, NumbersStripProps>(
  (
    {
      stats,
      title,
      subtitle,
      variant = "default",
      countDuration = 2000,
      className,
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion();
    const { ref: sectionRef, controls, isInView } = useScrollReveal({
      threshold: 0.3,
    });
    const { getDelay } = useStaggerChildren(stats.length, {
      staggerDelay: stagger.centerOut,
      origin: "center",
    });

    const variants = {
      default: {
        container: "bg-white border-y border-border",
        stat: "text-foreground",
        value: "text-primary",
        label: "text-muted-foreground",
        divider: "bg-border",
      },
      primary: {
        container: "bg-primary text-white",
        stat: "text-white",
        value: "text-white",
        label: "text-white/70",
        divider: "bg-white/20",
      },
      dark: {
        container: "bg-foreground text-white",
        stat: "text-white",
        value: "text-secondary",
        label: "text-white/70",
        divider: "bg-white/15",
      },
    };

    const styles = variants[variant];

    return (
      <section
        ref={(node) => {
          (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn("py-10 lg:py-14", styles.container, className)}
      >
        <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {(title || subtitle) && (
            <motion.div
              initial="hidden"
              animate={controls}
              variants={fadeUp}
              className="mb-8 text-center"
            >
              {title && (
                <h2
                  className={cn(
                    "font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl",
                    styles.stat
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className={cn("mt-2 text-base", styles.label)}>{subtitle}</p>
              )}
            </motion.div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                animate={controls}
                variants={fadeUp}
                transition={{ delay: getDelay(index) / 1000 }}
                className={cn(
                  "relative text-center",
                  index < stats.length - 1 &&
                    "xl:border-r xl:pr-6",
                  styles.divider && index < stats.length - 1 && `xl:border-${styles.divider.replace('bg-', '')}`
                )}
              >
                <StatNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={countDuration}
                  delay={getDelay(index)}
                  isInView={isInView}
                  reducedMotion={reducedMotion}
                  className={cn(
                    "font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums sm:text-5xl lg:text-6xl",
                    styles.value
                  )}
                />
                <p
                  className={cn(
                    "mt-2 text-sm font-semibold uppercase tracking-wider",
                    styles.label
                  )}
                >
                  {stat.label}
                </p>
                {stat.description && (
                  <p className={cn("mt-1 text-xs", styles.label)}>
                    {stat.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
NumbersStrip.displayName = "NumbersStrip";

interface StatNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration: number;
  delay: number;
  isInView: boolean;
  reducedMotion: boolean;
  className?: string;
}

function StatNumber({
  value,
  prefix = "",
  suffix = "",
  duration,
  delay,
  isInView,
  reducedMotion,
  className,
}: StatNumberProps) {
  const { ref, count } = useCountUp(value, {
    duration,
    delay,
    startOnView: true,
  });

  if (reducedMotion) {
    return (
      <span className={className}>
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default NumbersStrip;
