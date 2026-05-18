"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui";

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
  const handleConfirm = async () => {
    if (disabled || isLoading) return;
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            {variant === "destructive" ? <AlertTriangle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            loading={isLoading}
            disabled={disabled}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}