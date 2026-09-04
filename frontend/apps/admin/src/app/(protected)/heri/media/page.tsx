"use client";

import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";
import { HeriMediaUpload } from "../_components/heri-media-upload";

export default function HeriMediaPage() {
  return <div className="min-h-full bg-slate-50/70"><header className="border-b border-slate-200 bg-white px-6 py-8 md:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">HERI Africa operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Media library</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Upload, organise, and prepare accessible images and documents for the chair’s public research platform.</p></header><div className="space-y-8 py-8"><div className="px-6 md:px-10"><HeriMediaUpload onUploaded={() => window.location.reload()} /></div><HeriCrudWorkspace config={{ resource: "media", title: "Asset catalogue", description: "Review accessibility metadata, credits, focal points, and storage details.", permission: "heri.media.write", fields: [{ name: "file_name", label: "File name", required: true }, { name: "mime_type", label: "MIME type", required: true }, { name: "file_size", label: "File size", type: "number" }, { name: "public_url", label: "Public URL" }, { name: "alt_text", label: "Alt text", type: "textarea", required: true }, { name: "caption", label: "Caption", type: "textarea" }, { name: "credit", label: "Credit" }, { name: "focal_x", label: "Focal X", type: "number" }, { name: "focal_y", label: "Focal Y", type: "number" }] }} /></div></div>;
}
