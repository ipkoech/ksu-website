"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import { RichTextEditor } from "@ksu/ui/components";
import { usePermissions } from "@/hooks/use-permissions";
import {
  heriRequest,
  useHeriResourceMutation,
  useHeriResourceQuery,
  type HeriRecord,
} from "@/lib/api/heri";

type Item = HeriRecord & {
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  location?: string;
  registration_url?: string;
  application_url?: string;
  closing_at?: string;
  status?: string;
  event_type?: string;
  is_virtual?: boolean;
  virtual_url?: string;
  opportunity_type?: string;
  eligibility?: string;
  application_instructions?: string;
  featured_image_url?: string;
};
type Draft = Partial<Item> & { id?: string };
const statuses = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

function validUrl(value: string) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
function validate(kind: "events" | "opportunities", draft: Draft) {
  const errors: Record<string, string> = {};
  if (!String(draft.title ?? "").trim()) errors.title = "Title is required.";
  const slug = String(draft.slug ?? "").trim();
  if (!slug) errors.slug = "Slug is required.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    errors.slug = "Use lowercase words separated by hyphens.";
  if (!String(draft.summary ?? "").trim())
    errors.summary = "Summary is required.";
  const url =
    kind === "events"
      ? String(draft.registration_url ?? "")
      : String(draft.application_url ?? "");
  if (!validUrl(url)) errors.url = "Enter a valid https:// URL.";
  if (
    kind === "events" &&
    draft.starts_at &&
    draft.ends_at &&
    new Date(String(draft.ends_at)) < new Date(String(draft.starts_at))
  )
    errors.ends_at = "End time must be after start time.";
  return errors;
}

