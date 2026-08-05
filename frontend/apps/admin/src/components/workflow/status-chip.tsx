"use client";

import { cn } from "@ksu/ui/lib";
import {
  WORKFLOW_STATUS_LABELS,
  workflowStatusLabel,
  type WorkflowStatusTone,
} from "./workflow-status-vocabulary";

// Re-exported for existing client-side import sites; server modules (the
// portal registry) must import from ./workflow-status-vocabulary directly.
export {
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_STATUS_FILTER_OPTIONS,
  workflowStatusLabel,
} from "./workflow-status-vocabulary";

const TONE_CLASSES: Record<WorkflowStatusTone, string> = {
  gray: "border-border bg-muted text-muted-foreground",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  orange:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  blue: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  red: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

interface StatusChipProps {
  status?: string | null;
  /** scheduled_publish_at — shown alongside the "Scheduled" label. */
  scheduledFor?: string | null;
  className?: string;
}

/**
 * Plain-language workflow status chip. Renders nothing when the record has no
 * workflow status.
 */
export function StatusChip({ status, scheduledFor, className }: StatusChipProps) {
  if (!status) return null;
  const entry = WORKFLOW_STATUS_LABELS[status];
  const tone = entry?.tone ?? "gray";
  let label = entry?.label ?? workflowStatusLabel(status);

  if (status === "scheduled" && scheduledFor) {
    const date = new Date(scheduledFor);
    if (!Number.isNaN(date.getTime())) {
      label = `Scheduled · ${date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
