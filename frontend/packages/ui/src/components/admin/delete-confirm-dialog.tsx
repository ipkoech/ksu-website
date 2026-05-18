"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "../ui";

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

  React.useEffect(() => {
    if (!open) {
      setConfirmation("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isDeleting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ?? (
              itemCount > 1
                ? `This will permanently delete ${itemCount} items.`
                : `This will permanently delete ${itemName}.`
            )}
          </DialogDescription>
        </DialogHeader>
        {needsTypedConfirmation ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-medium text-foreground">{itemName}</span> to confirm.
            </p>
            <Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isDeleting}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
