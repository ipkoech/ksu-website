"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { clearRWSettledJournal, listRWJournal, researchOperationsApi, settleRWReceipt, subscribeRWJournal } from "@ksu/api-client/research";
import type { RWJournalEntry } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";
export function CommandRecovery() {
  const { context, modules } = useResearchWorkspace(), [page, setPage] = useState(1), [selected, setSelected] = useState<RWJournalEntry | null>(null), [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const subject = context.subject;
  const loadLocal = useCallback(() => subject ? listRWJournal(subject) : Promise.resolve([]), [subject]);
  const local = useWorkspaceRead(loadLocal);
  const loadServer = useCallback((signal: AbortSignal) => researchOperationsApi.receipts(page, undefined, signal), [page]);
  const server = useWorkspaceRead(loadServer);
  useEffect(() => subscribeRWJournal(local.reload), [local.reload]);
  function refresh() { local.reload(); server.reload(); }
  if (!subject) return <WorkspaceFeedback title="Verified identity is required">Reload workspace access before viewing command receipts.</WorkspaceFeedback>;
  return <div className="rw-stack"><div className="rw-page-heading"><div><p className="rw-eyebrow">COMMAND RECOVERY</p><h1>Know what was saved</h1><p>Reconcile interrupted Research commands without storing or replaying their form contents.</p></div><Button type="button" variant="outline" onClick={refresh}>Refresh receipts</Button></div>
    <WorkspaceFeedback title="A missing receipt is not proof of failure">A request may still be in flight. Reconciliation either returns its recorded outcome or prevents that exact command from executing later. It never undoes an already committed change. Authentication and Main-service uploads are not part of this Research ledger.</WorkspaceFeedback>
    {message && <WorkspaceFeedback title="Recovery status" tone={messageTone}>{message}</WorkspaceFeedback>}
    <section className="rw-panel rw-inset"><div className="rw-section-heading"><h2>This browser’s command journal</h2><Button type="button" variant="outline" onClick={() => { void clearRWSettledJournal(subject).then(() => { setMessageTone("success"); setMessage("Settled local entries were cleared. Unresolved commands and server receipts were preserved."); local.reload(); }).catch(() => { setMessageTone("error"); setMessage("Local history could not be cleared. No server receipt was changed."); }); }}>Clear settled local history</Button></div><p className="rw-help">Only command keys, account ID, operation names and record IDs survive reload. No tokens, passwords, notes or form payloads are stored. Entries from a different account are not displayed.</p>
      {local.state.status === "loading" ? <WorkspaceLoading label="Reading local command metadata…" /> : local.state.status === "error" ? <Problem problem={local.state.error} onRetry={local.reload} /> : !local.state.data.length ? <p>No locally recorded Research commands for this account.</p> : <ul className="rw-connected-list">{local.state.data.map(entry => <li key={entry.key}><div><strong>{entry.operation} · {modules.find(module => module.key === entry.resource)?.label ?? entry.resource}</strong><p>{entry.state} · <time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT</time></p><code className="rw-wrap">{entry.key}</code><details><summary>Command details</summary><code className="rw-wrap">{entry.command}</code></details>{entry.record_id && modules.some(module => module.key === entry.resource) && <Link className="rw-text-link" href={`/admin/${entry.resource}/${entry.record_id}`}>Open current record</Link>}</div>{["pending", "uncertain"].includes(entry.state) && <Button type="button" variant="outline" onClick={() => setSelected(entry)}>Reconcile outcome</Button>}</li>)}</ul>}
    </section>
    <section className="rw-panel rw-inset"><h2>Your server receipts</h2><p className="rw-help">Research commands are matched to the authenticated account on the server. These summaries never reveal stored request payloads or response bodies.</p>{server.state.status === "loading" ? <WorkspaceLoading label="Loading server receipts…" /> : server.state.status === "error" ? <Problem problem={server.state.error} onRetry={server.reload} /> : <><p>{server.state.data.meta.total} receipts</p><div className="rw-table-scroll" role="region" aria-label="Server command receipts" tabIndex={0}><table className="rw-table"><caption className="sr-only">Current account Research command receipts</caption><thead><tr><th scope="col">Command and key</th><th scope="col">Outcome</th><th scope="col">HTTP status</th></tr></thead><tbody>{server.state.data.data.map(entry => <tr key={`${entry.key}:${entry.command}`}><td><code className="rw-wrap">{entry.command}</code><small>{entry.key}</small></td><td>{entry.outcome.replace(/_/g, " ")}</td><td>{entry.status_code ?? "Pending"}</td></tr>)}</tbody></table></div><div className="rw-pagination"><Button type="button" variant="outline" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page} of {Math.max(1, server.state.data.meta.total_pages)}</span><Button type="button" variant="outline" disabled={page >= server.state.data.meta.total_pages} onClick={() => setPage(value => value + 1)}>Next</Button></div></>}
    </section>
    {selected && <ReconcileDialog subject={subject} entry={selected} onClose={() => setSelected(null)} onConfirmed={(result, tone) => { setMessageTone(tone); setMessage(result); setSelected(null); refresh(); }} />}
  </div>;
}
function ReconcileDialog({ subject, entry, onClose, onConfirmed }: { subject: string; entry: RWJournalEntry; onClose: () => void; onConfirmed: (message: string, tone: "neutral" | "error" | "success") => void }) {
  const dialog = useRef<HTMLDialogElement>(null), command = useWorkspaceCommand();
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  useUnsavedGuard(command.locked);
  return <dialog ref={dialog} className="rw-dialog" aria-labelledby="rw-reconcile-title" onCancel={event => { if (command.locked) event.preventDefault(); else onClose(); }}><h2 id="rw-reconcile-title">Reconcile {entry.operation.toLowerCase()}</h2><p>The server will preserve an existing command outcome. If the command has not arrived, it will reserve its key as cancelled so a late copy cannot perform the action.</p><p>This does not undo an existing change. Reload the current record after reconciliation before starting another command.</p><code className="rw-wrap">{entry.key}</code>{command.error && <Problem problem={command.error} onRetry={command.retry} command />}<div className="rw-dialog-actions"><Button type="button" variant="outline" disabled={command.locked} onClick={onClose}>Cancel</Button><Button type="button" disabled={command.locked} loading={command.pending} onClick={() => command.execute(async key => {
    const receipt = await researchOperationsApi.reconcile(entry.key, entry.command, key);
    await settleRWReceipt(subject, entry, receipt);
    return receipt;
  }, receipt => onConfirmed(receipt.outcome === "pending" ? "The command is still pending. Its local reservation remains locked. Refresh receipts before any further action." : receipt.cancelled_before_execution ? "The command was cancelled before execution. Late delivery is fenced off. Reload the record before creating a replacement command." : receipt.outcome === "confirmed" ? "The server confirmed that the original command succeeded. It was not executed again." : "The server recorded a failed command. Its local reservation is released; reload and inspect the record before another action.", receipt.outcome === "pending" ? "neutral" : receipt.outcome === "recorded_failure" && !receipt.cancelled_before_execution ? "error" : "success"))}>Reconcile or cancel undelivered command</Button></div></dialog>;
}
