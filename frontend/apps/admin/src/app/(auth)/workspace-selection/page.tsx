"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { workspacesApi } from "@ksu/api-client";
import type { WorkspaceContext } from "@ksu/api-client";
import { isSafeInternalPath } from "@/lib/auth-routing";

const workspaceDestinations: Record<string, string> = {
  "school-admin": "/schools",
  "research-admin": "/research",
  "library-admin": "/library",
  "heri-admin": "/heri-portal",
  "web-master": "/admin",
  "communications-admin": "/corporate-communication",
  "department-admin": "/departments",
  "system-admin": "/super-admin",
  schools: "/schools",
  research: "/research",
  library: "/library",
  heri: "/heri-portal",
  main: "/admin",
  system: "/super-admin",
  corporate: "/corporate-communication",
};

export default function WorkspaceSelectionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState<WorkspaceContext[]>([]);
  const [selected, setSelected] = useState("");
  const [selectedScope, setSelectedScope] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { workspacesApi.list().then((response) => setItems(response.data)).catch(() => setItems([])); }, []);

  async function continueToWorkspace() {
    const workspace = items.find((item) => item.workspace === selected);
    if (!workspace) return;
    setBusy(true);
    setError(null);
    try {
      const scope = workspace.selected_scope ?? workspace.scopes.find((item) => `${item.scope_type}:${item.scope_id ?? ""}` === selectedScope) ?? (workspace.scopes.length === 1 ? workspace.scopes[0] : undefined);
      if (!scope) { setError("Select an authorized scope before continuing."); return; }
      await workspacesApi.activate(workspace.workspace, { scope });
      const redirect = params.get("redirect");
      const workspacePath = workspaceDestinations[workspace.workspace];
      if (!workspacePath) {
        setError("This workspace does not have a configured destination.");
        return;
      }
      router.replace(isSafeInternalPath(redirect) ? redirect : workspacePath);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to activate the workspace. Please try again.");
    } finally { setBusy(false); }
  }

  const activeWorkspace = items.find((item) => item.workspace === selected);
  return <main className="flex min-h-screen items-center justify-center bg-muted/50 p-4"><Card className="w-full max-w-lg"><CardHeader><CardTitle>Choose a workspace</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Select the workspace you want to open.</p>{error ? <Alert variant="destructive"><AlertTitle>Unable to open workspace</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}<div className="space-y-2">{items.map((item) => <label key={item.workspace} className="flex cursor-pointer items-center gap-3 rounded-md border p-3"><input type="radio" name="workspace" value={item.workspace} checked={selected === item.workspace} onChange={() => { setSelected(item.workspace); setSelectedScope(item.selected_scope ? `${item.selected_scope.scope_type}:${item.selected_scope.scope_id ?? ""}` : item.scopes.length === 1 ? `${item.scopes[0].scope_type}:${item.scopes[0].scope_id ?? ""}` : ""); setError(null); }} /><span>{item.label ?? item.workspace}</span></label>)}</div>{activeWorkspace && activeWorkspace.scopes.length > 1 ? <fieldset className="space-y-2"><legend className="text-sm font-medium">Choose scope</legend>{activeWorkspace.scopes.map((scope) => { const value = `${scope.scope_type}:${scope.scope_id ?? ""}`; return <label key={value} className="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="radio" name="scope" value={value} checked={selectedScope === value} onChange={() => setSelectedScope(value)} /><span>{scope.scope_type}{scope.scope_id ? ` · ${scope.scope_id}` : ""}</span></label>; })}</fieldset> : null}<Button className="w-full" disabled={!selected || busy || Boolean(activeWorkspace && activeWorkspace.scopes.length > 1 && !selectedScope)} loading={busy} onClick={continueToWorkspace}>Continue</Button></CardContent></Card></main>;
}
