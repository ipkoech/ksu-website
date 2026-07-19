"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  centralInquiryApi,
  centralInquiryQueryKeys,
  type SchoolInquiryStatus,
} from "@ksu/api-client";
import {
  AlertCircle,
  Building2,
  Loader2,
  RefreshCw,
  Send,
  StickyNote,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
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

export function CentralInquiryConversation({
  inquiryId,
  open,
  onOpenChange,
}: {
  inquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState("");
  const inquiryQuery = useQuery({
    queryKey: centralInquiryQueryKeys.detail(inquiryId || ""),
    queryFn: async () => (await centralInquiryApi.get(inquiryId!)).data,
    enabled: Boolean(inquiryId && open),
  });
  const inquiry = inquiryQuery.data;

  async function refresh() {
    setError("");
    await Promise.all([
      inquiryQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: centralInquiryQueryKeys.all }),
    ]);
  }

  function mutationError(caught: unknown, fallback: string) {
    setError(caught instanceof Error ? caught.message : fallback);
  }

  const reply = useMutation({
    mutationFn: () =>
      centralInquiryApi.reply(inquiryId!, body.trim(), crypto.randomUUID()),
    onSuccess: async () => {
      setBody("");
      await refresh();
    },
    onError: (caught) => mutationError(caught, "Unable to queue the reply."),
  });
  const note = useMutation({
    mutationFn: () => centralInquiryApi.addNote(inquiryId!, body.trim()),
    onSuccess: async () => {
      setBody("");
      await refresh();
    },
    onError: (caught) => mutationError(caught, "Unable to add the internal note."),
  });
  const statusMutation = useMutation({
    mutationFn: (status: SchoolInquiryStatus) =>
      centralInquiryApi.updateStatus(inquiryId!, status),
    onSuccess: refresh,
    onError: (caught) => mutationError(caught, "Unable to update the status."),
  });
  const assignMutation = useMutation({
    mutationFn: () => centralInquiryApi.assign(inquiryId!, assignee || null),
    onSuccess: refresh,
    onError: (caught) => mutationError(caught, "Unable to update the assignee."),
  });
  const retry = useMutation({
    mutationFn: (messageId: string) =>
      centralInquiryApi.retryMessage(inquiryId!, messageId),
    onSuccess: refresh,
    onError: (caught) => mutationError(caught, "Unable to retry delivery."),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" aria-hidden />
          </div>
          <SheetTitle>{inquiry?.subject || "Inquiry conversation"}</SheetTitle>
          <SheetDescription>
            {inquiry
              ? `${inquiry.reference_number} · ${inquiry.sender_name} · ${inquiry.sender_email}`
              : "Loading conversation…"}
          </SheetDescription>
        </SheetHeader>

        {inquiryQuery.error ? (
          <Alert variant="destructive" className="mt-5">
            <AlertDescription>{inquiryQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" className="mt-5">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {inquiry ? (
          <div className="space-y-5 py-6">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Routed entity
              </p>
              <p className="mt-1 font-semibold">
                {inquiry.target_entity_name || "Kisii University"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {inquiry.target_entity_type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  Owner: {inquiry.owner_scope_type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {inquiry.category}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={inquiry.status}
                  onValueChange={(value) =>
                    statusMutation.mutate(value as SchoolInquiryStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="central-inquiry-assignee">
                  Assign to user ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="central-inquiry-assignee"
                    defaultValue={inquiry.assigned_to_user_id ?? ""}
                    onChange={(event) => setAssignee(event.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={assignMutation.isPending}
                    onClick={() => assignMutation.mutate()}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3" aria-label="Conversation messages">
              {inquiry.messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-lg border p-4 ${
                    message.is_internal_note
                      ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                      : message.sender_type === "requester"
                        ? "mr-5 bg-muted/50 sm:mr-10"
                        : "ml-5 sm:ml-10"
                  }`}
                >
                  <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {message.is_internal_note ? (
                        <StickyNote className="size-4 text-amber-700" />
                      ) : null}
                      <strong className="text-sm">
                        {message.is_internal_note
                          ? "Internal note"
                          : message.sender_name || message.sender_type}
                      </strong>
                      <Badge variant="outline">{message.delivery_status}</Badge>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </time>
                  </header>
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.body}
                  </p>
                  {message.delivery_error ? (
                    <p className="mt-2 text-xs text-destructive">
                      {message.delivery_error}
                    </p>
                  ) : null}
                  {["failed", "dead_letter"].includes(
                    message.delivery_status,
                  ) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      disabled={retry.isPending}
                      onClick={() => retry.mutate(message.id)}
                    >
                      <RefreshCw className="mr-2 size-3" />
                      Retry delivery
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>

            <Tabs defaultValue="reply">
              <TabsList>
                <TabsTrigger value="reply">Reply</TabsTrigger>
                <TabsTrigger value="note">Internal note</TabsTrigger>
              </TabsList>
              <TabsContent value="reply" className="space-y-3 pt-3">
                <Label htmlFor="central-inquiry-reply" className="sr-only">
                  Reply
                </Label>
                <Textarea
                  id="central-inquiry-reply"
                  rows={7}
                  placeholder="Write a plain-text reply to the requester"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
                <Button
                  disabled={!body.trim() || reply.isPending}
                  onClick={() => reply.mutate()}
                >
                  {reply.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  Queue reply
                </Button>
              </TabsContent>
              <TabsContent value="note" className="space-y-3 pt-3">
                <Label htmlFor="central-inquiry-note" className="sr-only">
                  Internal note
                </Label>
                <Textarea
                  id="central-inquiry-note"
                  rows={7}
                  placeholder="Add an internal note; it will not be sent"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={!body.trim() || note.isPending}
                  onClick={() => note.mutate()}
                >
                  <StickyNote className="mr-2 size-4" />
                  Add internal note
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : inquiryQuery.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
