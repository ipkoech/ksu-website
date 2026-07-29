"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, MessageSquare, Send } from "lucide-react";
import {
  libraryServiceApi,
} from "@ksu/api-client";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { PageHeader } from "../../../../components/layout";

const statuses = ["awaiting_librarian", "assigned", "librarian_replied", "resolved", "closed"];

export function LibraryAssistantInboxClient() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("awaiting_librarian");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const query = useQuery({
    queryKey: ["library", "assistant", "conversations", status],
    queryFn: () => libraryServiceApi.assistant.staff.conversations.list({ status }),
  });
  const conversations = useMemo(() => query.data?.data ?? [], [query.data]);
  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId],
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      libraryServiceApi.assistant.staff.conversations.status(id, { status: nextStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "assistant", "conversations"] });
      toast.success("Conversation status updated");
    },
    onError: () => toast.error("Could not update conversation status"),
  });
  const replyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      libraryServiceApi.assistant.staff.conversations.reply(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "assistant", "conversations"] });
      setReply("");
      toast.success("Reply added to the conversation");
    },
    onError: () => toast.error("Could not add librarian reply"),
  });

  return (
    <div>
      <PageHeader
        title="Library Assistant Inbox"
        description="Take over verified AI conversations and reply in the same thread."
        backHref="/library"
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Visible threads" value={conversations.length} icon={MessageSquare} />
          <Metric label="Awaiting help" value={conversations.filter((item) => item.status === "awaiting_librarian").length} icon={Clock3} />
          <Metric label="Resolved" value={conversations.filter((item) => item.status === "resolved").length} icon={CheckCircle2} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div><CardTitle>Threads</CardTitle><CardDescription>Select a conversation to review.</CardDescription></div>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-xs">
                  {statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {query.isLoading ? <p className="text-sm text-muted-foreground">Loading threads…</p> : query.isError ? <p role="alert" className="text-sm text-destructive">Could not load assistant threads.</p> : conversations.length === 0 ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No threads match this status.</p> : <div className="divide-y rounded-md border">{conversations.map((conversation) => <button type="button" key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`block w-full p-4 text-left ${selected?.id === conversation.id ? "bg-primary/5" : "hover:bg-muted/40"}`}><div className="flex items-center justify-between gap-3"><span className="line-clamp-1 font-medium">{conversation.title ?? "Library question"}</span><StatusBadge status={conversation.status} /></div><span className="mt-1 block text-xs text-muted-foreground">{conversation.verified_email}</span><span className="mt-2 block line-clamp-2 text-sm text-muted-foreground">{conversation.messages?.at(-1)?.content ?? "No messages"}</span></button>)}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Conversation</CardTitle><CardDescription>Reply without breaking the user’s thread.</CardDescription></CardHeader>
            <CardContent>
              {selected ? <><div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4"><div><p className="font-medium">{selected.verified_email}</p><p className="text-sm text-muted-foreground">{selected.title ?? "Library question"}</p></div><select value={selected.status} onChange={(event) => statusMutation.mutate({ id: selected.id, nextStatus: event.target.value })} className="h-9 rounded-md border bg-background px-2 text-xs">{statuses.concat("active").map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></div><div className="max-h-[430px] space-y-5 overflow-y-auto pr-2">{selected.messages?.map((message) => <article key={message.id} className={`border-l-4 pl-4 ${message.sender_type === "librarian" ? "border-secondary" : message.sender_type === "assistant" ? "border-primary" : "border-muted"}`}><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{message.sender_type}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-7">{message.content}</p></article>)}</div><div className="mt-6 border-t pt-5"><label htmlFor="assistant-staff-reply" className="text-sm font-medium">Reply as the Library</label><Textarea id="assistant-staff-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={4} className="mt-2" placeholder="Write a clear, helpful response…" /><Button className="mt-3" disabled={!reply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate({ id: selected.id, content: reply.trim() })}><Send className="mr-2 h-4 w-4" />Send reply</Button></div></> : <p className="text-sm text-muted-foreground">Select a thread to review its messages.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof MessageSquare }) {
  return <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div><Icon className="h-5 w-5 text-primary" /></CardContent></Card>;
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "resolved" || status === "closed" ? "secondary" : "outline"}>{status.replaceAll("_", " ")}</Badge>;
}
