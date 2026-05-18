"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { useUsers } from "@ksu/api-client/hooks/admin";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageHeader, Textarea } from "@ksu/ui/components";
import { canSendNotifications } from "../../_lib/access";

export default function SendNotificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const users = useUsers({ page: 1, limit: 200 });
  const [form, setForm] = React.useState({
    recipients: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canSend = canSendNotifications(user, hasScope);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const emailToUserId = new Map((users.data?.data ?? []).map((user) => [user.email.toLowerCase(), user.id]));
      const recipientEmails = form.recipients.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
      const userIds = recipientEmails.map((email) => emailToUserId.get(email)).filter((value): value is string => Boolean(value));
      if (recipientEmails.length === 0 || userIds.length !== recipientEmails.length) {
        throw new Error("Every recipient must match an existing user email.");
      }
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: userIds,
          title: form.subject || "Notification",
          subject: form.subject,
          message: form.message,
          channels: ["in_app", "email"],
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: "Failed to send notification" }));
        throw new Error(body.detail || "Failed to send notification");
      }
      router.push("/system/notifications");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Send notification"
        description="Compose and send an operational notification to selected recipients."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Notifications", href: "/system/notifications" }, { label: "Send" }]}
        backHref="/system/notifications"
      />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Input value={form.recipients} onChange={(event) => setForm((current) => ({ ...current, recipients: event.target.value }))} placeholder="user@example.com, team@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="min-h-[220px]" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/system/notifications")}>Cancel</Button>
              <Button disabled={!canSend} onClick={() => void submit()} loading={isSubmitting}>Send notification</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
