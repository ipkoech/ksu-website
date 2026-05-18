"use client";

import { useState, useCallback } from "react";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  description: string;
  variant: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    description: "",
    variant: "default",
    onConfirm: () => {},
  });
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(
    (options: Omit<ConfirmState, "isOpen">) => {
      return new Promise<boolean>((resolve) => {
        setState({
          ...options,
          isOpen: true,
          onConfirm: async () => {
            setLoading(true);
            try {
              await options.onConfirm();
              resolve(true);
            } finally {
              setLoading(false);
              setState((s) => ({ ...s, isOpen: false }));
            }
          },
        });
      });
    },
    []
  );

  const confirmDelete = useCallback(
    (itemName: string, onConfirm: () => void | Promise<void>) => {
      return confirm({
        title: `Delete ${itemName}?`,
        description: `This action cannot be undone. This will permanently delete the ${itemName.toLowerCase()}.`,
        variant: "destructive",
        onConfirm,
      });
    },
    [confirm]
  );

  return {
    state,
    loading,
    confirm,
    confirmDelete,
    close: () => setState((s) => ({ ...s, isOpen: false })),
  };
}