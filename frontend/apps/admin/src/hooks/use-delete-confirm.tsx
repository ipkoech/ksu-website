"use client";

import { useState } from "react";
import { DeleteConfirmDialog } from "@ksu/ui/components";

interface DeleteConfirmState {
  title?: string;
  description?: string;
  itemName: string;
  itemCount?: number;
  requireConfirmation?: boolean;
  onConfirm: () => Promise<void> | void;
}

type DeleteConfirmOptions = Omit<DeleteConfirmState, "onConfirm"> & {
  onConfirm: () => Promise<void> | void;
};

export function useDeleteConfirm() {
  const [state, setState] = useState<DeleteConfirmState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = (
    itemNameOrOptions: string | DeleteConfirmOptions,
    onConfirm?: () => Promise<void> | void,
  ) => {
    if (typeof itemNameOrOptions === "string") {
      setState({
        title: `Delete ${itemNameOrOptions}?`,
        itemName: itemNameOrOptions,
        onConfirm: onConfirm ?? (() => undefined),
      });
      return;
    }

    setState(itemNameOrOptions);
  };

  const dialog = (
    <DeleteConfirmDialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) setState(null);
      }}
      title={state?.title}
      description={state?.description}
      itemName={state?.itemName ?? "item"}
      itemCount={state?.itemCount}
      requireConfirmation={state?.requireConfirmation}
      isDeleting={isLoading}
      onConfirm={async () => {
        if (!state) return;
        setIsLoading(true);
        try {
          await state.onConfirm();
          setState(null);
        } finally {
          setIsLoading(false);
        }
      }}
    />
  );

  return { confirmDelete, dialog };
}
