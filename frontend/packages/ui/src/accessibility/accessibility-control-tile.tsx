"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "../lib/utils";

export type AccessibilityControlTileProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  description: string;
  pressed?: boolean;
  tooltipsEnabled: boolean;
  onClick: () => void;
};

export function AccessibilityControlTile({
  icon: Icon,
  label,
  value,
  description,
  pressed,
  tooltipsEnabled,
  onClick,
}: AccessibilityControlTileProps) {
  const descriptionId = React.useId();
  const button = (
    <button
      type="button"
      aria-pressed={pressed}
      aria-describedby={descriptionId}
      onClick={onClick}
      className={cn(
        "group flex min-h-28 min-w-0 flex-col items-center justify-center gap-2 rounded-xl border bg-background px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30",
        pressed
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground hover:border-primary/40 hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
          pressed
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary",
        )}
      >
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <span className="min-w-0 text-sm font-bold leading-5">{label}</span>
      {value ? (
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {value}
        </span>
      ) : null}
      <span id={descriptionId} className="sr-only">
        {description}
      </span>
    </button>
  );

  if (!tooltipsEnabled) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        collisionPadding={12}
        className="max-w-[calc(100vw-2rem)]"
      >
        {description}
      </TooltipContent>
    </Tooltip>
  );
}
