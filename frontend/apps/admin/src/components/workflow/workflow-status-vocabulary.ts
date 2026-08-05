// Server-safe workflow status vocabulary. This module must NOT carry
// "use client": the portal registry imports these values from server
// components (e.g. generateStaticParams collection), where exports of a
// client module become client-reference proxies and spreading them throws.

export type WorkflowStatusTone =
  | "gray"
  | "amber"
  | "orange"
  | "blue"
  | "green"
  | "red";

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
