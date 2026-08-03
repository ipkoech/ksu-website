"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Eye,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import { usePermissions } from "@/hooks/use-permissions";
import {
  heriRequest,
  useHeriResourceMutation,
  useHeriResourceQuery,
  type HeriRecord,
} from "@/lib/api/heri";
import { HeriMediaPicker } from "./heri-media-picker";

type Slide = HeriRecord & {
  eyebrow?: string;
  title?: string;
  description?: string;
  image_url?: string;
  mobile_image_url?: string;
  button_label?: string;
  button_href?: string;
  position?: number;
  is_active?: boolean;
};

type Draft = Omit<Slide, "id"> & { id?: string };

const blank: Draft = {
  eyebrow: "",
  title: "",
  description: "",
  image_url: "",
  mobile_image_url: "",
  button_label: "Explore our work",
  button_href: "/our-work",
  position: 0,
  is_active: true,
};

function validate(draft: Draft) {
  const errors: Record<string, string> = {};
  if (!String(draft.title ?? "").trim()) errors.title = "Title is required.";
  if (!String(draft.image_url ?? "").trim())
    errors.image_url = "Desktop hero media is required.";
  if (!String(draft.button_label ?? "").trim())
    errors.button_label = "Button label is required.";
  if (
    !String(draft.button_href ?? "").trim() ||
    !String(draft.button_href).startsWith("/")
  )
    errors.button_href = "Use a relative destination such as /our-work.";
  return errors;
}

export function HeroSlidesWorkspace() {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.content.write");
  const query = useHeriResourceQuery<Slide>("hero-slides", {
    page: 1,
    per_page: 100,
  });
  const mutation = useHeriResourceMutation("hero-slides");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragged, setDragged] = useState<string | null>(null);
  const slides = useMemo(
    () =>
      [...(query.data?.data ?? [])].sort(
        (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0),
      ),
    [query.data],
  );

  const save = async () => {
    if (!draft || !canWrite) return;
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      await mutation.mutateAsync({
        id: draft.id,
        payload: { ...draft, id: undefined },
      });
      toast.success(draft.id ? "Hero slide updated" : "Hero slide created");
      setDraft(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save hero slide",
      );
    }
  };

  const reorder = async (targetId: string) => {
    if (!dragged || dragged === targetId || !canWrite) return;
    const next = [...slides];
    const from = next.findIndex((item) => item.id === dragged);
    const to = next.findIndex((item) => item.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await Promise.all(
        next.map((item, index) =>
          mutation.mutateAsync({ id: item.id, payload: { position: index } }),
        ),
      );
      toast.success("Hero order updated");
    } catch {
      toast.error("Unable to update hero order");
    }
    setDragged(null);
  };

  const remove = async (slide: Slide) => {
    if (
      !canWrite ||
      !window.confirm(`Delete “${slide.title ?? "hero slide"}”?`)
    )
      return;
    try {
      await heriRequest(`/admin/hero-slides/${slide.id}`, { method: "DELETE" });
      await query.refetch();
      toast.success("Hero slide deleted");
    } catch {
      toast.error("Unable to delete hero slide");
    }
  };

  return (
    <main className="space-y-6 p-6 md:p-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Homepage hero
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Build the landing experience with ordered slides, responsive media,
            clear calls to action, and an immediate visual preview.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => {
              setDraft({ ...blank, position: slides.length });
              setErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Add slide
          </button>
        )}
      </header>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-3">
          {query.isLoading ? (
            <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
              Loading hero slides…
            </p>
          ) : slides.length === 0 ? (
            <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
              No hero slides configured.
            </p>
          ) : (
            slides.map((slide, index) => (
              <article
                key={slide.id}
                draggable={canWrite}
                onDragStart={() => setDragged(String(slide.id))}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void reorder(String(slide.id))}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <GripVertical className="size-5 shrink-0 cursor-grab text-slate-400" />
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {slide.image_url && (
                    <Image
                      src={String(slide.image_url)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {index + 1}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${Boolean(slide.is_active) ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {Boolean(slide.is_active) ? "Published" : "Inactive"}
                    </span>
                  </div>
                  <h2 className="truncate font-semibold text-slate-900">
                    {String(slide.title ?? "Untitled slide")}
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {String(slide.button_label ?? "")} →{" "}
                    {String(slide.button_href ?? "")}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Preview slide"
                      onClick={() => setDraft(slide)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit slide"
                      onClick={() => {
                        setDraft({ ...slide });
                        setErrors({});
                      }}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete slide"
                      onClick={() => void remove(slide)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
        <div className="overflow-hidden rounded-2xl bg-[#003c39] shadow-sm">
          <div className="relative min-h-[360px] p-8 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(199,217,0,.35),transparent_35%),linear-gradient(120deg,#003c39,#006b62)]" />
            {draft?.image_url && (
              <Image
                src={String(draft.image_url)}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-45"
              />
            )}
            <div className="relative z-10 max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                {String(draft?.eyebrow ?? "HOSTED BY KISII UNIVERSITY")}
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">
                {String(draft?.title ?? "Your hero headline")}
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/80">
                {String(
                  draft?.description ??
                    "Preview the public homepage hero experience here.",
                )}
              </p>
              <span className="mt-6 inline-flex rounded-lg bg-lime-300 px-4 py-2 text-xs font-bold text-slate-900">
                {String(draft?.button_label ?? "EXPLORE OUR WORK")} →
              </span>
            </div>
          </div>
        </div>
      </section>
      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 md:p-10">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {draft.id ? "Edit hero slide" : "Create hero slide"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <Field
                label="Eyebrow"
                value={String(draft.eyebrow ?? "")}
                onChange={(value) => setDraft({ ...draft, eyebrow: value })}
              />
              <Field
                label="Title"
                required
                error={errors.title}
                value={String(draft.title ?? "")}
                onChange={(value) => setDraft({ ...draft, title: value })}
              />
              <Field
                label="Description"
                textarea
                value={String(draft.description ?? "")}
                onChange={(value) => setDraft({ ...draft, description: value })}
              />
              <label className="text-sm font-medium">
                Desktop hero media{" "}
                {errors.image_url && (
                  <span className="text-red-600"> — {errors.image_url}</span>
                )}
                <HeriMediaPicker
                  value={String(draft.image_url ?? "")}
                  onChange={(value) => setDraft({ ...draft, image_url: value })}
                />
              </label>
              <label className="text-sm font-medium">
                Mobile hero media
                <HeriMediaPicker
                  value={String(draft.mobile_image_url ?? "")}
                  onChange={(value) =>
                    setDraft({ ...draft, mobile_image_url: value })
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Button label"
                  required
                  error={errors.button_label}
                  value={String(draft.button_label ?? "")}
                  onChange={(value) =>
                    setDraft({ ...draft, button_label: value })
                  }
                />
                <Field
                  label="Button destination"
                  required
                  error={errors.button_href}
                  value={String(draft.button_href ?? "")}
                  onChange={(value) =>
                    setDraft({ ...draft, button_href: value })
                  }
                />
                <Field
                  label="Position"
                  type="number"
                  value={String(draft.position ?? 0)}
                  onChange={(value) =>
                    setDraft({ ...draft, position: Number(value) })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(draft.is_active)}
                  onChange={(event) =>
                    setDraft({ ...draft, is_active: event.target.checked })
                  }
                />{" "}
                Published on the public homepage
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => void save()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save slide
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-600"> *</span>}
      {error && (
        <span className="ml-2 text-xs font-normal text-red-600">{error}</span>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
        />
      )}
    </label>
  );
}
