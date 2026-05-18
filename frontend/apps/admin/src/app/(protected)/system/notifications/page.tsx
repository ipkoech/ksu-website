"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth, usePermissions } from "@ksu/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardContent, CardHeader, CardTitle, FormDialog, Input, Label, PageHeader, Textarea } from "@ksu/ui/components";
import { canManageNotifications, canSendNotifications, canViewNotifications } from "../_lib/access";

type NotificationTemplate = {
  id: string;
  name: string;
  subject?: string;
  body?: string;
  channel?: string;
};

async function requestTemplates() {
  const response = await fetch("/api/admin/notifications", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load notification templates");
  return response.json();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const queryClient = useQueryClient();
  const canManage = canManageNotifications(user, hasScope);
  const canSend = canSendNotifications(user, hasScope);
  const canView = canViewNotifications(user, hasScope);
  const templates = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: requestTemplates,
    enabled: canView,
    select: (response) =>
      (response.data as Array<{
        id: string;
        name: string;
        subject_template?: string | null;
        message_template?: string | null;
        channels?: string[];
      }>).map((template) => ({
        id: template.id,
        name: template.name,
        subject: template.subject_template ?? undefined,
        body: template.message_template ?? undefined,
        channel: template.channels?.[0],
      })) as NotificationTemplate[],
  });
  const createTemplate = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", subject: "", body: "", channel: "email" });

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage reusable notification templates and send ad hoc announcements."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Notifications" }]}
        primaryAction={canManage ? { label: "New template", onClick: () => setOpen(true) } : undefined}
        secondaryActions={canSend ? [{ label: "Send notification", href: "/system/notifications/send" }] : undefined}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {!canView ? <p className="col-span-full text-sm text-muted-foreground">You can send notifications, but you do not have access to view templates.</p> : null}
        {(templates.data ?? []).map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{template.subject || "No subject"}</p>
              <p className="line-clamp-4 text-sm">{template.body || "No body provided."}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/system/notifications/send">Use template</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Create template"
        onSubmit={async () => {
          const code = form.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
          await createTemplate.mutateAsync({
            code: code || `template_${Date.now()}`,
            name: form.name,
            title_template: form.name,
            subject_template: form.subject || null,
            message_template: form.body,
            channels: [form.channel],
          });
          setOpen(false);
        }}
        isSubmitting={createTemplate.isPending}
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <Textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
        </div>
      </FormDialog>
    </div>
  );
}
