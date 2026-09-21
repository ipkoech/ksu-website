"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDialogAction } from "./use-dialog-action";

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemCount?: number;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
  requireConfirmation?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Delete item",
  description,
  itemName = "DELETE",
  itemCount = 1,
  onConfirm,
  isDeleting = false,
  requireConfirmation,
}: DeleteConfirmDialogProps) {
  const [confirmation, setConfirmation] = React.useState("");
  const needsTypedConfirmation = requireConfirmation ?? itemCount > 1;
  const canConfirm = !needsTypedConfirmation || confirmation === itemName;
  const confirmationId = React.useId();
  const action = useDialogAction({
    open,
    onAction: onConfirm,
    pending: isDeleting,
    disabled: !canConfirm,
  });

  React.useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => action.canDismiss() && onOpenChange(nextOpen)}
    >
      <DialogContent className="sm:max-w-lg" aria-busy={action.pending}>
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ??
              (itemCount > 1
                ? `This will permanently delete ${itemCount} items.`
                : `This will permanently delete ${itemName}.`)}
          </DialogDescription>
        </DialogHeader>
        {needsTypedConfirmation ? (
          <div className="space-y-2">
            <p id={confirmationId} className="text-sm text-muted-foreground">
              Type{" "}
              <span className="font-medium text-foreground">{itemName}</span> to
              confirm.
            </p>
            <Input
              aria-labelledby={confirmationId}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={action.pending}
            />
          </div>
        ) : null}
        {action.failed ? (
          <p role="alert" className="text-sm text-destructive">
            Unable to delete this item. Please try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={action.pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={action.pending}
            disabled={!canConfirm}
            onClick={action.run}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
