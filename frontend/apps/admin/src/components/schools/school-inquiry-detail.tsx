"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Send, UserRound } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from "@ksu/ui/components";
import { schoolPortalApi, type SchoolInquiryStatus } from "@ksu/api-client";
import {
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "./shared/school-workspace";
import { SchoolTeamSelect } from "./shared/school-reference-selectors";
export function SchoolInquiryDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["school-inquiry", id],
    queryFn: async () => (await schoolPortalApi.inquiries.get(id)).data,
  });
  const status = useMutation({
    mutationFn: (value: SchoolInquiryStatus) =>
      schoolPortalApi.inquiries.updateStatus(id, value),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["school-inquiry", id] }),
  });
  const reply = useMutation({
    mutationFn: () =>
      schoolPortalApi.inquiries.reply(id, body.trim(), crypto.randomUUID()),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["school-inquiry", id] });
    },
  });
  const addNote = useMutation({
    mutationFn: () => schoolPortalApi.inquiries.addNote(id, note.trim()),
    onSuccess: () => { setNote(""); void qc.invalidateQueries({ queryKey: ["school-inquiry", id] }); },
  });
  const assign = useMutation({
    mutationFn: (value: string | null) => schoolPortalApi.inquiries.assign(id, value),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["school-inquiry", id] }),
  });
  if (q.isPending)
    return (
      <SchoolWorkspace>
        <p>Loading inquiry…</p>
      </SchoolWorkspace>
    );
  if (q.error || !q.data) return <SchoolWorkspace><p className="text-sm text-destructive">Unable to load this inquiry. Please try again.</p></SchoolWorkspace>;
  const data = q.data;
  const assignedValue = assignee ?? data.assigned_to_user_id ?? null;
  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Inquiries"
        title={data.subject ?? "Inquiry detail"}
        description="Review and respond within the authorized school scope."
        icon={MessageSquare}
        actions={<Button asChild variant="outline"><Link href="/schools/inquiries"><ArrowLeft className="mr-2 size-4" />Back to inbox</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {(data.messages ?? []).map((message) => (
                <div key={message.id} className={`rounded-lg border p-3 ${message.is_internal_note ? "border-amber-300 bg-amber-50/60 dark:bg-amber-950/20" : ""}`}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{message.is_internal_note ? "Internal note" : message.sender_name ?? message.sender_type}</span><span>{new Date(message.created_at).toLocaleString()}</span></div>
                  <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                </div>
              ))}
              {!data.messages?.length ? <p className="text-sm text-muted-foreground">No message content available.</p> : null}
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a reply"
            />
            <Button
              disabled={!body.trim() || reply.isPending}
              onClick={() => reply.mutate()}
            >
              <Send className="mr-2 size-4" />
              Send reply
            </Button>
            <div className="border-t pt-3">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note" />
              <Button className="mt-2" variant="outline" disabled={!note.trim() || addNote.isPending} onClick={() => addNote.mutate()}><MessageSquare className="mr-2 size-4" />Add internal note</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-3 rounded-md bg-muted/50 p-3 text-sm"><div className="flex items-center gap-2 font-medium"><UserRound className="size-4" />{data.sender_name}</div><p className="mt-1 text-xs text-muted-foreground">{data.sender_email}</p><p className="mt-2 text-xs text-muted-foreground">{data.reference_number} · {data.priority} priority</p></div>
            <div className="space-y-1.5"><p className="text-xs font-medium text-muted-foreground">Assigned to</p><SchoolTeamSelect triggerId="inquiry-assignee" valueMode="user" value={assignedValue ?? undefined} placeholder="Select assignee" onChange={(value) => { const next = value || null; setAssignee(next); assign.mutate(next); }} /></div>
            {(["open", "in_progress", "resolved"] as SchoolInquiryStatus[]).map(
              (v) => (
                <Button
                  key={v}
                  variant="outline"
                  className="w-full"
                  onClick={() => status.mutate(v)}
                >
                  {v.replace("_", " ")}
                </Button>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </SchoolWorkspace>
  );
}
