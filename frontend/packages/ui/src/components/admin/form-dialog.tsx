"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { useDialogAction } from "./use-dialog-action";

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: () => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-lg",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
} as const;

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
  size = "md",
}: FormDialogProps) {
  const action = useDialogAction({
    open,
    onAction: onSubmit,
    pending: isSubmitting,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => action.canDismiss() && onOpenChange(nextOpen)}
    >
      <DialogContent className={cn(sizeClasses[size], "gap-0 p-0")}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await action.run();
          }}
          aria-busy={action.pending}
        >
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 py-4">
            <div className="space-y-4">{children}</div>
            {action.failed ? (
              <p role="alert" className="mt-4 text-sm text-destructive">
                Unable to save changes. Please try again.
              </p>
            ) : null}
          </ScrollArea>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={action.pending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={action.pending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
