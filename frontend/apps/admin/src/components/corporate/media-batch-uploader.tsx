"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  corporatePortalApi,
  mediaApi,
  type CorporateUploadBatch,
} from "@ksu/api-client";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { cn } from "@ksu/ui/lib/utils";

type PendingFile = {
  key: string;
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  description: string;
  isPublic: boolean;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  mediaId?: string;
  /** Server-side upload batch this file belongs to (set after createBatch). */
  batchId?: string;
  /** Server-side batch file id, used for polling status and server retry. */
  serverFileId?: string;
  bytesReceived?: number;
};

type FileMeta = {
  key: string;
  title: string;
  altText: string;
  description: string;
  isPublic: boolean;
  applied: boolean;
};

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ERRORS = 8;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type DropZoneState = "idle" | "dragging" | "uploading" | "partial-failure";

export interface MediaBatchUploaderProps {
  queryKey: readonly unknown[];
  folderId?: string;
  onComplete?: () => void;
}

export function MediaBatchUploaderButton({
  queryKey,
  folderId,
}: MediaBatchUploaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Open batch upload dialog"
      >
        <UploadCloud data-icon="inline-start" />
        Batch Upload
      </Button>
      <MediaBatchUploaderDialog
        open={open}
        onOpenChange={setOpen}
        queryKey={queryKey}
        folderId={folderId}
      />
    </>
  );
}

