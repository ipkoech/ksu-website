import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "../../lib/utils";

type AmbientVariant = "academic";
type AmbientIntensity = "soft" | "medium";

type AmbientPageBackgroundProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  variant?: AmbientVariant;
  intensity?: AmbientIntensity;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

const intensityClassNames: Record<AmbientIntensity, string> = {
  soft: "opacity-70",
  medium: "opacity-95",
};

export function AmbientPageBackground<T extends ElementType = "div">({
  as,
  children,
  variant = "academic",
  intensity = "soft",
  className,
  contentClassName,
  ...props
}: AmbientPageBackgroundProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "relative isolate overflow-x-clip bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_36%,hsl(var(--surface-muted))_100%)] text-foreground",
        className,
      )}
      {...props}
    >
      {variant === "academic" ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
            intensityClassNames[intensity],
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,hsl(var(--primary)/0.14),transparent_30%),radial-gradient(circle_at_88%_18%,hsl(var(--secondary)/0.09),transparent_26%),radial-gradient(circle_at_50%_96%,hsl(var(--primary)/0.10),transparent_32%)]" />
          <div className="ksu-academic-grid absolute inset-0" />
          <div className="ksu-academic-dots absolute inset-0 motion-safe:animate-ksu-ambient-drift" />
          <div className="ksu-academic-orbits absolute -right-24 top-28 h-[34rem] w-[34rem] motion-safe:animate-ksu-ambient-float sm:-right-16 lg:right-6" />
          <div className="ksu-academic-orbits absolute -left-32 bottom-16 h-[24rem] w-[24rem] opacity-60 motion-safe:animate-ksu-ambient-float-reverse" />
        </div>
      ) : null}

      <div className={cn("relative z-0", contentClassName)}>{children}</div>
    </Component>
  );
}
