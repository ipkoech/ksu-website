"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import {
  contentWorkflowApi,
  usersApi,
  type ContentWorkflowLog,
  type ContentWorkflowQueueItem,
} from "@ksu/api-client";
import { Skeleton } from "@ksu/ui/components";

/**
 * Plain-language labels for every workflow log action. Reused wherever a
 * workflow action needs to be shown to a non-technical user.
 */
export const WORKFLOW_ACTION_LABELS: Record<string, string> = {
  submit: "Submitted for review",
  start_review: "Review started",
  request_changes: "Changes requested",
  approve: "Approved — ready to publish",
  schedule: "Scheduled for publishing",
  publish: "Published",
  unpublish: "Taken off the website",
  reject: "Not approved",
  archive: "Moved to archive",
  edit_reset: "Edited — moved back to draft",
  withdraw: "Withdrawn back to draft",
  review_edit: "Edited during review",
  system_publish: "Published automatically (scheduled)",
  system_expire: "Unpublished automatically (expiry date reached)",
};

export function workflowActionLabel(action: string): string {
  return (
    WORKFLOW_ACTION_LABELS[action] ??
    action.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase())
  );
}

interface RecordHistoryProps {
  contentType: string;
  contentId: string;
}

/**
 * Newest-first timeline of every workflow action recorded for a record.
 * Fetches GET /api/v1/content-workflow/{type}/{id}/logs.
 */
export function RecordHistory({ contentType, contentId }: RecordHistoryProps) {
  const logsQuery = useQuery({
    queryKey: ["workflow-logs", contentType, contentId],
    queryFn: () =>
      contentWorkflowApi.logs(
        contentType as ContentWorkflowQueueItem["content_type"],
        contentId,
      ),
  });

  if (logsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (logsQuery.isError) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        The history could not be loaded. Try again in a moment.
      </p>
    );
  }

  const entries = [...(logsQuery.data?.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
        <History className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No history yet — actions like submitting, approving and publishing will
          show up here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0 py-2">
      {entries.map((entry, index) => (
        <HistoryEntry
          key={entry.id}
          entry={entry}
          isLast={index === entries.length - 1}
        />
      ))}
    </ol>
  );
}

function HistoryEntry({
  entry,
  isLast,
}: {
  entry: ContentWorkflowLog;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <span className="mt-1 size-2.5 shrink-0 rounded-full border-2 border-primary bg-background" />
        {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{workflowActionLabel(entry.action)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <ActorName actorId={entry.actor_id ?? null} />
          {" · "}
          <time dateTime={entry.created_at} title={absoluteTime(entry.created_at)}>
            {relativeTime(entry.created_at)}
          </time>
        </p>
        {entry.comments ? (
          <blockquote className="mt-2 rounded-md border-l-2 border-muted-foreground/30 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {entry.comments}
          </blockquote>
        ) : null}
      </div>
    </li>
  );
}

function ActorName({ actorId }: { actorId: string | null }) {
  const userQuery = useQuery({
    queryKey: ["workflow-log-actor", actorId],
    queryFn: () => usersApi.get(actorId!),
    enabled: Boolean(actorId),
    staleTime: Infinity,
    retry: false,
  });

  if (!actorId) return <span>System</span>;
  const name = userQuery.data?.data?.full_name;
  return <span>{name || `User ${actorId.slice(0, 8)}`}</span>;
}

function absoluteTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  let duration = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return formatter.format(Math.round(duration), unit);
    duration /= amount;
  }
  return absoluteTime(value);
}
