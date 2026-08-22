import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * `academic` — soft, drifting, circular. The interior-page backdrop: a base
 *   gradient, three radial washes, a fine grid, a dot field and two orbit
 *   rings, all barely above the threshold of notice.
 * `poster` — the institution's own print language: hard square dot lattices
 *   anchored in the corners in cyan and orange, over an optional ghosted
 *   campus photograph. Geometric and static.
 */
type AmbientVariant = "academic" | "poster";
type AmbientIntensity = "soft" | "medium";

type AmbientPageBackgroundProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  variant?: AmbientVariant;
  intensity?: AmbientIntensity;
  contentClassName?: string;
  /**
   * `poster` only: the photograph ghosted behind the content. Omit for a
   * clean white plate.
   */
  plateImage?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

const intensityClassNames: Record<AmbientIntensity, string> = {
  soft: "opacity-70",
  medium: "opacity-95",
};

/** The poster variant sits on white; `academic` keeps its own gradient. */
const groundClassNames: Record<AmbientVariant, string> = {
  academic:
    "bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_36%,hsl(var(--surface-muted))_100%)]",
  poster: "bg-[hsl(var(--surface-page))]",
};

export function AmbientPageBackground<T extends ElementType = "div">({
  as,
  children,
  variant = "academic",
  intensity = "soft",
  className,
  contentClassName,
  plateImage,
  ...props
}: AmbientPageBackgroundProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "relative isolate overflow-x-clip text-foreground",
        groundClassNames[variant],
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

      {variant === "poster" ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
            intensityClassNames[intensity],
          )}
        >
          {/* Ghosted campus plate, when one is supplied. */}
          {plateImage ? (
            <div
              className="ksu-poster-plate absolute inset-0 opacity-[0.09]"
              style={{ backgroundImage: `url(${plateImage})` }}
            />
          ) : null}

          {/* Brand washes, kept well below the lattices so the geometry
              stays the thing you notice. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_6%,hsl(var(--secondary)/0.07),transparent_28%),radial-gradient(circle_at_6%_4%,hsl(var(--cyan-bright)/0.09),transparent_26%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.06),transparent_34%)]" />

          {/* Lattices at every corner and along both flanks, so a tall
              section carries the motif for its whole height rather than
              only at the top. Each block is masked away from the reading
              column, so the geometry lives in the margins. */}
          <div className="ksu-poster-dots ksu-poster-dots-tl absolute -left-6 -top-6 h-64 w-64 sm:h-80 sm:w-80" />
          <div className="ksu-poster-dots ksu-poster-dots-tr absolute -right-6 -top-6 h-56 w-56 sm:h-72 sm:w-72" />

          {/* Flanks: pinned to the vertical centre so they hold the middle of
              a long section, which the corner blocks cannot reach. */}
          <div className="ksu-poster-dots ksu-poster-dots-l absolute -left-8 top-1/2 hidden h-72 w-40 -translate-y-1/2 lg:block" />
          <div className="ksu-poster-dots ksu-poster-dots-r absolute -right-8 top-1/2 hidden h-72 w-40 -translate-y-1/2 lg:block" />

          <div className="ksu-poster-dots ksu-poster-dots-bl absolute -bottom-8 -left-8 hidden h-56 w-56 sm:block" />
          <div className="ksu-poster-dots ksu-poster-dots-br absolute -bottom-8 -right-8 hidden h-56 w-56 sm:block" />
        </div>
      ) : null}

      <div className={cn("relative z-0", contentClassName)}>{children}</div>
    </Component>
  );
}
