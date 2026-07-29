"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Search, UploadCloud } from "lucide-react";
import { toast } from "@ksu/ui";
import { heriRequest, type HeriRecord } from "@/lib/api/heri";
import { getStoredAccessToken } from "@ksu/auth";

type MediaAsset = HeriRecord & { file_name?: string; public_url?: string; mime_type?: string };

export function HeriMediaPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const result = await heriRequest<{ data: MediaAsset[] }>(`/admin/media?per_page=50${search ? `&search=${encodeURIComponent(search)}` : ""}`); setAssets(result.data); } catch { toast.error("Unable to load HERI media"); } finally { setLoading(false); } }, [search]);
  useEffect(() => { void load(); }, [load]);
  const upload = async (file?: File) => { if (!file) return; setUploading(true); try { const token = getStoredAccessToken(); const response = await fetch(`${process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri"}/admin/media/upload?folder=heri&filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file, credentials: "include", headers: { "Content-Type": file.type || "application/octet-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }); if (!response.ok) throw new Error("Upload failed"); const asset = await response.json() as MediaAsset; onChange(asset.public_url ?? asset.id); toast.success("Media uploaded"); await load(); } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to upload media"); } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; } };
  return <div className="mt-1 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" /><input aria-label="Search HERI media" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void load(); } }} placeholder="Search media…" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm" /></div><button type="button" onClick={() => void load()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">Search</button><input ref={inputRef} type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={(event) => void upload(event.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}Upload</button></div><select aria-label="Choose HERI media" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">{loading ? "Loading media…" : "Choose an asset…"}</option>{assets.map((asset) => <option key={asset.id} value={asset.public_url ?? asset.id}>{asset.file_name ?? asset.id} {asset.mime_type ? `· ${asset.mime_type}` : ""}</option>)}</select>{value && <p className="flex items-center gap-2 truncate text-xs text-slate-500"><ImageIcon className="size-3.5" />{value}</p>}</div>;
}
