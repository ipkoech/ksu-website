"use client";

import * as React from "react";
import { Badge } from "../ui";
import { cn } from "../../lib";

export interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
  className?: string;
}

const variantClasses = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  error: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  default: "border-border bg-muted text-muted-foreground",
} as const;

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("inline-flex items-center gap-2 capitalize", variantClasses[variant], className)}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {status.replace(/[_-]/g, " ")}
    </Badge>
  );
}
