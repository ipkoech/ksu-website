"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ClipboardCheck, Loader2, PenLine, ScrollText } from "lucide-react";
import {
  contentWorkflowApi,
  storiesApi,
  type ContentWorkflowAction,
  type ContentWorkflowQueueItem,
  type ContentWorkflowStatus,
  type Story,
  type StorySubmissionPayload,
} from "@ksu/api-client";

type ViewMode = "dashboard" | "list" | "new" | "edit";
type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitIntent = "draft" | "submit";

const editableStatuses = new Set<string>(["draft", "changes_requested"]);
const submittableStatuses = new Set<string>(["draft", "changes_requested", "unpublished", "rejected"]);

export function StoryContributorClient({
  mode,
  storyId,
}: {
  mode: ViewMode;
  storyId?: string;
}) {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [saving, setSaving] = useState<SubmitIntent | null>(null);
  const [message, setMessage] = useState("");

  const needsList = mode === "dashboard" || mode === "list";
  const needsStory = mode === "edit" && storyId;

  async function load() {
    setState("loading");
    setMessage("");
    try {
      if (needsStory) {
        const response = await storiesApi.get(storyId);
        setEditingStory(response.data);
      } else if (needsList) {
        const response = await storiesApi.listMine({ per_page: 50 });
        setStories(response.data ?? []);
      }
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, storyId]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const story of stories) {
      const status = story.workflow_status ?? story.status ?? "draft";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return counts;
  }, [stories]);

  async function submitWorkflow(story: Story, action: ContentWorkflowAction) {
    await contentWorkflowApi.action(workflowItem(story), action, {});
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    intent: SubmitIntent,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(intent);
    setMessage("");

    const payload = formPayload(form);
    try {
      if (mode === "new") {
        const response = await storiesApi.submitDraft(payload);
        if (intent === "submit") {
          await submitWorkflow(response.data, "submit");
        }
        router.push("/story-contributor/stories");
        return;
      }

      if (!editingStory) return;
      const updateResponse = editableStatuses.has(
        editingStory.workflow_status ?? editingStory.status ?? "draft",
      )
        ? await storiesApi.update(editingStory.id, {
            title: payload.title,
            summary: payload.summary,
            plain_text: payload.plain_text,
            rich_text: payload.rich_text,
            structured_content: payload.structured_content,
            related_links: payload.related_links,
            featured_media_id: payload.featured_media_id,
            story_type: payload.story_type,
            category: payload.category,
            contributor_affiliation_snapshot:
              payload.contributor_affiliation_snapshot,
            reading_minutes: payload.reading_minutes,
            show_contributor_name: payload.show_contributor_name,
            consent_to_publish: payload.consent_to_publish,
          })
        : { data: editingStory };

      if (intent === "submit") {
        await submitWorkflow(updateResponse.data, "submit");
      }
      router.push("/story-contributor/stories");
    } catch {
      setMessage("Unable to save this story. Check required fields and current review status.");
    } finally {
      setSaving(null);
    }
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <PageFrame>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Unable to load the story contributor portal. Confirm your account has
          contributor access, then try again.
        </div>
      </PageFrame>
    );
  }

  if (mode === "new") {
    return (
      <StoryEditor
        title="Submit a new story"
        description="Create a clear Kisii University story. You may save it as a draft or submit it for Corporate Communication review."
        message={message}
        saving={saving}
        onSubmit={handleSubmit}
      />
    );
  }

  if (mode === "edit") {
    const status = editingStory?.workflow_status ?? editingStory?.status ?? "draft";
    const canEdit = editableStatuses.has(status);
    return (
      <StoryEditor
        title={canEdit ? "Edit story" : "View story"}
        description={
          canEdit
            ? "Update the draft or requested changes, then resubmit it for review."
            : "This story is already in review, approved, scheduled, or published. It is read-only here."
        }
        story={editingStory}
        message={message}
        saving={saving}
        readOnly={!canEdit}
        canSubmit={submittableStatuses.has(status)}
        onSubmit={handleSubmit}
      />
    );
  }

  if (mode === "list") {
    return (
      <PageFrame>
        <ContributorHeader
          title="My stories"
          description="Track drafts, submitted stories, requested changes, approvals, and publication state."
          cta
        />
        <StoryList stories={stories} onSubmitStory={submitWorkflow} />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <ContributorHeader
        title="Story Contributor Dashboard"
        description="Submit stories connected to Kisii University learning, research, student life, partnerships, and community impact."
        cta
      />
      <div className="grid gap-4 md:grid-cols-4">
        {([
          ["Total", stories.length, ScrollText],
          ["Drafts", statusCounts.get("draft") ?? 0, PenLine],
          ["In review", (statusCounts.get("submitted") ?? 0) + (statusCounts.get("in_review") ?? 0), ClipboardCheck],
          ["Published", statusCounts.get("published") ?? 0, ArrowRight],
        ] satisfies Array<[string, number, typeof ScrollText]>).map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
            <p className="text-sm font-medium text-slate-600">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <StoryList stories={stories.slice(0, 6)} onSubmitStory={submitWorkflow} compact />
      </div>
    </PageFrame>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

function ContributorHeader({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: boolean;
}) {
  return (
    <header className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Story Contributor Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {cta ? (
          <Link
            href="/story-contributor/stories/new"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"
          >
            New story
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

function StoryList({
  stories,
  compact = false,
  onSubmitStory,
}: {
  stories: Story[];
  compact?: boolean;
  onSubmitStory: (story: Story, action: ContentWorkflowAction) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function submit(story: Story) {
    setBusyId(story.id);
    try {
      await onSubmitStory(story, "submit");
      window.location.reload();
    } finally {
      setBusyId(null);
    }
  }

  if (!stories.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-8 text-center">
        <p className="font-semibold text-slate-950">No stories yet.</p>
        <p className="mt-2 text-sm text-slate-600">
          Start a draft and submit it for review.
        </p>
        <Link
          href="/story-contributor/stories/new"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"
        >
          Create first story
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {stories.map((story) => {
        const status = story.workflow_status ?? story.status ?? "draft";
        return (
          <article
            key={story.id}
            className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={status} />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {story.category || story.story_type || "Story"}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                {story.title}
              </h2>
              {!compact ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {story.summary || story.plain_text || "No summary provided."}
                </p>
              ) : null}
              {story.revision_notes ? (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Changes requested: {story.revision_notes}
                </p>
              ) : null}
              {story.rejection_reason ? (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  Rejected: {story.rejection_reason}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                href={`/story-contributor/stories/${story.id}`}
                className="inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-bold"
              >
                {editableStatuses.has(status) ? "Edit" : "View"}
              </Link>
              {submittableStatuses.has(status) ? (
                <button
                  type="button"
                  disabled={busyId === story.id}
                  onClick={() => void submit(story)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busyId === story.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Submit
                </button>
              ) : null}
              {status === "published" ? (
                <Link
                  href={`/stories/${story.slug}`}
                  target="_blank"
                  className="inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-bold"
                >
                  View public
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StoryEditor({
  title,
  description,
  story,
  message,
  saving,
  readOnly = false,
  canSubmit = true,
  onSubmit,
}: {
  title: string;
  description: string;
  story?: Story | null;
  message?: string;
  saving: SubmitIntent | null;
  readOnly?: boolean;
  canSubmit?: boolean;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    intent: SubmitIntent,
  ) => Promise<void>;
}) {
  return (
    <PageFrame>
      <ContributorHeader title={title} description={description} />
      <form
        onSubmit={(event) => {
          const submitter = (
            event.nativeEvent as SubmitEvent
          ).submitter as HTMLButtonElement | null;
          void onSubmit(
            event,
            submitter?.value === "submit" ? "submit" : "draft",
          );
        }}
        className="grid gap-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <Field
            label="Story title"
            name="title"
            required
            defaultValue={story?.title}
            readOnly={readOnly}
          />
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Story type
            <select
              name="story_type"
              defaultValue={story?.story_type ?? "article"}
              disabled={readOnly}
              className="min-h-12 rounded-xl border px-3 text-sm"
            >
              <option value="article">Article</option>
              <option value="student_story">Student story</option>
              <option value="staff_story">Staff story</option>
              <option value="partner_story">Partner story</option>
              <option value="community_impact">Community impact</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label="Category"
            name="category"
            defaultValue={story?.category ?? ""}
            readOnly={readOnly}
          />
          <Field
            label="Affiliation"
            name="contributor_affiliation_snapshot"
            defaultValue={story?.contributor_affiliation_snapshot ?? ""}
            readOnly={readOnly}
          />
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Summary
          <textarea
            name="summary"
            rows={3}
            defaultValue={story?.summary ?? ""}
            readOnly={readOnly}
            className="rounded-xl border px-3 py-3 text-sm"
            placeholder="One short paragraph summarizing the story."
          />
        </label>
        <Field
          label="Reading time in minutes (optional)"
          name="reading_minutes"
          defaultValue={story?.reading_minutes?.toString()}
          readOnly={readOnly}
          type="number"
          placeholder="Auto-calculated if blank"
        />
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Story body
          <textarea
            name="plain_text"
            rows={12}
            required
            defaultValue={story?.plain_text ?? ""}
            readOnly={readOnly}
            className="rounded-xl border px-3 py-3 text-sm leading-6"
            placeholder="Write the full story. Include who, what, where, why it matters, and any useful context."
          />
        </label>
        <Field
          label="Featured media ID (optional)"
          name="featured_media_id"
          defaultValue={story?.featured_media_id ?? ""}
          readOnly={readOnly}
        />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="show_contributor_name"
              type="checkbox"
              defaultChecked={story?.show_contributor_name ?? true}
              disabled={readOnly}
            />
            Show my name if published
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              name="consent_to_publish"
              type="checkbox"
              required
              defaultChecked={story?.consent_to_publish ?? true}
              disabled={readOnly}
            />
            I consent to publish this story after approval
          </label>
        </div>
        {message ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/story-contributor/stories"
            className="inline-flex min-h-11 items-center rounded-xl border px-5 text-sm font-bold"
          >
            Cancel
          </Link>
          {!readOnly ? (
            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={Boolean(saving)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 text-sm font-bold"
            >
              {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save draft
            </button>
          ) : null}
          {!readOnly && canSubmit ? (
            <button
              type="submit"
              name="intent"
              value="submit"
              disabled={Boolean(saving)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit for review
            </button>
          ) : null}
        </div>
      </form>
    </PageFrame>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  readOnly,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  readOnly?: boolean;
  type?: "text" | "number";
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-800">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        readOnly={readOnly}
        placeholder={placeholder}
        className="min-h-12 rounded-xl border px-3 text-sm"
      />
    </label>
  );
}

function formPayload(form: FormData): StorySubmissionPayload {
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const readingMinutes = Number(text("reading_minutes"));
  return {
    title: text("title"),
    summary: text("summary") || null,
    plain_text: text("plain_text"),
    rich_text: null,
    structured_content: null,
    related_links: [],
    featured_media_id: text("featured_media_id") || null,
    story_type: text("story_type") || "article",
    category: text("category") || null,
    reading_minutes: readingMinutes > 0 ? readingMinutes : null,
    contributor_affiliation_snapshot:
      text("contributor_affiliation_snapshot") || null,
    show_contributor_name: form.get("show_contributor_name") === "on",
    consent_to_publish: form.get("consent_to_publish") === "on",
  };
}

function workflowItem(story: Story): ContentWorkflowQueueItem {
  return {
    id: story.id,
    content_type: "stories",
    content_type_label: "Story",
    title: story.title,
    summary: story.summary,
    status: (story.workflow_status ?? story.status ?? "draft") as ContentWorkflowStatus,
    source_portal: "cocms",
    source_label: "CoCMS",
    owner_label: story.contributor_name_snapshot ?? "Story contributor",
    submitted_by_label: story.contributor_name_snapshot ?? "Story contributor",
    submitted_at: story.submitted_at,
    reviewer_label: "Unassigned",
    scheduled_publish_at: story.scheduled_publish_at,
    publication_target: "Main University Website",
    preview_path: `/stories/${story.slug}`,
    edit_path: `/story-contributor/stories/${story.id}`,
    workflow_action_path: `/api/v1/content-workflow/stories/${story.id}/{action}`,
    preview: {
      rich_text: story.rich_text,
      plain_text: story.plain_text,
      structured_content: story.structured_content,
      related_links: story.related_links ?? [],
      seo: {
        title: story.meta_title,
        description: story.meta_description,
        keywords: story.keywords,
      },
    },
  };
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "changes_requested"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : status === "rejected"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${className}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
