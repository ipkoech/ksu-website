"use client";

import { useQuery } from "@tanstack/react-query";
import {
  contentWorkflowApi,
  type SchoolContentRecord,
  type SchoolContentType,
} from "@ksu/api-client";
import { AlertCircle, Clock3 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from "@ksu/ui/components";
import { useState } from "react";

export const LOCKED_SCHOOL_STATUSES = new Set([
  "submitted",
  "in_review",
  "approved",
  "published",
  "archived",
]);

export function ContentWorkflowPanel({
  contentType,
  record,
  canSubmit,
  busy,
  onAction,
}: {
  contentType: SchoolContentType;
  record: SchoolContentRecord;
  canSubmit: boolean;
  busy: boolean;
  onAction: (action: "submit" | "withdraw", comments: string) => Promise<void>;
}) {
  const [comments, setComments] = useState("");
  const status = String(record.workflow_status || record.status || "draft");
  const logsQuery = useQuery({
    queryKey: ["school-portal", "workflow-history", contentType, record.id],
    queryFn: async () =>
      (await contentWorkflowApi.logs(contentType as never, record.id)).data,
  });
  const canWithdraw = ["submitted", "in_review"].includes(status);
  const canSend = ["draft", "changes_requested"].includes(status);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">CoCMS workflow</CardTitle>
          <Badge variant={status === "changes_requested" ? "destructive" : "secondary"}>
            {status.replaceAll("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {record.revision_notes || record.rejection_reason ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Central review feedback</AlertTitle>
            <AlertDescription>
              {String(record.revision_notes || record.rejection_reason)}
            </AlertDescription>
          </Alert>
        ) : null}
        {canSubmit && (canSend || canWithdraw) ? (
          <div className="space-y-2">
            <Textarea
              aria-label="Workflow comments"
              placeholder="Optional note for the central communications reviewer"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
            />
            <Button
              variant={canWithdraw ? "outline" : "default"}
              disabled={busy}
              onClick={() => onAction(canWithdraw ? "withdraw" : "submit", comments)}
            >
              {canWithdraw ? "Withdraw submission" : "Submit to CoCMS"}
            </Button>
          </div>
        ) : null}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Workflow history</p>
          {logsQuery.data?.length ? (
            logsQuery.data.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{String(log.action).replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.comments || "No comment"} ·{" "}
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {logsQuery.isPending ? "Loading history…" : "No workflow events yet."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
