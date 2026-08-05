"use client";

import { useEffect, useState } from "react";
import {
  contentWorkflowApi,
  storiesApi,
  type ContentWorkflowAction,
  type Story,
  type StoryContributorAccountRequest,
} from "@ksu/api-client";

type LoadState = "loading" | "ready" | "error";

export function CorporateStoriesClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [requests, setRequests] = useState<StoryContributorAccountRequest[]>(
    [],
  );
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");

  async function load() {
    setState("loading");
    try {
      const [storiesResponse, requestsResponse] = await Promise.all([
        storiesApi.listAdmin({ per_page: 20 }),
        storiesApi.listContributorAccountRequests({ per_page: 20 }),
      ]);
      setStories(storiesResponse.data ?? []);
      setRequests(requestsResponse.data ?? []);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function reviewRequest(id: string, action: "approve" | "reject") {
    setMessage("");
    try {
      if (action === "approve") {
        await storiesApi.approveContributorAccountRequest(id);
      } else {
        const rejection_reason = window.prompt("Reason for rejection") ?? "";
        await storiesApi.rejectContributorAccountRequest(id, {
          rejection_reason,
        });
      }
      await load();
      setMessage(`Contributor request ${action}d.`);
    } catch {
      setMessage("Unable to update contributor request.");
    }
  }

  async function runWorkflow(story: Story, action: ContentWorkflowAction) {
    setMessage("");
    try {
      await contentWorkflowApi.action(
        {
          id: story.id,
          content_type: "stories",
          content_type_label: "Story",
          title: story.title,
          status: story.workflow_status ?? "draft",
          source_portal: "cocms",
          source_label: "CoCMS",
          owner_label: story.contributor_name_snapshot ?? "Contributor",
          submitted_by_label: story.contributor_name_snapshot ?? "Contributor",
          reviewer_label: "Unassigned",
          publication_target: "Main University Website",
          edit_path: `/corporate-communication/stories`,
          workflow_action_path: `/api/v1/content-workflow/stories/${story.id}/{action}`,
          preview_path: `/stories/${story.slug}`,
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
        },
        action,
        {},
      );
      await load();
      setMessage(`Story ${action.replace("_", " ")} completed.`);
    } catch {
      setMessage("Unable to update story workflow.");
    }
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Corporate Communication
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Stories & contributor requests
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review account requests, monitor submitted stories, and move approved
          stories through the shared content workflow.
        </p>
        {message ? <p className="mt-3 text-sm font-medium">{message}</p> : null}
      </header>

      {state === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load stories. Confirm your CoCMS permissions and try again.
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Contributor account requests
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              External users must be approved before they can submit stories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="border-b py-3">Name</th>
                <th className="border-b py-3">Email</th>
                <th className="border-b py-3">Affiliation</th>
                <th className="border-b py-3">Status</th>
                <th className="border-b py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="border-b py-3 font-medium">
                    {request.full_name}
                  </td>
                  <td className="border-b py-3">{request.email}</td>
                  <td className="border-b py-3">
                    {request.affiliation ?? "—"}
                  </td>
                  <td className="border-b py-3">{request.status}</td>
                  <td className="border-b py-3 text-right">
                    {request.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void reviewRequest(request.id, "approve")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void reviewRequest(request.id, "reject")}
                          className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Story records</h2>
        <div className="mt-5 grid gap-3">
          {stories.map((story) => (
            <article
              key={story.id}
              className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {story.category || story.story_type} ·{" "}
                  {story.workflow_status ?? story.status}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  {story.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {story.summary || story.plain_text}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {(["start_review", "approve", "publish", "reject"] as const).map(
                  (action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => void runWorkflow(story, action)}
                      className="rounded-lg border px-3 py-2 text-xs font-bold capitalize"
                    >
                      {action.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
