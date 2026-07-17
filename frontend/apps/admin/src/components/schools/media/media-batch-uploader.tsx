"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  mediaApi,
  schoolPortalApi,
  type SchoolUploadBatch,
} from "@ksu/api-client";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

type PendingFile = {
  key: string;
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  role: string;
  display_order: number;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "failed";
  error?: string;
  batch?: SchoolUploadBatch;
};

export function MediaBatchUploader() {
  const { school } = useSchoolPortal();
  const [items, setItems] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const overall = useMemo(
    () => items.length ? items.reduce((sum, item) => sum + item.progress, 0) / items.length : 0,
    [items],
  );
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setItems((current) => [
      ...current,
      ...Array.from(files).map((file, index) => ({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ""),
        altText: "",
        role: "gallery",
        display_order: current.length + index,
        progress: 0,
        status: "pending" as const,
      })),
    ]);
  };
  const patch = (key: string, values: Partial<PendingFile>) =>
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...values } : item));
  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, display_order: order }));
    });
  };
  const uploadOne = async (item: PendingFile) => {
    patch(item.key, { status: "uploading", progress: 20, error: undefined });
    try {
      const batch = (
        await schoolPortalApi.media.createBatch([item.file], {
          targetEntityType: "school",
          targetEntityId: school.id,
          targetRole: item.role,
        })
      ).data;
      patch(item.key, { batch, progress: 80 });
      const uploaded = batch.files[0];
      if (uploaded?.media_id) {
        await mediaApi.update(uploaded.media_id, {
          title: item.title,
          alt_text: item.altText || null,
          metadata: { display_order: item.display_order, school_upload_role: item.role },
        });
      }
      let latest = batch;
      for (let attempt = 0; attempt < 40 && latest.status === "processing"; attempt += 1) {
        patch(item.key, {
          batch: latest,
          progress: Math.max(
            80,
            ((latest.completed_files + latest.failed_files) / latest.total_files) * 100,
          ),
          status: "processing",
        });
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        latest = (await schoolPortalApi.media.getBatch(batch.id)).data;
      }
      const failed = latest.failed_files > 0;
      patch(item.key, {
        batch: latest,
        progress: latest.status === "processing" ? 90 : 100,
        status: latest.status === "processing" ? "processing" : failed ? "failed" : "completed",
        error: latest.files[0]?.error ?? undefined,
      });
    } catch (caught) {
      patch(item.key, {
        status: "failed",
        progress: 100,
        error: caught instanceof Error ? caught.message : "Upload failed",
      });
    }
  };
  const uploadAll = async () => {
    setUploading(true);
    const pending = items.filter((item) => item.status === "pending");
    await Promise.allSettled(pending.map(uploadOne));
    setUploading(false);
  };
  const retry = async (item: PendingFile) => {
    const failedFile = item.batch?.files.find((file) => file.status === "failed");
    if (item.batch && failedFile) {
      patch(item.key, { status: "uploading", progress: 65 });
      try {
        await schoolPortalApi.media.retryFile(item.batch.id, failedFile.id);
        const batch = (await schoolPortalApi.media.getBatch(item.batch.id)).data;
        patch(item.key, { batch, status: batch.failed_files ? "failed" : "completed", progress: 100 });
      } catch (caught) {
        patch(item.key, { status: "failed", error: caught instanceof Error ? caught.message : "Retry failed" });
      }
    } else {
      await uploadOne(item);
    }
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-medium text-primary">School media</p>
        <h1 className="text-2xl font-semibold tracking-tight">Media Batch Uploader</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload images and documents concurrently with per-file metadata and retry.</p>
      </header>
      <Card>
        <CardHeader><CardTitle className="text-base">Select files</CardTitle><CardDescription>Images, PDF, Office documents, audio, and video are validated by the server.</CardDescription></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center transition-colors hover:bg-muted/40">
            <UploadCloud className="mb-3 size-8 text-primary" />
            <span className="font-medium">Choose multiple files</span>
            <span className="text-sm text-muted-foreground">or drag files onto this area</span>
            <Input className="sr-only" type="file" multiple onChange={(event) => addFiles(event.target.files)} />
          </label>
        </CardContent>
      </Card>
      {items.length ? (
        <>
          <div className="space-y-2"><div className="flex justify-between text-sm"><span>Overall batch progress</span><span>{Math.round(overall)}%</span></div><Progress value={overall} /></div>
          <section className="space-y-3">
            {items.map((item, index) => (
              <Card key={item.key}>
                <CardContent className="grid gap-4 p-4 md:grid-cols-[7rem_minmax(0,1fr)_10rem] md:items-center">
                  <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {item.file.type.startsWith("image/") ? <Image src={item.previewUrl} alt={item.altText || item.file.name} fill unoptimized className="object-cover" /> : item.file.type === "application/pdf" ? <FileText className="size-8 text-muted-foreground" /> : <ImageIcon className="size-8 text-muted-foreground" />}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1"><Label>Title</Label><Input value={item.title} onChange={(event) => patch(item.key, { title: event.target.value })} /></div>
                    <div className="space-y-1"><Label>Alt text</Label><Input value={item.altText} onChange={(event) => patch(item.key, { altText: event.target.value })} /></div>
                    <div className="space-y-1"><Label>Role</Label><Select value={item.role} onValueChange={(role) => patch(item.key, { role })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gallery">Gallery</SelectItem><SelectItem value="attachment">Attachment</SelectItem><SelectItem value="cover">Cover</SelectItem><SelectItem value="brochure">Brochure</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label>Status</Label><div className="flex h-9 items-center text-sm capitalize">{item.status} · {item.file.name}</div></div>
                    <Progress className="sm:col-span-2" value={item.progress} aria-label={`${item.file.name} progress`} />
                    {item.error ? <Alert variant="destructive" className="sm:col-span-2"><AlertDescription>{item.error}</AlertDescription></Alert> : null}
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label="Move file up" onClick={() => move(index, -1)}><ArrowUp className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Move file down" onClick={() => move(index, 1)}><ArrowDown className="size-4" /></Button>
                    {item.status === "failed" ? <Button size="icon" variant="ghost" aria-label="Retry upload" onClick={() => retry(item)}><RefreshCw className="size-4" /></Button> : null}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove file"
                      onClick={() => {
                        URL.revokeObjectURL(item.previewUrl);
                        setItems((current) => current.filter((candidate) => candidate.key !== item.key));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
          <div className="flex justify-end"><Button disabled={uploading || !items.some((item) => item.status === "pending")} onClick={uploadAll}><UploadCloud className="mr-2 size-4" /> {uploading ? "Uploading…" : "Upload all"}</Button></div>
        </>
      ) : null}
    </main>
  );
}
