"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermissions } from "@ksu/auth";
import { useBroadcastNotification } from "@ksu/api-client/hooks/admin";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageHeader, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { MultiUserPicker } from "@/components/relationships";
import { canSendNotifications, canViewUsers } from "../../_lib/access";

export default function SendNotificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const broadcastNotification = useBroadcastNotification();
  const [form, setForm] = React.useState({
    user_ids: [] as string[],
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canSend = canSendNotifications(user, hasScope);
  const canSearchUsers = canViewUsers(user, hasScope);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (form.user_ids.length === 0) {
        throw new Error("Select at least one recipient.");
      }
      await broadcastNotification.mutateAsync({
        user_ids: form.user_ids,
        title: form.subject || "Notification",
        subject: form.subject,
        message: richTextToPlainText(form.message),
        channels: ["in_app", "email"],
      });
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
            {canSearchUsers ? (
              <MultiUserPicker
                label="Recipients"
                description="Search active users and choose recipients. The backend receives user records, not typed IDs."
                value={form.user_ids}
                filters={{ is_active: true }}
                onChange={(userIds) => setForm((current) => ({ ...current, user_ids: userIds }))}
              />
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Recipient search requires user read access.
              </p>
            )}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <RichTextEditor value={form.message} onChange={(message) => setForm((current) => ({ ...current, message }))} minHeight="260px" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/system/notifications")}>Cancel</Button>
              <Button disabled={!canSend || !canSearchUsers} onClick={() => void submit()} loading={isSubmitting}>Send notification</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
