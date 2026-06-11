"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareReply,
  type LucideIcon,
} from "lucide-react";
import {
  libraryServiceApi,
  type LibraryInquiryReplyPayload,
  type LibraryInquiryUpdatePayload,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { PageHeader } from "@/components/layout";

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Replied", value: "replied" },
  { label: "Closed", value: "closed" },
];

export default function LibraryInquiriesPage() {
  const queryClient = useQueryClient();
  const { hasScope } = usePermissions();
  const canManage =
    hasScope("library.manage_services") ||
    hasScope("library.manage_regulations") ||
    hasScope("library:write");
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const inquiriesQuery = useQuery({
    queryKey: ["library", "inquiries", statusFilter],
    queryFn: () =>
      libraryServiceApi.inquiries.list({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: 1,
        per_page: 100,
      }),
  });

  const inquiries = useMemo(
    () => inquiriesQuery.data?.data ?? [],
    [inquiriesQuery.data],
  );
  const selectedInquiry = useMemo(
    () =>
      inquiries.find((inquiry) => inquiry.id === selectedInquiryId) ??
      inquiries[0] ??
      null,
    [inquiries, selectedInquiryId],
  );

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: LibraryInquiryUpdatePayload;
    }) => libraryServiceApi.inquiries.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "inquiries"] });
      toast.success("Inquiry status updated");
    },
    onError: () => toast.error("Failed to update inquiry status"),
  });

  const reply = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: LibraryInquiryReplyPayload;
    }) => libraryServiceApi.inquiries.reply(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "inquiries"] });
      setReplyMessage("");
      toast.success("Reply saved and inquiry marked as replied");
    },
    onError: () => toast.error("Failed to save inquiry reply"),
  });

  const stats = {
    total: inquiries.length,
    open: inquiries.filter((item) => item.status === "open").length,
    replied: inquiries.filter((item) => item.status === "replied").length,
  };

  return (
    <div>
      <PageHeader
        title="Ask Librarian Inquiries"
        description="Review public Ask a Librarian submissions, update their status, and record staff replies."
        backHref="/library"
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Filtered inquiries"
            value={stats.total}
            icon={Mail}
          />
          <MetricCard title="Open" value={stats.open} icon={Clock3} />
          <MetricCard title="Replied" value={stats.replied} icon={CheckCircle2} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>
                    Public inquiries submitted from the library website.
                  </CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[190px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {inquiriesQuery.isLoading ? (
                <LoadingRows />
              ) : inquiriesQuery.isError ? (
                <p
                  role="status"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  Failed to load library inquiries.
                </p>
              ) : inquiries.length === 0 ? (
                <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  No inquiries match the selected status.
                </p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {inquiries.map((inquiry) => (
                    <button
                      key={inquiry.id}
                      type="button"
                      onClick={() => setSelectedInquiryId(inquiry.id)}
                      className={
                        selectedInquiry?.id === inquiry.id
                          ? "block w-full bg-primary/5 p-4 text-left"
                          : "block w-full p-4 text-left transition hover:bg-muted/40"
                      }
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{inquiry.subject}</p>
                        <StatusBadge status={inquiry.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {inquiry.sender_name} · {inquiry.sender_email}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {inquiry.message}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inquiry details</CardTitle>
              <CardDescription>
                Update status or record the reply sent to the requester.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedInquiry ? (
                <div className="space-y-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {selectedInquiry.subject}
                      </h2>
                      <StatusBadge status={selectedInquiry.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Submitted {formatDate(selectedInquiry.created_at)}
                    </p>
                  </div>

                  <dl className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                    <Meta label="Sender" value={selectedInquiry.sender_name} />
                    <Meta label="Email" value={selectedInquiry.sender_email} />
                    <Meta label="Phone" value={selectedInquiry.sender_phone} />
                    <Meta label="Library ID" value={selectedInquiry.library_id} />
                  </dl>

                  <section className="rounded-lg border p-4">
                    <h3 className="font-medium">Question</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {selectedInquiry.message}
                    </p>
                  </section>

                  {selectedInquiry.reply_message ? (
                    <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <h3 className="font-medium">Recorded reply</h3>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {selectedInquiry.reply_message}
                      </p>
                      {selectedInquiry.replied_at ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Replied {formatDate(selectedInquiry.replied_at)}
                        </p>
                      ) : null}
                    </section>
                  ) : null}

                  <div className="grid gap-4 rounded-lg border bg-background p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="inquiry-status">
                        Status
                      </label>
                      <Select
                        value={selectedInquiry.status}
                        disabled={!canManage || updateStatus.isPending}
                        onValueChange={(status) =>
                          updateStatus.mutate({
                            id: selectedInquiry.id,
                            payload: { status },
                          })
                        }
                      >
                        <SelectTrigger id="inquiry-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="reply-message">
                        Reply note
                      </label>
                      <textarea
                        id="reply-message"
                        value={replyMessage}
                        onChange={(event) => setReplyMessage(event.target.value)}
                        disabled={!canManage || reply.isPending}
                        rows={6}
                        className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Record the response sent to this requester."
                      />
                    </div>

                    {!canManage ? (
                      <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        You can view inquiries, but your current permissions do
                        not allow status changes or replies.
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      disabled={!canManage || reply.isPending || replyMessage.trim().length < 2}
                      onClick={() =>
                        reply.mutate({
                          id: selectedInquiry.id,
                          payload: { reply_message: replyMessage.trim() },
                        })
                      }
                      className="w-fit"
                    >
                      <MessageSquareReply className="mr-2 h-4 w-4" />
                      {reply.isPending ? "Saving reply..." : "Save reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  Select an inquiry from the inbox.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "open"
      ? "destructive"
      : status === "replied" || status === "closed"
        ? "default"
        : "secondary";

  return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>;
}

function Meta({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 break-words text-muted-foreground">{value}</dd>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "date unavailable";
  try {
    return new Intl.DateTimeFormat("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
