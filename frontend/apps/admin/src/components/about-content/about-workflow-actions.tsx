"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Archive, Check, Send, Undo2 } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "@ksu/ui/components";
import { usePermissions } from "@/hooks/use-permissions";
import {
  aboutWorkflowApi,
  type AboutWorkflowAction,
  type AboutWorkflowKind,
  type AboutWorkflowStatus,
} from "@/lib/api/about-content";

type ActionDefinition = {
  action: AboutWorkflowAction;
  label: string;
  icon: typeof Send;
  permission: "manage" | "review" | "publish";
  variant?: "default" | "outline" | "secondary" | "destructive";
  needsReason?: boolean;
};

const actionsByStatus: Record<AboutWorkflowStatus, ActionDefinition[]> = {
  draft: [{ action: "submit", label: "Submit for review", icon: Send, permission: "manage" }],
  changes_requested: [{ action: "submit", label: "Resubmit", icon: Send, permission: "manage" }],
  in_review: [
    { action: "request_changes", label: "Request changes", icon: Undo2, permission: "review", variant: "outline", needsReason: true },
    { action: "approve", label: "Approve", icon: Check, permission: "review" },
  ],
  approved: [
    { action: "publish", label: "Publish", icon: Send, permission: "publish" },
    { action: "archive", label: "Archive", icon: Archive, permission: "manage", variant: "outline" },
  ],
  published: [
    { action: "unpublish", label: "Unpublish", icon: Undo2, permission: "publish", variant: "outline" },
  ],
  archived: [],
};

export function AboutWorkflowActions({
  kind,
  id,
  status,
  onCompleted,
  compact = false,
}: {
  kind: AboutWorkflowKind;
  id: string;
  status: AboutWorkflowStatus;
  onCompleted: () => void | Promise<void>;
  compact?: boolean;
}) {
  const { hasAnyPermission } = usePermissions();
  const [pendingAction, setPendingAction] = useState<ActionDefinition | null>(null);
  const [reason, setReason] = useState("");

  const permissions = {
    manage: hasAnyPermission(["about.manage", "admin:*"]),
    review: hasAnyPermission(["content.review", "content.manage", "admin:*"]),
    publish: hasAnyPermission(["content.publish", "admin:*"]),
  };

  const mutation = useMutation({
    mutationFn: (definition: ActionDefinition) =>
      aboutWorkflowApi.transition(kind, id, definition.action, reason.trim()),
    onSuccess: async (_, definition) => {
      toast.success(`${definition.label} completed`);
      setPendingAction(null);
      setReason("");
      await onCompleted();
    },
    onError: () => toast.error("The workflow action could not be completed"),
  });

  const availableActions = actionsByStatus[status].filter(
    (definition) => permissions[definition.permission],
  );

  if (availableActions.length === 0) return null;

  function confirmAction() {
    if (!pendingAction) return;
    if (pendingAction.needsReason && !reason.trim()) {
      toast.error("Add a clear revision note before requesting changes");
      return;
    }
    mutation.mutate(pendingAction);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableActions.map((definition) => {
          const Icon = definition.icon;
          return (
            <Button
              key={definition.action}
              type="button"
              size={compact ? "sm" : "default"}
              variant={definition.variant ?? "default"}
              onClick={() => setPendingAction(definition)}
            >
              <Icon className="size-4" />
              {definition.label}
            </Button>
          );
        })}
      </div>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingAction?.label}</DialogTitle>
            <DialogDescription>
              This changes the editorial state immediately and may affect public visibility.
            </DialogDescription>
          </DialogHeader>
          {pendingAction?.needsReason ? (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="about-workflow-reason">Revision note</label>
              <Textarea
                id="about-workflow-reason"
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain what must change before approval"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingAction(null)}>Cancel</Button>
            <Button type="button" onClick={confirmAction} disabled={mutation.isPending}>
              {mutation.isPending ? "Working..." : pendingAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
