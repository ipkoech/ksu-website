"use client";

import { cn } from "@ksu/ui/lib";

type WorkflowStatusTone = "gray" | "amber" | "orange" | "blue" | "green" | "red";

/**
 * Plain-language labels and tones for every workflow status. This is the one
 * shared vocabulary for statuses shown to non-technical users — registry
 * filter options and row chips must import from here instead of hardcoding
 * their own lists.
 */
export const WORKFLOW_STATUS_LABELS: Record<
  string,
  { label: string; tone: WorkflowStatusTone }
> = {
  draft: { label: "Draft", tone: "gray" },
  submitted: { label: "Waiting for review", tone: "amber" },
  in_review: { label: "Being reviewed", tone: "amber" },
  changes_requested: { label: "Changes requested", tone: "orange" },
  approved: { label: "Ready to publish", tone: "blue" },
  scheduled: { label: "Scheduled", tone: "blue" },
  published: { label: "Live on website", tone: "green" },
  unpublished: { label: "Taken off website", tone: "gray" },
  rejected: { label: "Not approved", tone: "red" },
  archived: { label: "Archived", tone: "gray" },
};

/** Select options derived from the shared status vocabulary. */
export const WORKFLOW_STATUS_FILTER_OPTIONS = Object.entries(
  WORKFLOW_STATUS_LABELS,
).map(([value, { label }]) => ({ label, value }));

export function workflowStatusLabel(status: string): string {
  return (
    WORKFLOW_STATUS_LABELS[status]?.label ??
    status.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase())
  );
}

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
