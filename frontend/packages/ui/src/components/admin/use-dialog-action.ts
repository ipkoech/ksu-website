"use client";

import { useEffect, useRef, useState } from "react";

/** Own only the dialog's pending/error presentation; consumers own the mutation. */
export function useDialogAction({
  open,
  onAction,
  pending: externalPending = false,
  disabled = false,
}: {
  open: boolean;
  onAction: () => Promise<void>;
  pending?: boolean;
  disabled?: boolean;
}) {
  const inFlight = useRef(false);
  const [localPending, setLocalPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) setFailed(false);
  }, [open]);

  const run = async () => {
    if (disabled || externalPending || inFlight.current) return;
    // Lock synchronously, before a parent mutation flag or React render arrives.
    inFlight.current = true;
    setLocalPending(true);
    setFailed(false);
    try {
      await onAction();
    } catch {
      // Keep rejection details out of generic UI. A consumer may provide its
      // own domain-specific error handling; otherwise show a retryable fallback.
      setFailed(true);
    } finally {
      inFlight.current = false;
      setLocalPending(false);
    }
  };

  return {
    pending: externalPending || localPending,
    failed,
    run,
    canDismiss: () => !externalPending && !inFlight.current,
  };
}
