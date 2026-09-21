"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useDialogAction } from "./use-dialog-action";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const action = useDialogAction({
    open,
    onAction: onConfirm,
    pending: isLoading,
    disabled,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => action.canDismiss() && onOpenChange(nextOpen)}
    >
      <DialogContent className="sm:max-w-lg" aria-busy={action.pending}>
        <DialogHeader>
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
          >
            {variant === "destructive" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <Info className="h-6 w-6" />
            )}
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {action.failed ? (
          <p role="alert" className="text-sm text-destructive">
            Unable to complete this action. Please try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={action.pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            loading={action.pending}
            disabled={disabled}
            onClick={action.run}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