export function MediaBatchUploaderDialog({
  open,
  onOpenChange,
  queryKey,
  folderId,
  onComplete,
}: MediaBatchUploaderProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const [items, setItems] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "completed").length,
    [items],
  );

  const failedCount = useMemo(
    () => items.filter((item) => item.status === "failed").length,
    [items],
  );

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "pending").length,
    [items],
  );

  // Real progress: while a server batch is processing, the overall bar tracks
  // server-reported bytes; otherwise it falls back to settled files.
  const settledCount = completedCount + failedCount;
  const [serverProgress, setServerProgress] = useState<{
    received: number;
    total: number;
  } | null>(null);
  const fileMetaRef = useRef<Map<string, FileMeta>>(new Map());
  const overall =
    uploading && serverProgress && serverProgress.total > 0
      ? (serverProgress.received / serverProgress.total) * 100
      : items.length
        ? (settledCount / items.length) * 100
        : 0;

  const dropZoneState: DropZoneState = useMemo(() => {
    if (uploading) return "uploading";
    if (isDragging) return "dragging";
    if (failedCount > 0 && completedCount > 0) return "partial-failure";
    return "idle";
  }, [uploading, isDragging, failedCount, completedCount]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setItems((current) => [
      ...current,
      ...fileArray.map((file) => ({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ""),
        altText: "",
        description: "",
        isPublic: false,
        status: "pending" as const,
      })),
    ]);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length) addFiles(files);
  };

  const patch = (key: string, values: Partial<PendingFile>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...values } : item)),
    );

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Apply per-file metadata (frozen once the upload starts) to the media row
  // the server created for a completed batch file.
  const applyMetadata = async (meta: FileMeta, mediaId: string) => {
    if (meta.applied) return;
    meta.applied = true;
    if (!meta.title && !meta.altText && !meta.description && !meta.isPublic) {
      return;
    }
    try {
      await mediaApi.update(mediaId, {
        title: meta.title || null,
        alt_text: meta.altText || null,
        description: meta.description || null,
        is_public: meta.isPublic,
      });
    } catch {
      // Metadata is best-effort; the upload itself already succeeded.
    }
  };

  // Poll the server batch until it settles, reflecting real per-file
  // bytes/status into the row list. Returns the last observed batch.
  const pollBatch = async (
    batchId: string,
  ): Promise<CorporateUploadBatch | null> => {
    let lastBatch: CorporateUploadBatch | null = null;
    let pollErrors = 0;
    for (;;) {
      let batch: CorporateUploadBatch;
      try {
        batch = (await corporatePortalApi.media.getBatch(batchId)).data;
        pollErrors = 0;
      } catch {
        pollErrors += 1;
        if (pollErrors >= MAX_POLL_ERRORS) break;
        await sleep(POLL_INTERVAL_MS * 1.5);
        continue;
      }
      lastBatch = batch;
      for (const file of batch.files) {
        const meta = fileMetaRef.current.get(file.id);
        if (!meta) continue;
        if (file.status === "completed" && file.media_id) {
          await applyMetadata(meta, file.media_id);
          patch(meta.key, {
            status: "completed",
            mediaId: file.media_id,
            bytesReceived: file.bytes_received,
            error: undefined,
          });
        } else if (file.status === "failed") {
          patch(meta.key, {
            status: "failed",
            error: file.error || "Upload processing failed",
          });
        } else {
          patch(meta.key, {
            status: "uploading",
            bytesReceived: file.bytes_received,
          });
        }
      }
      setServerProgress({
        received: batch.received_bytes,
        total: batch.total_bytes,
      });
      if (batch.status !== "pending" && batch.status !== "processing") break;
      await sleep(POLL_INTERVAL_MS);
    }
    return lastBatch;
  };

  // One createBatch call for the whole selection, then poll for real progress.
  const runBatch = async (
    targets: PendingFile[],
  ): Promise<CorporateUploadBatch | null> => {
    if (!targets.length) return null;
    targets.forEach((item) =>
      patch(item.key, { status: "uploading", error: undefined }),
    );
    let batch: CorporateUploadBatch;
    try {
      const created = await corporatePortalApi.media.createBatch(
        targets.map((item) => item.file),
        { folderId: folderId || undefined },
      );
      batch = created.data;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Upload failed";
      targets.forEach((item) =>
        patch(item.key, { status: "failed", error: message }),
      );
      return null;
    }
    // Server files keep the submitted order (display_order === index).
    batch.files.forEach((file, index) => {
      const item = targets[index];
      if (!item) return;
      patch(item.key, { batchId: batch.id, serverFileId: file.id });
      fileMetaRef.current.set(file.id, {
        key: item.key,
        title: item.title,
        altText: item.altText,
        description: item.description,
        isPublic: item.isPublic,
        applied: false,
      });
    });
    return pollBatch(batch.id);
  };

  const toastBatchResult = (batch: CorporateUploadBatch | null) => {
    if (!batch) return;
    if (batch.failed_files === 0 && batch.completed_files > 0) {
      toast.success(`${batch.completed_files} file(s) uploaded successfully`);
    } else if (batch.failed_files > 0) {
      toast.info(`Upload complete with ${batch.failed_files} failure(s)`);
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    setServerProgress(null);
    const pending = items.filter((item) => item.status === "pending");
    const batch = await runBatch(pending);
    await queryClient.invalidateQueries({ queryKey });
    setUploading(false);
    setServerProgress(null);
    toastBatchResult(batch);
    if (batch && batch.failed_files === 0) onComplete?.();
  };

  const retryFailed = async () => {
    const failed = items.filter((item) => item.status === "failed");
    if (!failed.length) return;
    setUploading(true);
    setServerProgress(null);

    // Files the server already knows about are retried server-side.
    const byBatch = new Map<string, PendingFile[]>();
    failed
      .filter((item) => item.batchId && item.serverFileId)
      .forEach((item) => {
        const group = byBatch.get(item.batchId as string) ?? [];
        group.push(item);
        byBatch.set(item.batchId as string, group);
      });
    let lastBatch: CorporateUploadBatch | null = null;
    for (const [batchId, group] of byBatch) {
      const retried = await Promise.allSettled(
        group.map((item) =>
          corporatePortalApi.media.retryFile(batchId, item.serverFileId as string),
        ),
      );
      group.forEach((item, index) => {
        const outcome = retried[index];
        if (outcome?.status === "fulfilled") {
          patch(item.key, { status: "uploading", error: undefined });
        }
      });
      if (retried.some((outcome) => outcome.status === "fulfilled")) {
        lastBatch = await pollBatch(batchId);
      }
    }

    // Files that never reached the server go through a fresh batch.
    const clientFailed = failed.filter((item) => !item.serverFileId);
    const freshBatch = await runBatch(clientFailed);

    await queryClient.invalidateQueries({ queryKey });
    setUploading(false);
    setServerProgress(null);
    toastBatchResult(freshBatch ?? lastBatch);
  };

  const removeItem = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setItems((current) => current.filter((i) => i.key !== key));
  };

  const clearCompleted = () => {
    setItems((current) => {
      current
        .filter((i) => i.status === "completed")
        .forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return current.filter((i) => i.status !== "completed");
    });
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && uploading) return; // prevent close during upload
    if (!nextOpen) {
      // cleanup preview URLs
      items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      setItems([]);
    }
    onOpenChange(nextOpen);
  };

  const getStatusIcon = (status: PendingFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="size-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="size-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getRowClassName = (status: PendingFile["status"]) => {
    switch (status) {
      case "completed":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "failed":
        return "border-destructive/30 bg-destructive/5";
      case "uploading":
        return "border-primary/30 bg-primary/5";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Batch Upload Media</DialogTitle>
          <DialogDescription>
            Upload multiple files at once. Add titles and descriptions before
            uploading for better organization.
            {folderId ? (
              <Badge variant="secondary" className="ml-2">
                Uploading to selected folder
              </Badge>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <label
          htmlFor={inputId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200",
            dropZoneState === "idle" && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            dropZoneState === "dragging" && "border-primary bg-primary/10 ring-2 ring-primary/20",
            dropZoneState === "uploading" && "pointer-events-none border-primary/50 bg-primary/5",
            dropZoneState === "partial-failure" && "border-amber-500/50 bg-amber-500/5",
          )}
          aria-label="Drop zone for file upload"
        >
          {dropZoneState === "uploading" ? (
            <>
              <Loader2 className="mb-3 size-10 animate-spin text-primary" />
              <span className="font-medium">Uploading files...</span>
              <span className="text-sm text-muted-foreground">
                Please wait while your files are being uploaded
              </span>
            </>
          ) : dropZoneState === "dragging" ? (
            <>
              <UploadCloud className="mb-3 size-10 text-primary" />
              <span className="font-medium text-primary">Drop files here</span>
              <span className="text-sm text-muted-foreground">
                Release to add files to the upload queue
              </span>
            </>
          ) : dropZoneState === "partial-failure" ? (
            <>
              <XCircle className="mb-3 size-10 text-amber-500" />
              <span className="font-medium">Some uploads failed</span>
              <span className="text-sm text-muted-foreground">
                Add more files or retry failed uploads below
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="mb-3 size-10 text-muted-foreground" />
              <span className="font-medium">Drag and drop files here</span>
              <span className="text-sm text-muted-foreground">
                or click to browse - images, PDF, documents, audio, video
              </span>
            </>
          )}
          <input
            ref={inputRef}
            id={inputId}
            className="hidden"
            type="file"
            multiple
            disabled={uploading}
            onChange={(event) => {
              addFiles(event.target.files);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Select files to upload"
          />
        </label>

        {items.length > 0 ? (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{items.length} file(s)</span>
                {completedCount > 0 ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20">
                    <CheckCircle2 className="mr-1 size-3" />
                    {completedCount} completed
                  </Badge>
                ) : null}
                {failedCount > 0 ? (
                  <Badge variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/20">
                    <XCircle className="mr-1 size-3" />
                    {failedCount} failed
                  </Badge>
                ) : null}
                {pendingCount > 0 ? (
                  <Badge variant="secondary">
                    {pendingCount} pending
                  </Badge>
                ) : null}
              </div>
              <div className="flex gap-2">
                {completedCount > 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearCompleted}
                    disabled={uploading}
                    aria-label="Clear completed uploads"
                  >
                    Clear completed
                  </Button>
                ) : null}
                {failedCount > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retryFailed}
                    disabled={uploading}
                    aria-label="Retry failed uploads"
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Retry failed
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Overall progress (settled files out of total) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall progress</span>
                <span className="tabular-nums text-muted-foreground">
                  {settledCount} of {items.length} processed
                </span>
              </div>
              <Progress value={overall} aria-label="Files processed" />
            </div>

            {/* File list */}
            <section className="max-h-[28rem] space-y-3 overflow-y-auto" aria-label="Upload queue">
              {items.map((item, index) => (
                <Card
                  key={item.key}
                  className={cn("transition-colors duration-200", getRowClassName(item.status))}
                >
                  <CardContent className="grid gap-4 p-4 md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-start">
                    {/* Thumbnail */}
                    <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      {item.file.type.startsWith("image/") ? (
                        <Image
                          src={item.previewUrl}
                          alt={item.altText || item.file.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : item.file.type === "application/pdf" ? (
                        <FileText className="size-6 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                      )}
                      {/* Status overlay */}
                      {item.status !== "pending" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                          {getStatusIcon(item.status)}
                        </div>
                      ) : null}
                    </div>

                    {/* Fields */}
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`title-${item.key}`} className="text-xs">Title</Label>
                        <Input
                          id={`title-${item.key}`}
                          value={item.title}
                          disabled={item.status !== "pending"}
                          onChange={(e) => patch(item.key, { title: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`alt-${item.key}`} className="text-xs">Alt text</Label>
                        <Input
                          id={`alt-${item.key}`}
                          value={item.altText}
                          disabled={item.status !== "pending"}
                          onChange={(e) => patch(item.key, { altText: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`desc-${item.key}`} className="text-xs">Description</Label>
                        <Textarea
                          id={`desc-${item.key}`}
                          rows={2}
                          maxLength={600}
                          value={item.description}
                          disabled={item.status !== "pending"}
                          placeholder="Briefly describe this media asset."
                          onChange={(e) => patch(item.key, { description: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`public-${item.key}`}
                            checked={item.isPublic}
                            disabled={item.status !== "pending"}
                            onCheckedChange={(isPublic) => patch(item.key, { isPublic })}
                            aria-label="Make file public"
                          />
                          <Label htmlFor={`public-${item.key}`} className="text-xs">Public</Label>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status}</span>
                          <span className="hidden truncate sm:inline">- {item.file.name}</span>
                        </div>
                      </div>
                      {/* Real per-file state: while processing, the bar tracks
                          server-reported bytes for this file. */}
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:col-span-2"
                        role="status"
                        aria-label={`${item.file.name} upload status: ${item.status}`}
                      >
                        {item.status === "uploading" ? (
                          <div
                            className="h-full animate-pulse rounded-full bg-primary/60 transition-[width] duration-300"
                            style={{
                              width: `${
                                item.file.size > 0
                                  ? Math.max(
                                      8,
                                      Math.min(
                                        100,
                                        ((item.bytesReceived ?? 0) /
                                          item.file.size) *
                                          100,
                                      ),
                                    )
                                  : 100
                              }%`,
                            }}
                          />
                        ) : item.status === "completed" ? (
                          <div className="h-full w-full rounded-full bg-emerald-500" />
                        ) : item.status === "failed" ? (
                          <div className="h-full w-full rounded-full bg-destructive" />
                        ) : null}
                      </div>
                      {item.error ? (
                        <Alert variant="destructive" className="sm:col-span-2">
                          <AlertDescription>{item.error}</AlertDescription>
                        </Alert>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 md:flex-col">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Move file up in queue"
                        disabled={uploading || item.status !== "pending" || index === 0}
                        onClick={() => move(index, -1)}
                        className="size-8"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Move file down in queue"
                        disabled={uploading || item.status !== "pending" || index === items.length - 1}
                        onClick={() => move(index, 1)}
                        className="size-8"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove ${item.title || item.file.name} from queue`}
                        disabled={uploading}
                        onClick={() => removeItem(item.key)}
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => handleClose(false)}
              >
                Close
              </Button>
              <Button
                disabled={uploading || pendingCount === 0}
                onClick={uploadAll}
                className="min-w-32"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 size-4" />
                    Upload {pendingCount} file(s)
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
