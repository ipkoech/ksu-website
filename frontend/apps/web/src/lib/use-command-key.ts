"use client";

import { useRef } from "react";

/** One key per submitted endpoint/payload, retained after uncertain failures. */
export function useCommandKey() {
  const command = useRef<{ fingerprint: string; key: string } | null>(null);
  return {
    forPayload(path: string, payload: unknown) {
      const fingerprint = JSON.stringify([path, payload]);
      if (command.current?.fingerprint !== fingerprint) {
        command.current = { fingerprint, key: crypto.randomUUID() };
      }
      return command.current.key;
    },
    confirmed() {
      command.current = null;
    },
  };
}
