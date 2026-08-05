"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  schoolPortalApi,
  type Media,
  type SchoolUploadBatch,
  useMedia,
} from "@ksu/api-client";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  FolderOpen,
  ImageIcon,
  Images,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  TimerReset,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { getMediaLabel, getMediaUrl, isImageMedia } from "@/components/media/media-utils";
import {
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

type PendingFile = {
  key: string;
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  description: string;
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
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"library" | "upload">("library");
  const [selected, setSelected] = useState<Media | null>(null);
  const [mediaDraft, setMediaDraft] = useState({
    title: "",
    alt_text: "",
    description: "",
    caption: "",
    credit: "",
    tags: "",
    is_public: false,
  });
  const library = useMedia({
    page: 1,
    per_page: 80,
    entity_type: "school",
    entity_id: school.id,
  });
  const libraryItems = useMemo(
    () => (library.data?.data ?? []).filter((item) => {
      const text = `${item.title || ""} ${item.alt_text || ""} ${item.description || ""}`.toLowerCase();
      return !search || text.includes(search.toLowerCase());
    }),
    [library.data?.data, search],
  );
  const overall = useMemo(
    () => items.length ? items.reduce((sum, item) => sum + item.progress, 0) / items.length : 0,
    [items],
  );
  const openMedia = (media: Media) => {
    setSelected(media);
    setMediaDraft({
      title: media.title || "",
      alt_text: media.alt_text || "",
      description: media.description || "",
      caption: media.caption || "",
      credit: media.credit || "",
      tags: media.tags?.join(", ") || "",
      is_public: media.is_public ?? false,
    });
  };
  const saveMedia = useMutation({
    mutationFn: () => schoolPortalApi.media.update(selected!.id, {
      title: mediaDraft.title.trim() || null,
      alt_text: mediaDraft.alt_text.trim() || null,
      description: mediaDraft.description.trim() || null,
      caption: mediaDraft.caption.trim() || null,
      credit: mediaDraft.credit.trim() || null,
      tags: mediaDraft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      is_public: mediaDraft.is_public,
    }),
    onSuccess: async () => {
      await library.refetch();
      setSelected(null);
    },
  });
  const removeMedia = useMutation({
    mutationFn: () => schoolPortalApi.media.remove(selected!.id),
    onSuccess: async () => {
      await library.refetch();
      setSelected(null);
    },
  });
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
        description: "",
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
        await schoolPortalApi.media.update(uploaded.media_id, {
          title: item.title,
          alt_text: item.altText || null,
          description: item.description.trim() || null,
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
    await library.refetch();
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
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School media"
        title="Media library"
        description="Prepare images and documents with meaningful titles, descriptions and roles before adding them to your school library."
        schoolName={school.name}
        icon={Images}
      />
      <SchoolMetricGrid items={[
        { label: "Library assets", value: library.data?.meta.total ?? libraryItems.length, detail: "Owned by this school", icon: Images },
        { label: "Selected files", value: items.length, detail: items.length ? "Ready in this batch" : "Choose files to begin", icon: TimerReset, tone: "warning" },
        { label: "Completed", value: items.filter((item) => item.status === "completed").length, detail: "Added to school media", icon: UploadCloud, tone: "success" },
        { label: "Needs attention", value: items.filter((item) => item.status === "failed").length, detail: "Retry failed uploads", icon: XCircle, tone: "danger" },
      ]} />
      <div className="flex w-fit rounded-xl border bg-background p-1 shadow-sm">
        <Button variant={view === "library" ? "secondary" : "ghost"} size="sm" onClick={() => setView("library")}>
          <FolderOpen className="mr-2 size-4" /> Library
        </Button>
        <Button variant={view === "upload" ? "secondary" : "ghost"} size="sm" onClick={() => setView("upload")}>
          <UploadCloud className="mr-2 size-4" /> Upload workspace
          {items.length ? <Badge className="ml-2">{items.length}</Badge> : null}
        </Button>
      </div>
      {view === "library" ? (
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">School media</CardTitle>
            <CardDescription>Browse assets already uploaded to this school’s private media scope.</CardDescription>
          </div>
          <label className="relative block sm:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input className="pl-9" value={search} aria-label="Search school media" placeholder="Search media" onChange={(event) => setSearch(event.target.value)} />
          </label>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {libraryItems.map((media) => {
              const url = getMediaUrl(media);
              return (
                <button key={media.id} type="button" className="group cursor-pointer overflow-hidden rounded-xl border bg-muted/20 text-left transition-colors duration-200 hover:border-primary/40" onClick={() => openMedia(media)}>
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
                    {url && isImageMedia(media) ? (
                      <>
                        <ImageIcon className="size-8 text-muted-foreground" />
                        <Image
                          src={url}
                          alt={media.alt_text || getMediaLabel(media)}
                          fill
                          unoptimized
                          className="object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </>
                    ) : media.mime_type === "application/pdf" ? (
                      <FileText className="size-8 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">{getMediaLabel(media)}</p>
                      <Pencil className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{media.description || media.mime_type || "School media asset"}</p>
                    <div className="mt-2 flex gap-1.5">
                      <Badge variant="outline">{media.media_type || "file"}</Badge>
                      <Badge variant={media.is_public ? "secondary" : "outline"}>{media.is_public ? "Public" : "Private"}</Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!library.isPending && !libraryItems.length ? (
            <div className="rounded-xl border border-dashed px-6 py-10 text-center">
              <Images className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No school media found</p>
              <p className="mt-1 text-xs text-muted-foreground">Upload files below to start this school’s library.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      ) : (
      <>
      <Card>
        <CardHeader><CardTitle className="text-base">Select files</CardTitle><CardDescription>Images, PDF, Office documents, audio, and video are validated by the server.</CardDescription></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center transition-colors hover:bg-muted/40">
            <UploadCloud className="mb-3 size-8 text-primary" />
            <span className="font-medium">Choose multiple files</span>
            <span className="text-sm text-muted-foreground">or drag files onto this area</span>
            <Input className="hidden" type="file" multiple onChange={(event) => addFiles(event.target.files)} />
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
                    <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea rows={3} maxLength={600} value={item.description} placeholder="Briefly describe this media asset and its context." onChange={(event) => patch(item.key, { description: event.target.value })} /></div>
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
      </>
      )}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit media details</DialogTitle>
            <DialogDescription>Make this asset understandable, searchable and ready for public use.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {getMediaUrl(selected) && isImageMedia(selected) ? (
                    <Image src={getMediaUrl(selected)!} alt={mediaDraft.alt_text || getMediaLabel(selected)} fill unoptimized className="object-cover" />
                  ) : <FileText className="size-8 text-muted-foreground" />}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label htmlFor="media-title">Title</Label><Input id="media-title" value={mediaDraft.title} onChange={(event) => setMediaDraft((current) => ({ ...current, title: event.target.value }))} /></div>
                  <div className="space-y-1.5"><Label htmlFor="media-alt">Alternative text</Label><Input id="media-alt" value={mediaDraft.alt_text} onChange={(event) => setMediaDraft((current) => ({ ...current, alt_text: event.target.value }))} /></div>
                </div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="media-description">Description</Label><Textarea id="media-description" rows={4} maxLength={600} value={mediaDraft.description} onChange={(event) => setMediaDraft((current) => ({ ...current, description: event.target.value }))} /></div>
              <div className="space-y-1.5"><Label htmlFor="media-caption">Caption</Label><Textarea id="media-caption" rows={2} value={mediaDraft.caption} onChange={(event) => setMediaDraft((current) => ({ ...current, caption: event.target.value }))} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="media-credit">Credit</Label><Input id="media-credit" value={mediaDraft.credit} onChange={(event) => setMediaDraft((current) => ({ ...current, credit: event.target.value }))} /></div>
                <div className="space-y-1.5"><Label htmlFor="media-tags">Tags</Label><Input id="media-tags" placeholder="campus, laboratory, students" value={mediaDraft.tags} onChange={(event) => setMediaDraft((current) => ({ ...current, tags: event.target.value }))} /></div>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div><Label htmlFor="media-public">Public asset</Label><p className="mt-1 text-xs text-muted-foreground">Allow approved public pages to display this media.</p></div>
                <Switch id="media-public" checked={mediaDraft.is_public} onCheckedChange={(is_public) => setMediaDraft((current) => ({ ...current, is_public }))} />
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            <Button variant="destructive" disabled={removeMedia.isPending} onClick={() => removeMedia.mutate()}>
              {removeMedia.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />} Delete
            </Button>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button disabled={!mediaDraft.title.trim() || saveMedia.isPending} onClick={() => saveMedia.mutate()}>
              {saveMedia.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Save media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SchoolWorkspace>
  );
}
