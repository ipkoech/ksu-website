"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  Archive,
  Check,
  CircleX,
  Clock3,
  FilePenLine,
  Send,
  Undo2,
} from "lucide-react";
import {
  contentWorkflowApi,
  type ContentWorkflowAction,
  type ContentWorkflowQueueItem,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@ksu/ui/components";

type WorkflowActionDefinition = {
  action: ContentWorkflowAction;
  label: string;
  icon: typeof Check;
  variant?: "default" | "outline" | "secondary" | "destructive";
  needsComment?: boolean;
  needsSchedule?: boolean;
};

const workflowActionsByStatus: Record<string, WorkflowActionDefinition[]> = {
  submitted: [
    { action: "start_review", label: "Start review", icon: FilePenLine },
  ],
  in_review: [
    {
      action: "request_changes",
      label: "Request changes",
      icon: Undo2,
      needsComment: true,
    },
    { action: "approve", label: "Approve", icon: Check },
    {
      action: "reject",
      label: "Reject",
      icon: CircleX,
      variant: "destructive",
      needsComment: true,
    },
  ],
  approved: [
    {
      action: "schedule",
      label: "Schedule",
      icon: Clock3,
      needsSchedule: true,
    },
    { action: "publish", label: "Publish", icon: Send },
  ],
  scheduled: [
    { action: "publish", label: "Publish", icon: Send },
    {
      action: "unpublish",
      label: "Unpublish",
      icon: Undo2,
      variant: "outline",
    },
  ],
  published: [
    {
      action: "unpublish",
      label: "Unpublish",
      icon: Undo2,
      variant: "outline",
    },
  ],
};

export function WorkflowActions({
  item,
  canReview,
  canPublish,
  canManage,
  onCompleted,
}: {
  item: ContentWorkflowQueueItem;
  canReview: boolean;
  canPublish: boolean;
  canManage: boolean;
  onCompleted: () => void;
}) {
  const [pendingAction, setPendingAction] =
    useState<WorkflowActionDefinition | null>(null);
  const [comments, setComments] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const mutation = useMutation({
    mutationFn: ({
      action,
      payload,
    }: {
      action: ContentWorkflowAction;
      payload?: Record<string, unknown>;
    }) =>
      contentWorkflowApi.action(item.content_type, item.id, action, payload),
    onSuccess: (_, variables) => {
      toast.success(`${actionLabel(variables.action)} completed`);
      setPendingAction(null);
      setComments("");
      setScheduledFor("");
      onCompleted();
    },
    onError: () => toast.error("Workflow action could not be completed"),
  });

  const permittedActions = (workflowActionsByStatus[item.status] ?? []).filter(
    (definition) =>
      definition.action === "publish" ||
      definition.action === "schedule" ||
      definition.action === "unpublish"
        ? canPublish
        : canReview,
  );
  const canArchive = canManage && item.status !== "archived";

  function submitPendingAction() {
    if (!pendingAction) return;
    if (pendingAction.needsComment && !comments.trim()) {
      toast.error("A review note is required for this action");
      return;
    }
    if (pendingAction.needsSchedule && !scheduledFor) {
      toast.error("Choose a publication date and time");
      return;
    }
    mutation.mutate({
      action: pendingAction.action,
      payload: {
        ...(comments.trim() ? { comments: comments.trim() } : {}),
        ...(scheduledFor
          ? { scheduled_for: new Date(scheduledFor).toISOString() }
          : {}),
      },
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canManage ? (
          <Button asChild size="sm" variant="outline">
            <Link href={item.edit_path}>
              <FilePenLine />
              Edit
            </Link>
          </Button>
        ) : null}
        {permittedActions.map((definition) => {
          const Icon = definition.icon;
          return (
            <Button
              key={definition.action}
              type="button"
              size="sm"
              variant={definition.variant ?? "default"}
              onClick={() => setPendingAction(definition)}
            >
              <Icon />
              {definition.label}
            </Button>
          );
        })}
        {canArchive ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setPendingAction({
                action: "archive",
                label: "Archive",
                icon: Archive,
                variant: "destructive",
              })
            }
          >
            <Archive />
            Archive
          </Button>
        ) : null}
      </div>

      <Dialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) =>
          !open && !mutation.isPending && setPendingAction(null)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.label ?? "Workflow action"}
            </DialogTitle>
            <DialogDescription>{item.title}</DialogDescription>
          </DialogHeader>
          {pendingAction?.needsComment ? (
            <div className="space-y-2">
              <Label htmlFor="workflow-comments">Review note</Label>
              <Textarea
                id="workflow-comments"
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Add the decision context"
                rows={5}
              />
            </div>
          ) : null}
          {pendingAction?.needsSchedule ? (
            <div className="space-y-2">
              <Label htmlFor="workflow-schedule">Publish at</Label>
              <Input
                id="workflow-schedule"
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={pendingAction?.variant ?? "default"}
              onClick={submitPendingAction}
              loading={mutation.isPending}
            >
              {pendingAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function actionLabel(action: ContentWorkflowAction) {
  return action
    .replace(/_/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}
