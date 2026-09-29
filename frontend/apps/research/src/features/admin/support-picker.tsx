"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceSupportApi } from "@ksu/api-client/research";
import { Problem } from "./problem";
import { useResearchWorkspace } from "./admin-shell";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";

export function SupportPicker({ kind, disabled, onSelect }: { kind: "media" | "persons"; disabled?: boolean; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return <><Button type="button" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>Choose {kind === "media" ? "document or media" : "person"}</Button>
    {open && <DirectoryDialog kind={kind} onClose={() => setOpen(false)} onSelect={id => { onSelect(id); setOpen(false); }} />}</>;
}
function DirectoryDialog({ kind, onClose, onSelect }: { kind: "media" | "persons"; onClose: () => void; onSelect: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), [search, setSearch] = useState(""), [applied, setApplied] = useState(""), [page, setPage] = useState(1);
  const { context } = useResearchWorkspace(), command = useWorkspaceCommand();
  const [file, setFile] = useState<File | null>(null), [isPublic, setIsPublic] = useState(false), [inputError, setInputError] = useState("");
  const load = useCallback((signal: AbortSignal) => researchWorkspaceSupportApi.list(kind, page, applied, signal), [kind, page, applied]);
  const { state, reload } = useWorkspaceRead(load);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useUnsavedGuard(command.locked);
  function upload() {
    if (command.locked) return;
    if (!file || file.size === 0 || file.size > 24 * 1024 * 1024) { setInputError("Choose a non-empty file no larger than 24 MiB."); return; }
    const selected = file, visibility = isPublic;
    command.execute(key => researchWorkspaceSupportApi.upload(selected, visibility, key), item => onSelect(item.id));
  }
  return <dialog ref={dialog} className="rw-dialog" aria-labelledby="rw-directory-title" onCancel={event => { if (command.locked) event.preventDefault(); else onClose(); }}>
    <p className="rw-eyebrow">MAIN SERVICE DIRECTORY</p><h2 id="rw-directory-title">{kind === "media" ? "Documents and media" : "Choose a person"}</h2>
    <p>Only results returned for your current account are shown. Selecting a reference changes the open form; save that form to persist its link.</p>
    <label htmlFor="rw-directory-search">Search directory</label><div className="rw-picker-search"><input id="rw-directory-search" value={search} maxLength={255} disabled={command.locked} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); setApplied(search.trim()); setPage(1); } }} />
      <Button type="button" variant="outline" disabled={command.locked} onClick={() => { setApplied(search.trim()); setPage(1); }}>Search</Button></div>
    {state.status === "loading" ? <WorkspaceLoading label="Loading authorized directory…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      <div className="rw-picker-results">{state.data.data.map(item => <Button type="button" variant="outline" key={item.id} disabled={command.locked} onClick={() => onSelect(item.id)}><span><strong>{item.label}</strong><small>{item.detail}{kind === "media" ? ` · ${item.is_public === true ? "Public media" : item.is_public === false ? "Private media" : "Visibility not returned"}` : ""}</small><small>{item.id}</small></span></Button>)}</div>
      {!state.data.data.length && <p>No matching records on this page.</p>}
      <div className="rw-history-paging"><Button type="button" variant="outline" disabled={page <= 1 || command.locked} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page} · {state.data.total} matches</span><Button type="button" variant="outline" disabled={page >= state.data.pages || command.locked} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </>}
    {kind === "media" && context.capabilities["media.upload"] === true && <section className="rw-upload-area"><h3>Upload and select</h3>
      <p className="rw-help">Uploading stores a separate Main media record. Cancelling the parent form does not delete uploaded media. Private media is the default.</p>
      <label htmlFor="rw-upload-file">File · up to 24 MiB</label><input id="rw-upload-file" type="file" disabled={command.locked} onChange={event => { command.reset(); setInputError(""); setFile(event.target.files?.[0] ?? null); }} />
      <label className="rw-checkbox-label"><input type="checkbox" checked={isPublic} disabled={command.locked} onChange={event => { command.reset(); setIsPublic(event.target.checked); }} />Make this media publicly accessible</label>
      {isPublic && <p className="rw-field-error">Public files may be accessed outside the administrative workspace. Do not publish confidential material.</p>}
      {inputError && <p role="alert" className="rw-field-error">{inputError}</p>}
      <Button type="button" disabled={command.locked || !file} loading={command.pending} onClick={upload}>Upload and select file</Button></section>}
    {command.error && <Problem problem={command.error} onRetry={command.retry} command researchRecovery={false} />}
    <div className="rw-dialog-actions"><Button type="button" variant="outline" disabled={command.locked} onClick={onClose}>Cancel selection</Button></div>
  </dialog>;
}
