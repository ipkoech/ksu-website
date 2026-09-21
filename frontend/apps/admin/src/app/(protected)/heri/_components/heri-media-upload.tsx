"use client";

import { useState } from "react";
import { heriRequest } from "@/lib/api/heri";
import { revalidatePublicContent } from "@/lib/api/public-revalidation";
import { X } from "lucide-react";

export function HeriMediaUpload({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [focalX, setFocalX] = useState("0.5");
  const [focalY, setFocalY] = useState("0.5");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!file) return;
    setBusy(true); setMessage(null);
    try {
      const asset = await heriRequest<{ id: string }>(`/admin/media/upload?folder=heri&filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      void revalidatePublicContent("heri", "media");
      await heriRequest(`/admin/media/${asset.id}`, { method: "PATCH", body: JSON.stringify({ alt_text: altText, caption, credit, focal_x: Number(focalX), focal_y: Number(focalY) }) });
      void revalidatePublicContent("heri", "media");
      setFile(null); setAltText(""); setCaption(""); setCredit(""); setFocalX("0.5"); setFocalY("0.5"); setMessage("Asset uploaded and metadata saved."); onUploaded();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Upload failed"); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">File<input type="file" required={!file} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" />{file && <span className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-600"><span className="truncate">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span><button type="button" onClick={() => setFile(null)} className="ml-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove selected file"><X className="size-4" /></button></span>}</label><label className="text-sm font-medium text-slate-700">Alt text<input value={altText} required onChange={(event) => setAltText(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-slate-700">Caption<input value={caption} onChange={(event) => setCaption(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-slate-700">Credit<input value={credit} onChange={(event) => setCredit(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-slate-700">Focal X (0–1)<input type="number" min="0" max="1" step="0.01" value={focalX} onChange={(event) => setFocalX(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-slate-700">Focal Y (0–1)<input type="number" min="0" max="1" step="0.01" value={focalY} onChange={(event) => setFocalY(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label></div><button disabled={busy || !file} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Uploading…" : "Upload asset"}</button>{message && <p className="mt-3 text-sm text-slate-700" role="status">{message}</p>}</form>;
}
