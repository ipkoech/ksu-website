"use client";

import { useCallback, useEffect, useRef } from "react";

/** Debounce user edits, never prop hydration or callback identity changes. */
export function useDebouncedSearch(onChange?: (value: string) => void) {
  const callback = useRef(onChange);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    callback.current = onChange;
    if (!onChange) cancel();
  }, [onChange, cancel]);
  useEffect(() => cancel, [cancel]);

  const schedule = useCallback(
    (value: string) => {
      cancel();
      timer.current = setTimeout(() => {
        timer.current = null;
        callback.current?.(value);
      }, 300);
    },
    [cancel],
  );

  return { schedule, cancel };
}
