"use client";

import { useState } from "react";
import { getStoredAccessToken } from "@ksu/auth";

const API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";

export function HeriMediaUpload({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!file) return;
    setBusy(true); setMessage(null);
    try {
      const token = getStoredAccessToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const upload = await fetch(`${API}/admin/media/upload?folder=heri&filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file, credentials: "include", headers: { "Content-Type": file.type || "application/octet-stream", ...authHeaders } });
      if (!upload.ok) throw new Error((await upload.json().catch(() => ({}))).detail ?? "Upload failed");
      const asset = await upload.json() as { id: string };
      const patch = await fetch(`${API}/admin/media/${asset.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json", ...authHeaders }, body: JSON.stringify({ alt_text: altText }) });
      if (!patch.ok) throw new Error("Upload succeeded, but metadata could not be saved");
      setFile(null); setAltText(""); setMessage("Asset uploaded and metadata saved."); onUploaded();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Upload failed"); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><label className="text-sm font-medium text-slate-700">File<input type="file" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" /></label><label className="text-sm font-medium text-slate-700">Alt text<input value={altText} required onChange={(event) => setAltText(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><button disabled={busy || !file} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Uploading…" : "Upload asset"}</button></div>{message && <p className="mt-3 text-sm text-slate-700" role="status">{message}</p>}</form>;
}
