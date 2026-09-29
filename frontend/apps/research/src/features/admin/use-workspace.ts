"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RWCommandController, rwProblem } from "@ksu/api-client/research";
import type { RWProblem } from "@ksu/api-client/research";

export type WorkspaceRead<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: RWProblem };
export function useWorkspaceRead<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ load: typeof load; state: WorkspaceRead<T> }>({ load, state: { status: "loading" } });
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setResult({ load, state: { status: "loading" } });
    void load(controller.signal).then(data => {
      if (current) setResult({ load, state: { status: "ready", data } });
    }).catch(error => {
      if (current && !controller.signal.aborted) setResult({ load, state: { status: "error", error: rwProblem(error) } });
    });
    return () => { current = false; controller.abort(); };
  }, [load, revision]);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  // A resource switch must never briefly render the previous resource's data.
  const state: WorkspaceRead<T> = result.load === load ? result.state : { status: "loading" };
  return { state, reload };
}
export function useWorkspaceCommand() {
  const [controller] = useState(() => new RWCommandController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => { controller.setActive(true); return () => controller.setActive(false); }, [controller]);
  function execute<T>(request: (key: string) => Promise<T>, confirmed: (result: T) => void) {
    void controller.execute(request, confirmed);
  }
  return { execute, retry: () => { void controller.retry(); }, reset: controller.reset,
    ...state, locked: state.pending || Boolean(state.error?.uncertain) };
}
export function useUnsavedGuard(active: boolean) {
  const dismissed = useRef(false);
  useEffect(() => {
    if (!active) return;
    dismissed.current = false;
    const unload = (event: BeforeUnloadEvent) => { if (dismissed.current) return; event.preventDefault(); event.returnValue = ""; };
    const navigate = (event: MouseEvent) => {
      if (dismissed.current) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const url = new URL(target.href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm("Leave this record? Unsaved form input will be lost. Research command metadata remains in Command recovery; credentials and form contents do not. Reconcile an uncertain outcome before starting a new command.")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); };
  }, [active]);
  return useCallback(() => { dismissed.current = true; }, []);
}
