"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Inbox, X } from "lucide-react";
import {
  storiesApi,
  type StoryContributorAccountRequest,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from "@ksu/ui/components";

const QUERY_KEY = ["stories", "contributor-account-requests"];

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Waiting for a decision", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Not approved", variant: "destructive" },
};

/**
 * Queue of contributor account requests: people asking for permission to
 * submit stories. Approve creates their contributor account; reject asks for
 * a reason that is emailed back to the requester.
 */
export function ContributorRequestsPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approveTarget, setApproveTarget] =
    useState<StoryContributorAccountRequest | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<StoryContributorAccountRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const requestsQuery = useQuery({
    queryKey: [...QUERY_KEY, statusFilter],
    queryFn: () =>
      storiesApi.listContributorAccountRequests({
        page: 1,
        per_page: 50,
        ...(statusFilter === "all" ? {} : { status: statusFilter }),
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (request: StoryContributorAccountRequest) =>
      storiesApi.approveContributorAccountRequest(request.id),
    onSuccess: (_result, request) => {
      toast.success(`${request.full_name} can now submit stories.`);
      setApproveTarget(null);
      return queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => toast.error("The request could not be approved. Try again in a moment."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      request,
      reason,
    }: {
      request: StoryContributorAccountRequest;
      reason: string;
    }) =>
      storiesApi.rejectContributorAccountRequest(request.id, {
        rejection_reason: reason,
      }),
    onSuccess: (_result, { request }) => {
      toast.success(`The request from ${request.full_name} was declined.`);
      setRejectTarget(null);
      setRejectionReason("");
      return queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => toast.error("The request could not be declined. Try again in a moment."),
  });

  const requests = requestsQuery.data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Contributor requests</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            People asking for permission to submit stories. Approving creates
            their contributor account.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pending">Waiting for a decision</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Not approved</SelectItem>
              <SelectItem value="all">All requests</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {requestsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : requestsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Contributor requests could not be loaded. Check the service
              connection and retry.
            </AlertDescription>
          </Alert>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border bg-muted/20 p-8">
            <EmptyState
              title="No requests here"
              description={
                statusFilter === "pending"
                  ? "New contributor requests from the public website will appear here."
                  : "No contributor requests match this filter."
              }
              icon={<Inbox className="size-5" />}
            />
          </div>
        ) : (
          <div className="divide-y rounded-2xl border bg-background">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold tracking-tight">{request.full_name}</p>
                    <Badge variant={STATUS_LABELS[request.status]?.variant ?? "outline"}>
                      {STATUS_LABELS[request.status]?.label ?? request.status}
                    </Badge>
                  </div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {[
                      request.email,
                      request.affiliation,
                      request.contributor_type?.replace(/_/g, " "),
                      `Requested ${new Date(request.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {request.reason_for_request ? (
                    <blockquote className="mt-2 rounded-md border-l-2 border-muted-foreground/30 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      {request.reason_for_request}
                    </blockquote>
                  ) : null}
                  {request.status === "rejected" && request.rejection_reason ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Declined: {request.rejection_reason}
                    </p>
                  ) : null}
                </div>
                {request.status === "pending" ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={approveMutation.isPending}
                      onClick={() => setApproveTarget(request)}
                    >
                      <Check data-icon="inline-start" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={rejectMutation.isPending}
                      onClick={() => {
                        setRejectionReason("");
                        setRejectTarget(request);
                      }}
                    >
                      <X data-icon="inline-start" />
                      Decline…
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open && !approveMutation.isPending) setApproveTarget(null);
        }}
        title="Approve this contributor?"
        description={
          approveTarget
            ? `${approveTarget.full_name} (${approveTarget.email}) will get a contributor account and can start submitting stories for review.`
            : "Approve this contributor request."
        }
        confirmLabel="Approve"
        onConfirm={async () => {
          if (!approveTarget) return;
          try {
            await approveMutation.mutateAsync(approveTarget);
          } catch {
            // handled by the mutation's onError toast
          }
        }}
        isLoading={approveMutation.isPending}
      />

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open && !rejectMutation.isPending) {
            setRejectTarget(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this request?</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `Tell ${rejectTarget.full_name} why the request is being declined. The reason is shared with them.`
                : "Decline this contributor request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="contributor-rejection-reason">Reason</Label>
            <Textarea
              id="contributor-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="e.g. We could not verify your affiliation with the university."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={rejectMutation.isPending}
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={() => {
                if (!rejectTarget) return;
                if (!rejectionReason.trim()) {
                  toast.error("Add a short reason so the requester knows what happened.");
                  return;
                }
                rejectMutation.mutate({
                  request: rejectTarget,
                  reason: rejectionReason.trim(),
                });
              }}
            >
              {rejectMutation.isPending ? "Declining…" : "Decline request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
