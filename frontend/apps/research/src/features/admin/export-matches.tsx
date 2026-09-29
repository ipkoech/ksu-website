"use client";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { researchOperationsApi, rwProblem } from "@ksu/api-client/research";
import type { RWFilters, RWModule, RWProblem } from "@ksu/api-client/research";
import { Problem } from "./problem";
export function ExportMatches({ module, filters }: { module: RWModule; filters: RWFilters }) {
  const [open, setOpen] = useState(false);
  return <><Button type="button" variant="outline" onClick={() => setOpen(true)}><Download aria-hidden="true" />Export matching records</Button>{open && <ExportDialog module={module} filters={filters} close={() => setOpen(false)} />}</>;
}
function ExportDialog({ module, filters, close }: { module: RWModule; filters: RWFilters; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), active = useRef(true), request = useRef<AbortController>(null);
  const [format, setFormat] = useState<"csv" | "json">("csv"), [pending, setPending] = useState(false), [error, setError] = useState<RWProblem | null>(null), [saved, setSaved] = useState(false);
  useEffect(() => { const node = ref.current; active.current = true; node?.showModal(); return () => { active.current = false; request.current?.abort(); node?.close(); }; }, []);
  async function download() {
    if (pending) return;
    setPending(true); setError(null); setSaved(false); const controller = new AbortController(); request.current = controller;
    try {
      const blob = await researchOperationsApi.export(module.key, filters, format, controller.signal);
      if (!active.current) return;
      const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `${module.key}-matching-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); setSaved(true);
    } catch (failure) { if (active.current && !controller.signal.aborted) setError(rwProblem(failure)); }
    finally { if (active.current) setPending(false); }
  }
  return <dialog ref={ref} className="rw-dialog" aria-labelledby="rw-export-title" onCancel={() => { request.current?.abort(); close(); }}><p className="rw-eyebrow">AUTHORIZED DATA EXPORT</p><h2 id="rw-export-title">Export matching {module.label.toLowerCase()}</h2><p>The same search, filters and signed scope as this list are applied. The result includes all matches, not just the current page.</p><p className="rw-help">A request above 100,000 rows or 50 MiB is rejected. Nothing is silently truncated. Downloaded research data remains your responsibility.</p><label>Format<select disabled={pending} value={format} onChange={event => setFormat(event.target.value as "csv" | "json")}><option value="csv">CSV spreadsheet</option><option value="json">JSON with native value types</option></select></label>
    {error && <Problem problem={error} onRetry={() => { void download(); }} />}{saved && <WorkspaceFeedback title="Download requested" tone="success">The service returned the complete export and the browser download was requested.</WorkspaceFeedback>}<div className="rw-dialog-actions"><Button type="button" variant="outline" onClick={() => { request.current?.abort(); close(); }}>{pending ? "Cancel download" : "Close"}</Button><Button type="button" loading={pending} disabled={pending} onClick={() => { void download(); }}>Download export</Button></div></dialog>;
}