export function EventsOpportunitiesWorkspace({
  kind,
}: {
  kind: "events" | "opportunities";
}) {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.content.write");
  const label = kind === "events" ? "Events" : "Opportunities";
  const query = useHeriResourceQuery<Item>(kind, { page: 1, per_page: 100 });
  const mutation = useHeriResourceMutation(kind);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const records = useMemo(() => query.data?.data ?? [], [query.data]);
  const open = (item?: Item) => {
    setErrors({});
    setDraft(
      item
        ? { ...item }
        : kind === "events"
          ? {
              title: "",
              slug: "",
              summary: "",
              description: "",
              starts_at: "",
              ends_at: "",
              location: "",
              registration_url: "",
              event_type: "webinar",
              featured_image_url: "",
              is_virtual: false,
              virtual_url: "",
              status: "draft",
            }
          : {
              title: "",
              slug: "",
              summary: "",
              application_url: "",
              closing_at: "",
              description: "",
              eligibility: "",
              application_instructions: "",
              opportunity_type: "call_for_proposals",
              featured_image_url: "",
              status: "draft",
            },
    );
  };
  const save = async () => {
    if (!draft || !canWrite) return;
    const next = validate(kind, draft);
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await mutation.mutateAsync({
        id: draft.id,
        payload: { ...draft, id: undefined },
      });
      toast.success(`${kind === "events" ? "Event" : "Opportunity"} saved`);
      setDraft(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to save ${kind}`,
      );
    }
  };
  const remove = async (item: Item) => {
    if (
      !canWrite ||
      !window.confirm(`Delete “${item.title ?? label.slice(0, -1)}”?`)
    )
      return;
    try {
      await heriRequest(`/admin/${kind}/${item.id}`, { method: "DELETE" });
      await query.refetch();
      toast.success(`${label.slice(0, -1)} deleted`);
    } catch {
      toast.error(`Unable to delete ${label.toLowerCase()}`);
    }
  };
  const published = records.filter(
    (item) => item.status === "published",
  ).length;
  const upcoming =
    kind === "events"
      ? records.filter(
          (item) =>
            item.starts_at && new Date(String(item.starts_at)) >= new Date(),
        ).length
      : records.filter(
          (item) =>
            item.closing_at && new Date(String(item.closing_at)) >= new Date(),
        ).length;
  return (
    <main className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {label}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Manage{" "}
            {kind === "events"
              ? "research events, dates, locations, and registration links"
              : "calls, grants, scholarships, and application deadlines"}{" "}
            with validated public publishing.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Create {kind === "events" ? "event" : "opportunity"}
          </button>
        )}
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label={`Total ${label.toLowerCase()}`} value={records.length} />
        <Stat label="Published" value={published} />
        <Stat
          label={kind === "events" ? "Upcoming" : "Open or upcoming"}
          value={upcoming}
        />
      </section>
      <section className="space-y-3">
        {query.isLoading ? (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            Loading {label.toLowerCase()}…
          </p>
        ) : records.length === 0 ? (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            No {label.toLowerCase()} configured.
          </p>
        ) : (
          records.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <CalendarDays className="size-5 shrink-0 text-emerald-700" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    {String(item.status ?? "draft").replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">/{item.slug}</span>
                </div>
                <h2 className="mt-1 truncate font-semibold text-slate-900">
                  {item.title ||
                    `Untitled ${kind === "events" ? "event" : "opportunity"}`}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                  {item.summary || "No summary"}
                </p>
              </div>
              <div className="hidden text-right text-xs text-slate-500 md:block">
                {kind === "events"
                  ? String(item.starts_at ?? "Date TBD")
                  : String(item.closing_at ?? "No closing date")}
              </div>
              {canWrite && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${kind === "events" ? "event" : "opportunity"}`}
                    onClick={() => open(item)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${kind === "events" ? "event" : "opportunity"}`}
                    onClick={() => void remove(item)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </section>
      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 md:p-10">
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_.8fr]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
              className="rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {draft.id ? "Edit" : "Create"}{" "}
                  {kind === "events" ? "event" : "opportunity"}
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
                  label="Title"
                  required
                  error={errors.title}
                  value={String(draft.title ?? "")}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                />
                <Field
                  label="Slug"
                  required
                  error={errors.slug}
                  value={String(draft.slug ?? "")}
                  onChange={(value) => setDraft({ ...draft, slug: value })}
                />
                <Field
                  label="Summary"
                  required
                  textarea
                  error={errors.summary}
                  value={String(draft.summary ?? "")}
                  onChange={(value) => setDraft({ ...draft, summary: value })}
                />
                {kind === "events" ? (
                  <>
                    <Field
                      label="Description"
                      richtext
                      value={String(draft.description ?? "")}
                      onChange={(value) =>
                        setDraft({ ...draft, description: value })
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Starts at"
                        type="datetime-local"
                        value={String(draft.starts_at ?? "")}
                        onChange={(value) =>
                          setDraft({ ...draft, starts_at: value })
                        }
                      />
                      <Field
                        label="Ends at"
                        type="datetime-local"
                        error={errors.ends_at}
                        value={String(draft.ends_at ?? "")}
                        onChange={(value) =>
                          setDraft({ ...draft, ends_at: value })
                        }
                      />
                    </div>
                    <Field
                      label="Location"
                      value={String(draft.location ?? "")}
                      onChange={(value) =>
                        setDraft({ ...draft, location: value })
                      }
                    />
                    <Field
                      label="Registration URL"
                      error={errors.url}
                      value={String(draft.registration_url ?? "")}
                      onChange={(value) =>
                        setDraft({ ...draft, registration_url: value })
                      }
                    />
                    <Field label="Event type" value={String(draft.event_type ?? "")} onChange={(value) => setDraft({ ...draft, event_type: value })} />
                    <Field label="Featured image URL" value={String(draft.featured_image_url ?? "")} onChange={(value) => setDraft({ ...draft, featured_image_url: value })} />
                    <Field label="Virtual meeting URL" value={String(draft.virtual_url ?? "")} onChange={(value) => setDraft({ ...draft, virtual_url: value, is_virtual: Boolean(value) })} />
                  </>
                ) : (
                  <>
                    <Field
                      label="Application URL"
                      error={errors.url}
                      value={String(draft.application_url ?? "")}
                      onChange={(value) =>
                        setDraft({ ...draft, application_url: value })
                      }
                    />
                    <Field
                      label="Closing at"
                      type="datetime-local"
                      value={String(draft.closing_at ?? "")}
                      onChange={(value) =>
                        setDraft({ ...draft, closing_at: value })
                      }
                    />
                    <Field label="Opportunity type" value={String(draft.opportunity_type ?? "")} onChange={(value) => setDraft({ ...draft, opportunity_type: value })} />
                    <Field label="Full description" richtext value={String(draft.description ?? "")} onChange={(value) => setDraft({ ...draft, description: value })} />
                    <Field label="Eligibility" richtext value={String(draft.eligibility ?? "")} onChange={(value) => setDraft({ ...draft, eligibility: value })} />
                    <Field label="Application instructions" richtext value={String(draft.application_instructions ?? "")} onChange={(value) => setDraft({ ...draft, application_instructions: value })} />
                    <Field label="Featured image URL" value={String(draft.featured_image_url ?? "")} onChange={(value) => setDraft({ ...draft, featured_image_url: value })} />
                  </>
                )}
                <label className="text-sm font-medium text-slate-700">
                  Publication status
                  <select
                    value={String(draft.status ?? "draft")}
                    onChange={(event) =>
                      setDraft({ ...draft, status: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
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
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save
                </button>
              </div>
            </form>
            <aside className="rounded-2xl bg-white p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Public preview
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                {String(
                  draft.title ||
                    `Your ${kind === "events" ? "event" : "opportunity"} title`,
                )}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {String(draft.summary || "A public summary will appear here.")}
              </p>
              <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                {kind === "events" ? (
                  <>
                    <p>
                      <strong>Date:</strong> {String(draft.starts_at || "TBD")}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {String(draft.location || "Online or venue TBD")}
                    </p>
                    {draft.registration_url && (
                      <a
                        className="inline-flex items-center gap-2 font-semibold text-emerald-700"
                        href={String(draft.registration_url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Registration <ExternalLink className="size-4" />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {String(draft.closing_at || "Open until announced")}
                    </p>
                    {draft.application_url && (
                      <a
                        className="inline-flex items-center gap-2 font-semibold text-emerald-700"
                        href={String(draft.application_url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Apply now <ExternalLink className="size-4" />
                      </a>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  textarea,
  richtext,
  type = "text",
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  richtext?: boolean;
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
      {richtext ? (
        <RichTextEditor value={value} onChange={onChange} minHeight="10rem" placeholder={`Write ${label.toLowerCase()}…`} />
      ) : textarea ? (
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
