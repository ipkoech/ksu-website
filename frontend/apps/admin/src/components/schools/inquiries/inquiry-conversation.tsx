"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolInquiryStatus,
} from "@ksu/api-client";
import { AlertCircle, Loader2, RefreshCw, Send, StickyNote } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolTeamSelect } from "@/components/schools/shared/school-reference-selectors";

const STATUSES: SchoolInquiryStatus[] = [
  "new",
  "open",
  "in_progress",
  "waiting_for_requester",
  "replied",
  "resolved",
  "closed",
  "spam",
];

export function InquiryConversation({
  inquiryId,
  open,
  onOpenChange,
}: {
  inquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { school, can } = useSchoolPortal();
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState("");
  const inquiryQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.inquiries(school.id), inquiryId],
    queryFn: async () => (await schoolPortalApi.inquiries.get(inquiryId!)).data,
    enabled: Boolean(inquiryId && open),
  });
  const inquiry = inquiryQuery.data;
  useEffect(() => {
    setAssignee(inquiry?.assigned_to_user_id ?? "");
  }, [inquiry?.assigned_to_user_id]);
  const refresh = async () => { await inquiryQuery.refetch(); };
  const reply = useMutation({
    mutationFn: () => schoolPortalApi.inquiries.reply(inquiryId!, body, crypto.randomUUID()),
    onSuccess: async () => { setBody(""); await refresh(); },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to queue the reply."),
  });
  const note = useMutation({
    mutationFn: () => schoolPortalApi.inquiries.addNote(inquiryId!, body),
    onSuccess: async () => { setBody(""); await refresh(); },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to add the internal note."),
  });
  const statusMutation = useMutation({
    mutationFn: (status: SchoolInquiryStatus) => schoolPortalApi.inquiries.updateStatus(inquiryId!, status),
    onSuccess: refresh,
  });
  const assignMutation = useMutation({
    mutationFn: () => schoolPortalApi.inquiries.assign(inquiryId!, assignee || null),
    onSuccess: refresh,
  });
  const retry = useMutation({
    mutationFn: (messageId: string) => schoolPortalApi.inquiries.retryMessage(inquiryId!, messageId),
    onSuccess: refresh,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{inquiry?.subject || "Inquiry conversation"}</SheetTitle>
          <SheetDescription>
            {inquiry ? `${inquiry.reference_number} · ${inquiry.sender_name} · ${inquiry.sender_email}` : "Loading conversation…"}
          </SheetDescription>
        </SheetHeader>
        {inquiryQuery.error ? <Alert variant="destructive" className="mt-5"><AlertDescription>{inquiryQuery.error.message}</AlertDescription></Alert> : null}
        {error ? <Alert variant="destructive" className="mt-5"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert> : null}
        {inquiry ? (
          <div className="space-y-5 py-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={inquiry.status} disabled={!can("school.inquiries.manage")} onValueChange={(value) => statusMutation.mutate(value as SchoolInquiryStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquiry-assignee">Assigned team member</Label>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <SchoolTeamSelect
                      triggerId="inquiry-assignee"
                      valueMode="user"
                      value={assignee}
                      placeholder="Select assignee"
                      disabled={!can("school.inquiries.manage")}
                      onChange={(value) => setAssignee(value ?? "")}
                    />
                  </div>
                  <Button variant="outline" disabled={!can("school.inquiries.manage") || assignMutation.isPending} onClick={() => assignMutation.mutate()}>Assign</Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {inquiry.messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-lg border p-4 ${message.is_internal_note ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : message.sender_type === "requester" ? "mr-8 bg-muted/50" : "ml-8"}`}
                >
                  <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {message.is_internal_note ? <StickyNote className="size-4 text-amber-700" /> : null}
                      <strong className="text-sm">{message.is_internal_note ? "Internal note" : message.sender_name || message.sender_type}</strong>
                      <Badge variant="outline">{message.delivery_status}</Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</time>
                  </header>
                  <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                  {message.delivery_error ? <p className="mt-2 text-xs text-destructive">{message.delivery_error}</p> : null}
                  {["failed", "dead_lettered"].includes(message.delivery_status) && can("school.inquiries.reply") ? (
                    <Button size="sm" variant="outline" className="mt-3" disabled={retry.isPending} onClick={() => retry.mutate(message.id)}>
                      <RefreshCw className="mr-2 size-3" /> Retry delivery
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
            <Tabs defaultValue="reply">
              <TabsList><TabsTrigger value="reply">Reply</TabsTrigger><TabsTrigger value="note">Internal note</TabsTrigger></TabsList>
              <TabsContent value="reply" className="space-y-3 pt-3">
                <Textarea rows={7} placeholder="Write a plain-text reply to the requester" value={body} onChange={(event) => setBody(event.target.value)} />
                <Button disabled={!body.trim() || !can("school.inquiries.reply") || reply.isPending} onClick={() => reply.mutate()}>
                  {reply.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />} Queue reply
                </Button>
              </TabsContent>
              <TabsContent value="note" className="space-y-3 pt-3">
                <Textarea rows={7} placeholder="Add an internal note; it will not be sent to the requester" value={body} onChange={(event) => setBody(event.target.value)} />
                <Button variant="outline" disabled={!body.trim() || !can("school.inquiries.manage") || note.isPending} onClick={() => note.mutate()}>
                  <StickyNote className="mr-2 size-4" /> Add internal note
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : inquiryQuery.isPending ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
