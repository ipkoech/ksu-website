"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FilePenLine, Send } from "lucide-react";
import {
  contentWorkflowApi,
  type ContentWorkflowAction,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import { Button, ConfirmDialog } from "@ksu/ui/components";

interface NextActionDefinition {
  action: ContentWorkflowAction;
  label: string;
  confirmTitle: (title: string) => string;
  confirmDescription: (title: string) => string;
  successMessage: (title: string) => string;
  requires: "edit" | "review" | "publish";
}

/**
 * The single most-likely workflow action for each status. Destructive or
 * ambiguous actions (unpublish, reject, archive) intentionally stay in the
 * overflow menu — this button is only ever the obvious "next step".
 */
const NEXT_ACTION_BY_STATUS: Record<string, NextActionDefinition> = {
  draft: {
    action: "submit",
    label: "Submit for review",
    confirmTitle: () => "Submit for review?",
    confirmDescription: (title) =>
      `"${title}" will be sent to the review team. You can withdraw it before a review starts.`,
    successMessage: (title) => `"${title}" is now waiting for review.`,
    requires: "edit",
  },
  submitted: {
    action: "start_review",
    label: "Start review",
    confirmTitle: () => "Start reviewing?",
    confirmDescription: (title) =>
      `You will start the review of "${title}".`,
    successMessage: (title) => `Review of "${title}" started.`,
    requires: "review",
  },
  approved: {
    action: "publish",
    label: "Publish now",
    confirmTitle: () => "Publish now?",
    confirmDescription: (title) =>
      `"${title}" will appear on the public website immediately.`,
    successMessage: (title) => `"${title}" is now live on the website.`,
    requires: "publish",
  },
};

interface NextActionButtonProps {
  contentType: string;
  record: { id: string; workflow_status?: string | null };
  recordTitle: string;
  canEdit: boolean;
  canReview: boolean;
  canPublish: boolean;
  /** Opens the record editor — used for "Edit & resubmit" on changes_requested. */
  onEdit?: () => void;
  onCompleted?: () => void;
}

/**
 * One obvious primary action per record, based on its workflow status, so
 * non-technical users never need the review queue to know what to do next.
 */
export function NextActionButton({
  contentType,
  record,
  recordTitle,
  canEdit,
  canReview,
  canPublish,
  onEdit,
  onCompleted,
}: NextActionButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const status = record.workflow_status ?? "";
  const definition = NEXT_ACTION_BY_STATUS[status];

  const mutation = useMutation({
    mutationFn: (action: ContentWorkflowAction) =>
      contentWorkflowApi.actionByType(contentType, record.id, action),
    onSuccess: () => {
      toast.success(definition?.successMessage(recordTitle) ?? "Done");
      setConfirming(false);
      onCompleted?.();
    },
    onError: () => toast.error("The action could not be completed. Try again in a moment."),
  });

  if (status === "changes_requested" && canEdit && onEdit) {
    return (
      <Button type="button" size="sm" onClick={onEdit}>
        <FilePenLine data-icon="inline-start" />
        Edit &amp; resubmit
      </Button>
    );
  }

  if (!definition) return null;
  const permitted =
    definition.requires === "edit"
      ? canEdit
      : definition.requires === "review"
        ? canReview
        : canPublish;
  if (!permitted) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => setConfirming(true)}
      >
        <Send data-icon="inline-start" />
        {definition.label}
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setConfirming(false);
        }}
        title={definition.confirmTitle(recordTitle)}
        description={definition.confirmDescription(recordTitle)}
        confirmLabel={definition.label}
        onConfirm={async () => {
          try {
            await mutation.mutateAsync(definition.action);
          } catch {
            // handled by the mutation's onError toast
          }
        }}
        isLoading={mutation.isPending}
      />
    </>
  );
}
