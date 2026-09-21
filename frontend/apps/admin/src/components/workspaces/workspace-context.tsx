"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { workspacesApi, type WorkspaceContext } from "@ksu/api-client";

type WorkspaceState = {
  workspaces: WorkspaceContext[];
  active: WorkspaceContext | null;
  loading: boolean;
  activate: (workspace: WorkspaceContext) => Promise<void>;
};
const Context = createContext<WorkspaceState>({ workspaces: [], active: null, loading: true, activate: async () => undefined });
const key = "ksu:active-workspace";

export function WorkspaceContextProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceContext[]>([]);
  const [active, setActive] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let mounted = true; workspacesApi.list().then((r) => { if (!mounted) return; setWorkspaces(r.data); const saved = sessionStorage.getItem(key); const found = r.data.find((w) => w.workspace === saved); if (found) setActive(found); else if (r.data.length === 1 && !r.data[0].selection_required) void workspacesApi.activate(r.data[0].workspace, { scope: r.data[0].selected_scope ?? undefined }).then((result) => { if (mounted) { setActive(result.data.context); sessionStorage.setItem(key, result.data.context.workspace); } }); }).finally(() => mounted && setLoading(false)); return () => { mounted = false; }; }, []);
  const value = useMemo(() => ({ workspaces, active, loading, activate: async (workspace: WorkspaceContext) => { const result = await workspacesApi.activate(workspace.workspace, { scope: workspace.selected_scope ?? undefined }); setActive(result.data.context); sessionStorage.setItem(key, result.data.context.workspace); } }), [active, loading, workspaces]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useWorkspaceContext = () => useContext(Context);
