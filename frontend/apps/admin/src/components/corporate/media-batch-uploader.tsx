"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mediaApi, type MediaUploadOptions } from "@ksu/api-client";
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
  CardDescription,
  CardHeader,
  CardTitle,
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
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  mediaId?: string;
};

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

  const overall = useMemo(
    () =>
      items.length
        ? items.reduce((sum, item) => sum + item.progress, 0) / items.length
        : 0,
    [items],
  );

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
        progress: 0,
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

  const uploadOne = async (item: PendingFile): Promise<void> => {
    patch(item.key, { status: "uploading", progress: 10, error: undefined });
    try {
      const options: MediaUploadOptions = {
        folderId: folderId || undefined,
        isPublic: item.isPublic,
      };
      patch(item.key, { progress: 30 });

      const result = await mediaApi.upload(item.file, options);
      const media = result.data;

      patch(item.key, { progress: 70 });

      // Update metadata if title/alt/description provided
      if (item.title || item.altText || item.description) {
        await mediaApi.update(media.id, {
          title: item.title || null,
          alt_text: item.altText || null,
          description: item.description || null,
        });
      }

      patch(item.key, {
        status: "completed",
        progress: 100,
        mediaId: media.id,
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
    // Upload concurrently with a concurrency limit of 3
    const concurrency = 3;
    for (let i = 0; i < pending.length; i += concurrency) {
      const batch = pending.slice(i, i + concurrency);
      await Promise.allSettled(batch.map(uploadOne));
    }
    await queryClient.invalidateQueries({ queryKey });
    setUploading(false);

    // Recount after upload
    const completed = items.filter((i) => i.status === "completed").length + pending.filter((p) => items.find((i) => i.key === p.key)?.status === "completed").length;
    const failed = items.filter((i) => i.status === "failed").length;

    if (failed === 0 && completed > 0) {
      toast.success(`${completed} file(s) uploaded successfully`);
    } else if (failed > 0) {
      toast.info(`Upload complete with ${failed} failure(s)`);
    }
  };

  const retryFailed = async () => {
    const failed = items.filter((item) => item.status === "failed");
    if (!failed.length) return;
    setUploading(true);
    for (const item of failed) {
      patch(item.key, { status: "pending", progress: 0, error: undefined });
    }
    await Promise.allSettled(failed.map(uploadOne));
    await queryClient.invalidateQueries({ queryKey });
    setUploading(false);
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

            {/* Overall progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall progress</span>
                <span className="tabular-nums text-muted-foreground">{Math.round(overall)}%</span>
              </div>
              <Progress value={overall} aria-label="Overall upload progress" />
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
                      <Progress
                        className="sm:col-span-2"
                        value={item.progress}
                        aria-label={`${item.file.name} upload progress`}
                      />
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
